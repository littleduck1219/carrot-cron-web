// 토큰 해석 로직(축 조합 → 병합된 스펙 → px 값) 자체 점검. 실행: node scripts/check-figma-plugin.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const source = readFileSync(new URL("../figma-plugin/code.js", import.meta.url), "utf8");
const stub = { showUI() {}, ui: { onmessage: null, postMessage() {} }, variables: {}, notify() {} };
const load = new Function("figma", "__html__", source + "\nreturn { toPx, resolveSpec, keyMatchesCombo, SEED_DATA };");
const { toPx, resolveSpec, keyMatchesCombo, SEED_DATA } = load(stub, "");

assert.equal(toPx("var(--seed-dimension-x4)"), 16);
assert.equal(toPx("7.5rem"), 120);
assert.equal(toPx("2px"), 2);

assert.ok(keyMatchesCombo("sizeMediumLayoutWithText", { size: "medium", layout: "withText", variant: "ghost" }));
assert.ok(!keyMatchesCombo("sizeLargeLayoutWithText", { size: "medium", layout: "withText" }));
assert.ok(keyMatchesCombo("toneBrandVariantWeak", { tone: "brand", variant: "weak", size: "medium" }));

const button = resolveSpec(SEED_DATA.components["action-button"], {
    variant: "brandSolid",
    size: "medium",
    layout: "withText",
});
assert.equal(toPx(button.root.paddingX), 16);
assert.equal(toPx(button.root.paddingY), 10);
assert.equal(toPx(button.root.minHeight), 40);
assert.equal(toPx(button.root.cornerRadius), 8);
assert.equal(button.root.color, "var(--seed-color-bg-brand-solid)");
assert.equal(toPx(button.label.fontSize), 14);
assert.equal(toPx(button.label.fontWeight), 700);

const badge = resolveSpec(SEED_DATA.components.badge, { tone: "brand", variant: "weak", size: "medium" });
assert.equal(badge.root.color, "var(--seed-color-bg-brand-weak)");
assert.equal(badge.label.color, "var(--seed-color-fg-brand-contrast)");
assert.equal(toPx(badge.root.cornerRadius), 4);

// 시맨틱 토큰은 모두 팔레트로 풀려야 한다
for (const [name, entry] of Object.entries(SEED_DATA.semantic)) {
    for (const mode of ["light", "dark"]) {
        assert.match(entry[mode].resolved, /^#[0-9a-f]{3,8}$/i, name + " " + mode);
    }
}

console.log("ok — 토큰 해석 검증 통과");
