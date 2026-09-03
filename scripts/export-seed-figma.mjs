// seed-design의 CSS 토큰 + 컴포넌트 스펙을 Figma 플러그인이 읽을 데이터로 추출한다.
// 실행: npm run figma:export  → figma-plugin/code.js 재생성
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssPkg = join(root, "node_modules/@seed-design/css");
const base = readFileSync(join(cssPkg, "base.css"), "utf8");
const all = readFileSync(join(cssPkg, "all.css"), "utf8");

/** 중첩 없는 선언 블록만 훑는다 (base.css의 토큰 블록은 모두 평평하다). */
function blocks(css) {
    return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
        selector: selector.trim(),
        decls: Object.fromEntries(
            [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]),
        ),
    }));
}

const all_blocks = blocks(base);
const find = (test) => all_blocks.find(test)?.decls ?? {};
const scaleDecls = find((b) => "--seed-dimension-x1" in b.decls);
const lightDecls = find((b) => b.selector.includes('color-mode="light-only"') && "--seed-color-fg-neutral" in b.decls);
const darkDecls = find((b) => b.selector.includes('color-mode="dark-only"') && "--seed-color-fg-neutral" in b.decls);

/** `--seed-color-bg-brand-solid` → `bg/brand-solid` */
function colorName(cssVar) {
    const rest = cssVar.replace("--seed-color-", "");
    const group = rest.startsWith("palette-") ? "palette" : rest.split("-")[0];
    return `${group}/${rest.slice(group.length + 1)}`;
}

const isAlias = (v) => v.startsWith("var(");
const aliasTarget = (v) => colorName(v.slice(4, -1).trim());

// 1. 컬러 --------------------------------------------------------------------
// 다크 블록은 라이트에서 달라지는 것만 재정의하므로, 라이트를 기본값으로 깔고 덮어쓴다.
const primitive = {};
const semantic = {};
for (const [cssVar, lightValue] of Object.entries(lightDecls)) {
    if (!cssVar.startsWith("--seed-color-")) continue;
    const darkValue = darkDecls[cssVar] ?? lightValue;
    const name = colorName(cssVar);
    const entry = {
        light: isAlias(lightValue) ? { alias: aliasTarget(lightValue) } : { value: lightValue },
        dark: isAlias(darkValue) ? { alias: aliasTarget(darkValue) } : { value: darkValue },
    };
    (name.startsWith("palette/") ? primitive : semantic)[name] = entry;
}

// 시맨틱 토큰의 최종 hex를 모드별로 미리 풀어둔다 (Figma 표에 값을 같이 적기 위해).
for (const entry of Object.values(semantic)) {
    for (const mode of ["light", "dark"]) {
        const spec = entry[mode];
        entry[mode].resolved = spec.value ?? primitive[spec.alias]?.[mode].value ?? "#000000";
    }
}

// 2. 숫자 스케일 -------------------------------------------------------------
const scale = {};
const scaleGroups = {
    dimension: /^--seed-dimension-(x[\w_]+)$/,
    radius: /^--seed-radius-(r[\w_]+|full)$/,
    "font-size": /^--seed-font-size-(t\d+)-static$/,
    "line-height": /^--seed-line-height-(t\d+)-static$/,
    "font-weight": /^--seed-font-weight-(\w+)$/,
};
for (const [cssVar, value] of Object.entries(scaleDecls)) {
    for (const [group, re] of Object.entries(scaleGroups)) {
        const hit = cssVar.match(re);
        if (!hit) continue;
        const px = Number.parseFloat(value);
        if (Number.isNaN(px)) continue; // radius/full 같은 비수치 값은 건너뛴다
        scale[`${group}/${hit[1]}`] = px;
    }
}

// 3. 텍스트 스타일 -----------------------------------------------------------
const textStyles = {};
for (const [, name, body] of all.matchAll(/\.seed-text--textStyle_(\w+)\s*\{([^}]*)\}/g)) {
    const pick = (prop) => body.match(new RegExp(`--seed-${prop}:\\s*var\\(--seed-${prop}-([\\w-]+)\\)`))?.[1];
    const fontSize = pick("font-size");
    const lineHeight = pick("line-height");
    const fontWeight = pick("font-weight");
    if (fontSize && lineHeight && fontWeight) textStyles[name] = { fontSize, lineHeight, fontWeight };
}

// 4. 컴포넌트 스펙 -----------------------------------------------------------
// vars/component/*.mjs 는 { variantKey: { state: { slot: { prop: value } } } } 형태다.
const componentDir = join(cssPkg, "vars/component");
const components = {};
for (const file of readdirSync(componentDir).filter((f) => f.endsWith(".mjs") && f !== "index.mjs")) {
    const key = file.replace(".mjs", "");
    const src = readFileSync(join(componentDir, file), "utf8");
    const literal = src.slice(src.indexOf("{", src.indexOf("export const vars"))).trim().replace(/;$/, "");
    try {
        components[key] = JSON.parse(literal);
    } catch {
        /* 형태가 다른 파일은 건너뛴다 */
    }
}

// 레시피에서 variant 축 목록을 가져온다 (레시피 자체는 CSS를 import 해서 node로 못 불러온다).
const axes = {};
const recipeDir = join(cssPkg, "recipes");
for (const file of readdirSync(recipeDir).filter((f) => f.endsWith(".mjs") && !f.includes("layered"))) {
    const src = readFileSync(join(recipeDir, file), "utf8");
    const literal = src.match(/VariantMap = ([\s\S]*?);\n/)?.[1];
    if (!literal) continue;
    try {
        axes[file.replace(".mjs", "")] = JSON.parse(literal);
    } catch {
        /* 슬롯 레시피는 형태가 달라 건너뛴다 */
    }
}

const data = { primitive, semantic, scale, textStyles, components, axes };

const banner = `// 자동 생성 파일 — 수정하지 말 것. \`npm run figma:export\`로 다시 만든다.\n`;
writeFileSync(
    join(root, "figma-plugin/code.js"),
    banner + `const SEED_DATA = ${JSON.stringify(data)};\n\n` + readFileSync(join(root, "figma-plugin/plugin.js"), "utf8"),
);

console.log(
    `primitive ${Object.keys(primitive).length} · semantic ${Object.keys(semantic).length} · scale ${Object.keys(scale).length} · textStyle ${Object.keys(textStyles).length} · component ${Object.keys(components).length}`,
);
