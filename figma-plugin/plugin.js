// Seed → Figma: 토큰을 Figma 변수/텍스트 스타일로 만들고, 문서형 보드를 그린다.
// SEED_DATA는 빌드 시점(`npm run figma:export`)에 이 파일 위에 붙는다.

const PRIMITIVE_COLLECTION = "Seed Primitive";
const SEMANTIC_COLLECTION = "Seed Semantic";
const SCALE_COLLECTION = "Seed Scale";
const FONT_FAMILIES = ["Pretendard", "Pretendard Variable", "Inter", "Roboto"];
const MONO_FAMILIES = ["Roboto Mono", "JetBrains Mono", "SF Mono", "Space Mono"];
const WEIGHT_TO_STYLE = { regular: "Regular", medium: "Medium", bold: "Bold" };

// 문서 보드 자체의 색 (Seed 토큰이 아니라 문서 UI의 색이다)
const UI = {
    canvas: hex("#FAFAFA"),
    card: hex("#FFFFFF"),
    border: hex("#E4E4E7"),
    divider: hex("#F1F1F3"),
    title: hex("#18181B"),
    body: hex("#3F3F46"),
    muted: hex("#71717A"),
    faint: hex("#A1A1AA"),
    accent: hex("#FF6600"),
};

const CARD_WIDTH = 1240;
const COLUMN_GAP = 80;

// 루트 프레임 + 라벨만으로 그려지는 컴포넌트들. 축이 늘어나면 조합이 폭발하므로 직접 고른다.
const COMPONENT_SPECS = [
    {
        name: "ActionButton",
        key: "action-button",
        axes: ["variant", "size"],
        fixed: { layout: "withText" },
        label: "버튼",
        description: "화면의 주요 액션. variant는 한 화면에 solid 계열 하나만 쓰는 것을 권장합니다.",
    },
    {
        name: "Badge",
        key: "badge",
        axes: ["tone", "variant"],
        fixed: { size: "medium" },
        label: "Badge",
        description: "상태나 속성을 나타내는 라벨. tone으로 의미를, variant로 강조 수준을 정합니다.",
    },
    {
        name: "ActionChip",
        key: "action-chip",
        axes: ["size"],
        fixed: { layout: "withText" },
        label: "칩",
        description: "목록 위에서 부가 액션을 여는 칩.",
    },
    {
        name: "ControlChip",
        key: "control-chip",
        axes: ["size"],
        fixed: { layout: "withText" },
        label: "칩",
        description: "필터처럼 선택 상태를 가지는 칩.",
    },
];

function hex(value) {
    let h = value.trim().replace("#", "");
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    const n = (i) => Number.parseInt(h.slice(i, i + 2), 16) / 255;
    if (h.length < 6) return { r: 0, g: 0, b: 0, a: 1 };
    return { r: n(0), g: n(2), b: n(4), a: h.length >= 8 ? n(6) : 1 };
}

const solid = (color) => [{ type: "SOLID", color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];

const note = (line) => figma.ui.postMessage({ type: "log", line });

/* 값 파싱 ------------------------------------------------------------------ */

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

const variableCache = new Map();

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
    if (variableCache.has(cacheKey)) return variableCache.get(cacheKey);
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
    variableCache.set(cacheKey, variable);
    return variable;
}

const collectionNamed = (name) => figma.variables.getLocalVariableCollections().find((c) => c.name === name);
const modeId = (collection, name) => collection.modes.find((m) => m.name === name).modeId;

function findColorVariable(tokenName) {
    const collection = collectionNamed(tokenName.startsWith("palette/") ? PRIMITIVE_COLLECTION : SEMANTIC_COLLECTION);
    if (!collection) return undefined;
    return figma.variables
        .getLocalVariables("COLOR")
        .find((v) => v.variableCollectionId === collection.id && v.name === tokenName);
}

function syncVariables() {
    const primitive = getCollection(PRIMITIVE_COLLECTION, ["Light", "Dark"]);
    const semantic = getCollection(SEMANTIC_COLLECTION, ["Light", "Dark"]);
    const scale = getCollection(SCALE_COLLECTION, ["Value"]);

    for (const [name, entry] of Object.entries(SEED_DATA.primitive)) {
        const variable = getVariable(primitive, name, "COLOR");
        variable.setValueForMode(modeId(primitive, "Light"), hex(entry.light.value || "#000"));
        variable.setValueForMode(modeId(primitive, "Dark"), hex(entry.dark.value || "#000"));
    }
    note("프리미티브 컬러 " + Object.keys(SEED_DATA.primitive).length + "개");

    for (const [name, entry] of Object.entries(SEED_DATA.semantic)) {
        const variable = getVariable(semantic, name, "COLOR");
        for (const mode of ["light", "dark"]) {
            const target = modeId(semantic, mode === "light" ? "Light" : "Dark");
            const spec = entry[mode];
            if (spec.alias) {
                variable.setValueForMode(target, figma.variables.createVariableAlias(getVariable(primitive, spec.alias, "COLOR")));
            } else {
                variable.setValueForMode(target, hex(spec.value));
            }
        }
    }
    note("시맨틱 컬러 " + Object.keys(SEED_DATA.semantic).length + "개 (프리미티브에 alias)");

    for (const [name, value] of Object.entries(SEED_DATA.scale)) {
        getVariable(scale, name, "FLOAT").setValueForMode(modeId(scale, "Value"), value);
    }
    note("스케일 " + Object.keys(SEED_DATA.scale).length + "개");
}

/* 폰트 / 텍스트 -------------------------------------------------------------- */

let FONT = { family: "Inter", styles: { regular: "Regular", medium: "Regular", bold: "Regular" } };
let MONO = null;

async function loadFamily(family) {
    const styles = {};
    for (const [weight, style] of Object.entries(WEIGHT_TO_STYLE)) {
        try {
            await figma.loadFontAsync({ family, style });
            styles[weight] = style;
        } catch (e) {
            /* 이 스타일은 없다 */
        }
    }
    return Object.keys(styles).length === 3 ? styles : null;
}

async function pickFonts() {
    for (const family of FONT_FAMILIES) {
        const styles = await loadFamily(family);
        if (styles) {
            FONT = { family, styles };
            break;
        }
    }
    for (const family of MONO_FAMILIES) {
        try {
            await figma.loadFontAsync({ family, style: "Regular" });
            MONO = { family, style: "Regular" };
            break;
        } catch (e) {
            /* 없으면 본문 폰트를 쓴다 */
        }
    }
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    note("폰트: " + FONT.family + (MONO ? " / " + MONO.family : ""));
}

function label(characters, options) {
    const o = options || {};
    const node = figma.createText();
    node.fontName = o.mono && MONO ? MONO : { family: FONT.family, style: FONT.styles[o.weight || "regular"] };
    node.fontSize = o.size || 13;
    node.characters = characters;
    node.fills = o.colorVar
        ? [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", o.colorVar)]
        : solid(o.color || UI.body);
    if (o.lineHeight) node.lineHeight = { unit: "PIXELS", value: o.lineHeight };
    if (o.width) {
        node.textAutoResize = "HEIGHT";
        node.resize(o.width, node.height);
    }
    return node;
}

function syncTextStyles() {
    const existing = figma.getLocalTextStyles();
    let count = 0;
    for (const [name, spec] of Object.entries(SEED_DATA.textStyles)) {
        if (name.indexOf("Static") !== -1) continue; // Figma에는 동적 스케일이 없어 중복이다
        const fontSize = SEED_DATA.scale["font-size/" + spec.fontSize];
        const lineHeight = SEED_DATA.scale["line-height/" + spec.lineHeight];
        if (!fontSize || !lineHeight) continue;
        const styleName = "Seed/" + name;
        const style = existing.find((s) => s.name === styleName) || figma.createTextStyle();
        style.name = styleName;
        style.fontName = { family: FONT.family, style: FONT.styles[spec.fontWeight] || FONT.styles.regular };
        style.fontSize = fontSize;
        style.lineHeight = { unit: "PIXELS", value: lineHeight };
        count += 1;
    }
    note("텍스트 스타일 " + count + "개");
}

/* 레이아웃 키트 -------------------------------------------------------------- */

function stack(name, direction, gap, padding) {
    const frame = figma.createFrame();
    frame.name = name;
    frame.layoutMode = direction;
    frame.itemSpacing = gap || 0;
    const p = padding || 0;
    frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = p;
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "AUTO";
    frame.fills = [];
    frame.clipsContent = false;
    return frame;
}

function fixedWidth(frame, width) {
    frame.counterAxisSizingMode = frame.layoutMode === "VERTICAL" ? "FIXED" : frame.counterAxisSizingMode;
    if (frame.layoutMode === "HORIZONTAL") frame.primaryAxisSizingMode = "FIXED";
    frame.resize(width, Math.max(frame.height, 1));
    return frame;
}

/** 문서 카드: 제목 + 설명 + 본문 슬롯 */
function card(title, description) {
    const node = stack(title, "VERTICAL", 24, 40);
    node.fills = solid(UI.card);
    node.cornerRadius = 16;
    node.strokes = solid(UI.border);
    node.strokeWeight = 1;
    fixedWidth(node, CARD_WIDTH);

    const header = stack("header", "VERTICAL", 6);
    header.appendChild(label(title, { size: 20, weight: "bold", color: UI.title }));
    if (description) header.appendChild(label(description, { size: 13, color: UI.muted, width: CARD_WIDTH - 80 }));
    node.appendChild(header);

    const body = stack("body", "VERTICAL", 0);
    fixedWidth(body, CARD_WIDTH - 80);
    node.appendChild(body);
    return { node: node, body: body };
}

function divider(width) {
    const line = figma.createRectangle();
    line.resize(width, 1);
    line.fills = solid(UI.divider);
    line.name = "divider";
    return line;
}

/** 열 너비가 고정된 표 한 줄 */
function row(cells, widths, options) {
    const o = options || {};
    const node = stack("row", "HORIZONTAL", 24, 0);
    node.paddingTop = node.paddingBottom = o.dense ? 8 : 12;
    node.counterAxisAlignItems = "CENTER";
    fixedWidth(node, CARD_WIDTH - 80);
    cells.forEach((cell, index) => {
        const holder = stack("cell", "HORIZONTAL", 8);
        holder.counterAxisAlignItems = "CENTER";
        if (widths[index]) fixedWidth(holder, widths[index]);
        if (cell) holder.appendChild(cell);
        node.appendChild(holder);
    });
    return node;
}

function tableHead(titles, widths) {
    const node = row(
        titles.map((t) => (t ? label(t.toUpperCase(), { size: 10, weight: "bold", color: UI.faint }) : null)),
        widths,
        { dense: true },
    );
    node.name = "head";
    return node;
}

function table(parent, titles, widths, rows) {
    const wrap = stack("table", "VERTICAL", 0);
    fixedWidth(wrap, CARD_WIDTH - 80);
    wrap.appendChild(tableHead(titles, widths));
    wrap.appendChild(divider(CARD_WIDTH - 80));
    rows.forEach((cells, index) => {
        wrap.appendChild(row(cells, widths));
        if (index < rows.length - 1) wrap.appendChild(divider(CARD_WIDTH - 80));
    });
    parent.appendChild(wrap);
    return wrap;
}

function subhead(parent, title) {
    const wrap = stack("subhead", "VERTICAL", 8);
    wrap.paddingTop = 24;
    wrap.appendChild(label(title, { size: 13, weight: "bold", color: UI.title }));
    parent.appendChild(wrap);
    return wrap;
}

/** 지정한 모드로 고정된 컨테이너 — Light/Dark를 나란히 보여줄 때 쓴다. */
function modeScope(collectionName, modeName) {
    const frame = stack("scope-" + modeName, "HORIZONTAL", 8);
    frame.counterAxisAlignItems = "CENTER";
    const collection = collectionNamed(collectionName);
    if (collection) {
        try {
            frame.setExplicitVariableModeForCollection(collection, modeId(collection, modeName));
        } catch (e) {
            try {
                frame.setExplicitVariableModeForCollection(collection.id, modeId(collection, modeName));
            } catch (e2) {
                /* 구버전 API — 값이 문서 기본 모드로 보인다 */
            }
        }
    }
    return frame;
}

function swatch(tokenName, modeName, size) {
    const collectionName = tokenName.startsWith("palette/") ? PRIMITIVE_COLLECTION : SEMANTIC_COLLECTION;
    const scope = modeScope(collectionName, modeName);
    const chip = figma.createRectangle();
    chip.resize(size || 36, size || 36);
    chip.cornerRadius = 8;
    chip.strokes = solid(UI.border);
    chip.strokeWeight = 1;
    const variable = findColorVariable(tokenName);
    if (variable) {
        chip.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 1, g: 1, b: 1 } }, "color", variable)];
    }
    scope.appendChild(chip);
    return scope;
}

/* Foundation ---------------------------------------------------------------- */

function colorCard(title, description, names, valueOf) {
    const built = card(title, description);
    const widths = [280, 150, 150, 260];
    const groups = {};
    for (const name of names) {
        const group = name.split("/")[1].split("-")[0];
        (groups[group] = groups[group] || []).push(name);
    }
    for (const [group, groupNames] of Object.entries(groups)) {
        subhead(built.body, group);
        table(
            built.body,
            ["token", "light", "dark", "alias / value"],
            widths,
            groupNames.map((name) => {
                const value = valueOf(name);
                const lightCell = swatch(name, "Light");
                lightCell.appendChild(label(value.light, { size: 11, mono: true, color: UI.muted }));
                const darkCell = swatch(name, "Dark");
                darkCell.appendChild(label(value.dark, { size: 11, mono: true, color: UI.muted }));
                return [
                    label(name, { size: 12, mono: true, color: UI.title }),
                    lightCell,
                    darkCell,
                    label(value.alias, { size: 11, mono: true, color: UI.faint }),
                ];
            }),
        );
    }
    return built.node;
}

function drawFoundation() {
    const page = figma.createPage();
    page.name = "🌱 Foundation";
    page.backgrounds = solid(UI.canvas);

    const columns = [[], [], []];
    const semanticNames = Object.keys(SEED_DATA.semantic);

    columns[0].push(
        colorCard(
            "Semantic Color",
            "역할로 이름 붙인 색. 화면에서는 이 토큰만 쓰고, 팔레트는 직접 참조하지 않습니다.",
            semanticNames,
            (name) => {
                const entry = SEED_DATA.semantic[name];
                return {
                    light: entry.light.resolved,
                    dark: entry.dark.resolved,
                    alias: entry.light.alias || entry.light.value,
                };
            },
        ),
    );

    columns[1].push(
        colorCard("Palette", "원시 색상 값. 시맨틱 토큰이 참조하는 원본입니다.", Object.keys(SEED_DATA.primitive), (name) => {
            const entry = SEED_DATA.primitive[name];
            return { light: entry.light.value, dark: entry.dark.value, alias: "—" };
        }),
    );

    // Typography
    const type = card("Typography", "textStyle 하나가 fontSize · lineHeight · fontWeight를 함께 정합니다.");
    const typeRows = [];
    for (const [name, spec] of Object.entries(SEED_DATA.textStyles)) {
        if (name.indexOf("Static") !== -1) continue;
        const fontSize = SEED_DATA.scale["font-size/" + spec.fontSize];
        const lineHeight = SEED_DATA.scale["line-height/" + spec.lineHeight];
        if (!fontSize) continue;
        typeRows.push([
            label(name, { size: 12, mono: true, color: UI.title }),
            label(fontSize + " / " + lineHeight + " · " + spec.fontWeight, { size: 11, mono: true, color: UI.muted }),
            label("당근 알림을 예약해요 Aa 123", {
                size: fontSize,
                weight: spec.fontWeight,
                color: UI.title,
                lineHeight: lineHeight,
            }),
        ]);
    }
    table(type.body, ["style", "size / line-height", "sample"], [200, 200, 560], typeRows);
    columns[2].push(type.node);

    // Scale
    for (const group of ["dimension", "radius"]) {
        const built = card(
            group === "dimension" ? "Spacing" : "Radius",
            group === "dimension" ? "4px 배수 스케일. 여백과 간격은 이 값만 씁니다." : "모서리 반경 스케일.",
        );
        const rows = [];
        for (const [name, value] of Object.entries(SEED_DATA.scale)) {
            if (!name.startsWith(group + "/")) continue;
            const preview = figma.createRectangle();
            if (group === "radius") {
                preview.resize(48, 48);
                preview.cornerRadius = value;
                preview.fills = solid(UI.divider);
                preview.strokes = solid(UI.accent);
                preview.strokeWeight = 1.5;
            } else {
                preview.resize(Math.max(value, 2), 16);
                preview.cornerRadius = 2;
                preview.fills = solid(UI.accent);
            }
            rows.push([
                label(name.split("/")[1], { size: 12, mono: true, color: UI.title }),
                label(value + "px", { size: 11, mono: true, color: UI.muted }),
                preview,
            ]);
        }
        table(built.body, ["token", "value", "preview"], [200, 120, 640], rows);
        columns[2].push(built.node);
    }

    layoutColumns(page, columns);
    note("Foundation 페이지를 그렸습니다");
    return page;
}

function layoutColumns(page, columns) {
    columns.forEach((cards, columnIndex) => {
        let y = 0;
        for (const node of cards) {
            page.appendChild(node);
            node.x = columnIndex * (CARD_WIDTH + COLUMN_GAP);
            node.y = y;
            y += node.height + COLUMN_GAP;
        }
    });
}

/* Components ---------------------------------------------------------------- */

/** `sizeMediumLayoutWithText` 같은 키가 현재 조합에 해당하는지 판단한다. */
function keyMatchesCombo(key, combo) {
    const axisNames = Object.keys(combo).sort((a, b) => b.length - a.length);
    let rest = key;
    while (rest.length) {
        const head = rest[0].toLowerCase() + rest.slice(1);
        const axis = axisNames.find((a) => head.indexOf(a) === 0);
        if (!axis) return false;
        const value = combo[axis];
        const pascal = value[0].toUpperCase() + value.slice(1);
        if (head.slice(axis.length).indexOf(pascal) !== 0) return false;
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
            merged[slot] = Object.assign({}, merged[slot], props);
        }
    }
    return merged;
}

function buildVariant(spec, combo, labelText) {
    const root = spec.root || {};
    const text = spec.label || {};
    const component = figma.createComponent();
    component.name = Object.entries(combo)
        .map(([axis, value]) => axis[0].toUpperCase() + axis.slice(1) + "=" + value)
        .join(", ");
    component.layoutMode = "HORIZONTAL";
    component.primaryAxisSizingMode = "AUTO";
    component.counterAxisSizingMode = "AUTO";
    component.primaryAxisAlignItems = "CENTER";
    component.counterAxisAlignItems = "CENTER";
    component.paddingLeft = component.paddingRight = toPx(root.paddingX) || 0;
    component.paddingTop = component.paddingBottom = toPx(root.paddingY) || 0;
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

    const fillVariable = root.color && root.color.indexOf("var(") === 0 ? findColorVariable(colorNameFromCssVar(root.color)) : undefined;
    component.fills = fillVariable
        ? [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 1, g: 1, b: 1 } }, "color", fillVariable)]
        : [];

    if (root.strokeColor) {
        const strokeVariable = findColorVariable(colorNameFromCssVar(root.strokeColor));
        if (strokeVariable) {
            component.strokes = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", strokeVariable)];
            component.strokeWeight = toPx(root.strokeWidth) || 1;
        }
    }

    const weightPx = toPx(text.fontWeight);
    component.appendChild(
        label(labelText, {
            size: toPx(text.fontSize) || 14,
            weight: weightPx === 700 ? "bold" : weightPx === 500 ? "medium" : "regular",
            lineHeight: toPx(text.lineHeight),
            colorVar: text.color ? findColorVariable(colorNameFromCssVar(text.color)) : undefined,
            color: UI.title,
        }),
    );
    return component;
}

function comboList(axisValues, axes) {
    let combos = [{}];
    for (const axis of axes) {
        const next = [];
        for (const partial of combos) {
            for (const value of axisValues[axis] || []) {
                next.push(Object.assign({}, partial, { [axis]: value }));
            }
        }
        combos = next;
    }
    return combos;
}

function drawComponents() {
    const page = figma.createPage();
    page.name = "🧩 Components";
    page.backgrounds = solid(UI.canvas);
    const cards = [];

    for (const spec of COMPONENT_SPECS) {
        const componentVars = SEED_DATA.components[spec.key];
        const axisValues = SEED_DATA.axes[spec.key];
        if (!componentVars || !axisValues) {
            note("건너뜀: " + spec.name + " (스펙 없음)");
            continue;
        }

        const built = card(spec.name, spec.description);
        const combos = comboList(axisValues, spec.axes);
        const variants = combos.map((combo) => {
            const node = buildVariant(resolveSpec(componentVars, Object.assign({}, spec.fixed, combo)), combo, spec.label);
            page.appendChild(node);
            return node;
        });

        const set = figma.combineAsVariants(variants, page);
        set.name = spec.name;
        set.layoutMode = "HORIZONTAL";
        set.layoutWrap = "WRAP";
        set.itemSpacing = 16;
        set.counterAxisSpacing = 16;
        set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 24;
        set.primaryAxisSizingMode = "FIXED";
        set.counterAxisSizingMode = "AUTO";
        set.counterAxisAlignItems = "CENTER";
        set.fills = solid(UI.canvas);
        set.cornerRadius = 12;
        set.resize(CARD_WIDTH - 80, Math.max(set.height, 1));
        built.body.appendChild(set);

        const axesLine = spec.axes.map((axis) => axis + ": " + (axisValues[axis] || []).join(" · ")).join("\n");
        const fixedLine = Object.entries(spec.fixed).map(([k, v]) => k + "=" + v).join(", ");
        const meta = stack("meta", "VERTICAL", 6);
        meta.paddingTop = 20;
        meta.appendChild(label(axesLine, { size: 11, mono: true, color: UI.muted, width: CARD_WIDTH - 80 }));
        if (fixedLine) meta.appendChild(label("고정: " + fixedLine, { size: 11, mono: true, color: UI.faint }));
        built.body.appendChild(meta);

        cards.push(built.node);
        note(spec.name + ": " + variants.length + "개 variant");
    }

    layoutColumns(page, [cards.slice(0, 2), cards.slice(2)]);
    return page;
}

/* 엔트리 -------------------------------------------------------------------- */

figma.showUI(__html__, { width: 320, height: 420 });

figma.ui.onmessage = async (msg) => {
    try {
        await pickFonts();
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
