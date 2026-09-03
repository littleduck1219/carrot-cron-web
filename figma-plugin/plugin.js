// Seed → Figma: 토큰을 Figma 변수/스타일로 만들고, 파운데이션과 컴포넌트 보드를 그린다.
// SEED_DATA는 빌드 시점(`npm run figma:export`)에 이 파일 위에 붙는다.

const PRIMITIVE_COLLECTION = "Seed Primitive";
const SEMANTIC_COLLECTION = "Seed Semantic";
const SCALE_COLLECTION = "Seed Scale";
const FONT_FAMILIES = ["Pretendard", "Pretendard Variable", "Inter", "Roboto"];
const WEIGHT_TO_STYLE = { regular: "Regular", medium: "Medium", bold: "Bold" };

// 루트 프레임 + 라벨만으로 그려지는 컴포넌트들. 축이 늘어나면 조합이 폭발하므로 직접 고른다.
const COMPONENT_SPECS = [
    { name: "ActionButton", key: "action-button", axes: ["variant", "size"], fixed: { layout: "withText" }, label: "버튼" },
    { name: "Badge", key: "badge", axes: ["tone", "variant"], fixed: { size: "medium" }, label: "Badge" },
    { name: "ActionChip", key: "action-chip", axes: ["size"], fixed: {}, label: "칩" },
    { name: "ControlChip", key: "control-chip", axes: ["size"], fixed: {}, label: "칩" },
];

const log = [];
const note = (line) => {
    log.push(line);
    figma.ui.postMessage({ type: "log", line });
};

/* 값 파싱 ------------------------------------------------------------------ */

function hexToRgba(hex) {
    let h = hex.trim().replace("#", "");
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    const n = (i) => Number.parseInt(h.slice(i, i + 2), 16) / 255;
    if (h.length < 6) return { r: 0, g: 0, b: 0, a: 1 };
    return { r: n(0), g: n(2), b: n(4), a: h.length >= 8 ? n(6) : 1 };
}

/** `var(--seed-color-bg-brand-solid)` → `bg/brand-solid` */
function colorNameFromCssVar(value) {
    const inner = value.slice(4, -1).trim().replace("--seed-color-", "");
    const group = inner.startsWith("palette-") ? "palette" : inner.split("-")[0];
    return group + "/" + inner.slice(group.length + 1);
}

/** `var(--seed-dimension-x4)` / `16px` / `7.5rem` → 숫자(px) */
function toPx(value) {
    if (value == null) return undefined;
    if (value.startsWith("var(")) {
        const inner = value.slice(4, -1).trim().replace("--seed-", "");
        for (const group of ["dimension", "radius", "font-size", "line-height", "font-weight"]) {
            if (!inner.startsWith(group + "-")) continue;
            const hit = SEED_DATA.scale[group + "/" + inner.slice(group.length + 1)];
            if (hit != null) return hit;
        }
        return undefined;
    }
    const n = Number.parseFloat(value);
    if (Number.isNaN(n)) return undefined;
    return value.endsWith("rem") ? n * 16 : n;
}

/* 변수 ---------------------------------------------------------------------- */

const variableByName = new Map(); // "컬렉션::이름" → Variable

function getCollection(name, modeNames) {
    let collection = figma.variables.getLocalVariableCollections().find((c) => c.name === name);
    if (!collection) collection = figma.variables.createVariableCollection(name);
    collection.renameMode(collection.modes[0].modeId, modeNames[0]);
    for (const modeName of modeNames.slice(1)) {
        if (!collection.modes.some((m) => m.name === modeName)) collection.addMode(modeName);
    }
    return collection;
}

function getVariable(collection, name, type) {
    const cacheKey = collection.name + "::" + name;
    if (variableByName.has(cacheKey)) return variableByName.get(cacheKey);
    let variable = figma.variables
        .getLocalVariables(type)
        .find((v) => v.variableCollectionId === collection.id && v.name === name);
    if (!variable) {
        try {
            variable = figma.variables.createVariable(name, collection, type);
        } catch (e) {
            variable = figma.variables.createVariable(name, collection.id, type);
        }
    }
    variableByName.set(cacheKey, variable);
    return variable;
}

const modeId = (collection, name) => collection.modes.find((m) => m.name === name).modeId;

function syncVariables() {
    const primitive = getCollection(PRIMITIVE_COLLECTION, ["Light", "Dark"]);
    const semantic = getCollection(SEMANTIC_COLLECTION, ["Light", "Dark"]);
    const scale = getCollection(SCALE_COLLECTION, ["Value"]);

    for (const [name, entry] of Object.entries(SEED_DATA.primitive)) {
        const variable = getVariable(primitive, name, "COLOR");
        for (const mode of ["light", "dark"]) {
            const raw = entry[mode].value || "#000";
            variable.setValueForMode(modeId(primitive, mode === "light" ? "Light" : "Dark"), hexToRgba(raw));
        }
    }
    note("프리미티브 컬러 " + Object.keys(SEED_DATA.primitive).length + "개");

    for (const [name, entry] of Object.entries(SEED_DATA.semantic)) {
        const variable = getVariable(semantic, name, "COLOR");
        for (const mode of ["light", "dark"]) {
            const target = modeId(semantic, mode === "light" ? "Light" : "Dark");
            const spec = entry[mode];
            if (spec.alias) {
                const source = getVariable(primitive, spec.alias, "COLOR");
                variable.setValueForMode(target, figma.variables.createVariableAlias(source));
            } else {
                variable.setValueForMode(target, hexToRgba(spec.value));
            }
        }
    }
    note("시맨틱 컬러 " + Object.keys(SEED_DATA.semantic).length + "개 (프리미티브에 alias)");

    for (const [name, value] of Object.entries(SEED_DATA.scale)) {
        getVariable(scale, name, "FLOAT").setValueForMode(modeId(scale, "Value"), value);
    }
    note("스케일 " + Object.keys(SEED_DATA.scale).length + "개");
}

const semanticColorVariable = (cssVar) => {
    const name = colorNameFromCssVar(cssVar);
    const collectionName = name.startsWith("palette/") ? PRIMITIVE_COLLECTION : SEMANTIC_COLLECTION;
    const collection = figma.variables.getLocalVariableCollections().find((c) => c.name === collectionName);
    if (!collection) return undefined;
    return figma.variables
        .getLocalVariables("COLOR")
        .find((v) => v.variableCollectionId === collection.id && v.name === name);
};

/* 폰트 / 텍스트 -------------------------------------------------------------- */

let FONT = { family: "Inter", styles: { regular: "Regular", medium: "Medium", bold: "Bold" } };

async function pickFont() {
    for (const family of FONT_FAMILIES) {
        const styles = {};
        for (const [weight, style] of Object.entries(WEIGHT_TO_STYLE)) {
            try {
                await figma.loadFontAsync({ family, style });
                styles[weight] = style;
            } catch (e) {
                /* 이 스타일은 없다 */
            }
        }
        if (Object.keys(styles).length === 3) {
            FONT = { family, styles };
            note("폰트: " + family);
            return;
        }
    }
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    FONT = { family: "Inter", styles: { regular: "Regular", medium: "Regular", bold: "Regular" } };
    note("폰트: Inter (Pretendard 미설치 — 나중에 교체하세요)");
}

function makeText(characters, { size = 14, weight = "regular", color, colorVar } = {}) {
    const node = figma.createText();
    node.fontName = { family: FONT.family, style: FONT.styles[weight] || FONT.styles.regular };
    node.fontSize = size;
    node.characters = characters;
    if (colorVar) {
        node.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", colorVar)];
    } else if (color) {
        node.fills = [{ type: "SOLID", color }];
    }
    return node;
}

function syncTextStyles() {
    const existing = figma.getLocalTextStyles();
    for (const [name, spec] of Object.entries(SEED_DATA.textStyles)) {
        const fontSize = SEED_DATA.scale["font-size/" + spec.fontSize];
        const lineHeight = SEED_DATA.scale["line-height/" + spec.lineHeight];
        if (!fontSize || !lineHeight) continue;
        const styleName = "Seed/" + name;
        const style = existing.find((s) => s.name === styleName) || figma.createTextStyle();
        style.name = styleName;
        style.fontName = { family: FONT.family, style: FONT.styles[spec.fontWeight] || FONT.styles.regular };
        style.fontSize = fontSize;
        style.lineHeight = { unit: "PIXELS", value: lineHeight };
    }
    note("텍스트 스타일 " + Object.keys(SEED_DATA.textStyles).length + "개");
}

/* 레이아웃 헬퍼 -------------------------------------------------------------- */

function autoFrame(name, direction, gap, padding = 0) {
    const frame = figma.createFrame();
    frame.name = name;
    frame.layoutMode = direction;
    frame.itemSpacing = gap;
    frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = padding;
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "AUTO";
    frame.fills = [];
    return frame;
}

function board(title, page, x, y) {
    const frame = autoFrame(title, "VERTICAL", 32, 48);
    frame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    frame.cornerRadius = 24;
    frame.x = x;
    frame.y = y;
    page.appendChild(frame);
    frame.appendChild(makeText(title, { size: 28, weight: "bold", color: { r: 0.1, g: 0.11, b: 0.13 } }));
    return frame;
}

function swatchGrid(names, collectionName) {
    const grid = autoFrame("swatches", "HORIZONTAL", 12);
    grid.layoutWrap = "WRAP";
    grid.counterAxisSizingMode = "FIXED";
    grid.resize(1080, 10);
    for (const name of names) {
        const collection = figma.variables.getLocalVariableCollections().find((c) => c.name === collectionName);
        const variable = figma.variables
            .getLocalVariables("COLOR")
            .find((v) => v.variableCollectionId === collection.id && v.name === name);
        const cell = autoFrame(name, "VERTICAL", 6);
        const chip = figma.createRectangle();
        chip.resize(120, 56);
        chip.cornerRadius = 8;
        chip.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.86, b: 0.88 } }];
        if (variable) {
            chip.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 1, g: 1, b: 1 } }, "color", variable)];
        }
        cell.appendChild(chip);
        cell.appendChild(makeText(name.split("/")[1], { size: 10, color: { r: 0.4, g: 0.42, b: 0.46 } }));
        grid.appendChild(cell);
    }
    return grid;
}

function section(parent, title) {
    const wrap = autoFrame(title, "VERTICAL", 16);
    wrap.appendChild(makeText(title, { size: 16, weight: "bold", color: { r: 0.33, g: 0.36, b: 0.42 } }));
    parent.appendChild(wrap);
    return wrap;
}

/* 파운데이션 보드 ------------------------------------------------------------ */

function drawFoundation() {
    const page = figma.createPage();
    page.name = "🌱 Foundation";

    const colorBoard = board("Color", page, 0, 0);
    const semanticNames = Object.keys(SEED_DATA.semantic);
    for (const group of ["bg", "fg", "stroke"]) {
        const names = semanticNames.filter((n) => n.startsWith(group + "/"));
        if (names.length) section(colorBoard, group).appendChild(swatchGrid(names, SEMANTIC_COLLECTION));
    }
    section(colorBoard, "palette").appendChild(swatchGrid(Object.keys(SEED_DATA.primitive), PRIMITIVE_COLLECTION));

    const typeBoard = board("Typography", page, 1400, 0);
    for (const [name, spec] of Object.entries(SEED_DATA.textStyles)) {
        const fontSize = SEED_DATA.scale["font-size/" + spec.fontSize];
        const lineHeight = SEED_DATA.scale["line-height/" + spec.lineHeight];
        if (!fontSize) continue;
        const row = autoFrame(name, "HORIZONTAL", 24);
        row.counterAxisAlignItems = "CENTER";
        const meta = makeText(name, { size: 12, color: { r: 0.53, g: 0.55, b: 0.58 } });
        meta.resize(160, meta.height);
        meta.textAutoResize = "HEIGHT";
        row.appendChild(meta);
        const sample = makeText("당근 알림을 예약해요 Aa 123", { size: fontSize, weight: spec.fontWeight, color: { r: 0.1, g: 0.11, b: 0.13 } });
        sample.lineHeight = { unit: "PIXELS", value: lineHeight };
        row.appendChild(sample);
        typeBoard.appendChild(row);
    }

    const scaleBoard = board("Scale", page, 2600, 0);
    for (const group of ["dimension", "radius"]) {
        const wrap = section(scaleBoard, group);
        for (const [name, value] of Object.entries(SEED_DATA.scale)) {
            if (!name.startsWith(group + "/")) continue;
            const row = autoFrame(name, "HORIZONTAL", 16);
            row.counterAxisAlignItems = "CENTER";
            const label = makeText(name.split("/")[1] + "  " + value + "px", { size: 12, color: { r: 0.4, g: 0.42, b: 0.46 } });
            label.resize(120, label.height);
            row.appendChild(label);
            const bar = figma.createRectangle();
            bar.resize(group === "radius" ? 64 : Math.max(value, 2), group === "radius" ? 64 : 16);
            bar.cornerRadius = group === "radius" ? value : 2;
            bar.fills = [{ type: "SOLID", color: { r: 1, g: 0.4, b: 0 } }];
            row.appendChild(bar);
            wrap.appendChild(row);
        }
    }
    note("Foundation 페이지를 그렸습니다");
    return page;
}

/* 컴포넌트 보드 -------------------------------------------------------------- */

/** `sizeMediumLayoutWithText` 같은 키가 현재 조합에 해당하는지 판단한다. */
function keyMatchesCombo(key, combo) {
    const axisNames = Object.keys(combo).sort((a, b) => b.length - a.length);
    let rest = key;
    while (rest.length) {
        const head = rest[0].toLowerCase() + rest.slice(1);
        const axis = axisNames.find((a) => head.startsWith(a));
        if (!axis) return false;
        const value = combo[axis];
        const pascal = value[0].toUpperCase() + value.slice(1);
        if (!head.slice(axis.length).startsWith(pascal)) return false;
        rest = head.slice(axis.length + pascal.length);
    }
    return true;
}

/** base + 조합에 해당하는 모든 variant 키의 `enabled` 스펙을 슬롯 단위로 병합한다. */
function resolveSpec(componentVars, combo) {
    const merged = {};
    for (const [key, states] of Object.entries(componentVars)) {
        if (key !== "base" && !keyMatchesCombo(key, combo)) continue;
        const slots = states.enabled;
        if (!slots) continue;
        for (const [slot, props] of Object.entries(slots)) {
            merged[slot] = Object.assign(merged[slot] || {}, props);
        }
    }
    return merged;
}

function buildVariant(spec, combo, labelText) {
    const root = spec.root || {};
    const label = spec.label || {};
    const component = figma.createComponent();
    component.name = Object.entries(combo)
        .map(([axis, value]) => axis[0].toUpperCase() + axis.slice(1) + "=" + value)
        .join(", ");
    component.layoutMode = "HORIZONTAL";
    component.primaryAxisSizingMode = "AUTO";
    component.counterAxisSizingMode = "AUTO";
    component.primaryAxisAlignItems = "CENTER";
    component.counterAxisAlignItems = "CENTER";

    const paddingX = toPx(root.paddingX) || 0;
    const paddingY = toPx(root.paddingY) || 0;
    component.paddingLeft = component.paddingRight = paddingX;
    component.paddingTop = component.paddingBottom = paddingY;
    component.itemSpacing = toPx(root.gap) || 0;
    component.cornerRadius = toPx(root.cornerRadius) || 0;
    const minHeight = toPx(root.minHeight);
    if (minHeight) {
        try {
            component.minHeight = minHeight;
        } catch (e) {
            /* 구버전 API */
        }
    }

    const fillVariable = root.color && root.color.startsWith("var(") ? semanticColorVariable(root.color) : undefined;
    if (fillVariable) {
        component.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 1, g: 1, b: 1 } }, "color", fillVariable)];
    } else {
        component.fills = [];
    }

    if (root.strokeColor) {
        const strokeVariable = semanticColorVariable(root.strokeColor);
        if (strokeVariable) {
            component.strokes = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", strokeVariable)];
            component.strokeWeight = toPx(root.strokeWidth) || 1;
        }
    }

    const weightPx = toPx(label.fontWeight);
    const weight = weightPx === 700 ? "bold" : weightPx === 500 ? "medium" : "regular";
    const text = makeText(labelText, {
        size: toPx(label.fontSize) || 14,
        weight,
        colorVar: label.color ? semanticColorVariable(label.color) : undefined,
        color: { r: 0.1, g: 0.11, b: 0.13 },
    });
    const lineHeight = toPx(label.lineHeight);
    if (lineHeight) text.lineHeight = { unit: "PIXELS", value: lineHeight };
    component.appendChild(text);
    return component;
}

function drawComponents() {
    const page = figma.createPage();
    page.name = "🧩 Components";
    let y = 0;

    for (const spec of COMPONENT_SPECS) {
        const componentVars = SEED_DATA.components[spec.key];
        const axisValues = SEED_DATA.axes[spec.key];
        if (!componentVars || !axisValues) {
            note("건너뜀: " + spec.name + " (스펙 없음)");
            continue;
        }
        const combos = [{}];
        const expanded = [];
        for (const axis of spec.axes) {
            const values = axisValues[axis] || [];
            while (combos.length) {
                const partial = combos.pop();
                for (const value of values) expanded.push(Object.assign({}, partial, { [axis]: value }));
            }
            combos.push(...expanded.splice(0));
        }

        const variants = combos.map((combo) => {
            const full = Object.assign({}, spec.fixed, combo);
            const node = buildVariant(resolveSpec(componentVars, full), combo, spec.label);
            page.appendChild(node);
            return node;
        });
        if (!variants.length) continue;

        const set = figma.combineAsVariants(variants, page);
        set.name = spec.name;
        set.layoutMode = "HORIZONTAL";
        set.layoutWrap = "WRAP";
        set.itemSpacing = 24;
        set.counterAxisSpacing = 24;
        set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 40;
        set.primaryAxisSizingMode = "FIXED";
        set.counterAxisSizingMode = "AUTO";
        set.resize(1200, set.height);
        set.x = 0;
        set.y = y;
        y += set.height + 80;
        note(spec.name + ": " + variants.length + "개 variant");
    }
    return page;
}

/* 엔트리 -------------------------------------------------------------------- */

figma.showUI(__html__, { width: 320, height: 420 });

figma.ui.onmessage = async (msg) => {
    try {
        await pickFont();
        if (msg.type === "variables" || msg.type === "all") syncVariables();
        if (msg.type === "styles" || msg.type === "all") syncTextStyles();
        if (msg.type === "foundation" || msg.type === "all") figma.currentPage = drawFoundation();
        if (msg.type === "components" || msg.type === "all") figma.currentPage = drawComponents();
        figma.ui.postMessage({ type: "done" });
        figma.notify("Seed 동기화 완료");
    } catch (error) {
        note("에러: " + error.message);
        figma.notify("실패: " + error.message, { error: true });
    }
};
