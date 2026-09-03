# Seed → Figma

`@seed-design/css`의 토큰과 컴포넌트 스펙을 Figma 변수 · 텍스트 스타일 · 문서 보드로 옮기는 로컬 플러그인.

## 사용법

1. 데이터 생성 (`code.js`가 만들어집니다)

   ```bash
   npm run figma:export
   ```

2. Figma 데스크톱 앱 → `Plugins` → `Development` → `Import plugin from manifest…` → 이 폴더의 `manifest.json` 선택
3. 새 파일에서 플러그인 실행 → **전체 실행**

## 만들어지는 것

| 단계 | 결과 |
|---|---|
| ① 변수 | `Seed Primitive`(팔레트, Light/Dark) · `Seed Semantic`(bg·fg·stroke, 팔레트에 alias) · `Seed Scale`(dimension·radius·font-size·line-height·font-weight) |
| ② 텍스트 스타일 | `Seed/t5Medium` 형태로 45개 (`*Static*`은 Figma에 동적 스케일이 없어 제외) |
| ③ Foundation | Semantic Color · Palette · Typography · Spacing · Radius 카드 |
| ④ Components | `COMPONENT_SPECS`에 등록된 컴포넌트를 variant 조합으로 생성, 채움/테두리/글자색이 변수에 바인딩됨 |

## 컴포넌트 추가

`plugin.js`의 `COMPONENT_SPECS`에 한 줄 추가하면 됩니다. 축 목록은 `SEED_DATA.axes[key]`, 스펙은
`SEED_DATA.components[key]`에 이미 들어 있습니다 (seed 컴포넌트 210개 전부).

```js
{ name: "Chip", key: "chip", axes: ["size"], fixed: { layout: "withText" }, label: "칩" }
```

루트 프레임 + 라벨 구조가 아닌 컴포넌트(Callout, Switch, TextField 등)는 슬롯 배치가 달라
`buildVariant`를 따로 만들어야 합니다.

## seed 버전 올린 뒤

```bash
npm run figma:export && npm run figma:check
```

플러그인을 다시 실행하면 같은 이름의 변수·스타일을 덮어씁니다 (보드는 새로 그려집니다).
