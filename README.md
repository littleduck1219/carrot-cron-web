# RE:carrot

대한민국 당근 **모바일 앱**을 캡처 기준으로 재현하는 React 프로토타입입니다.
홈 피드부터 한 화면씩 구현하고, 재현 이후 기획 변경을 적용합니다.

## 다른 컴퓨터에서 시작하기

Git과 Node.js 22를 준비합니다. 기존 환경에서 검증한 Node 버전은 22.15.0입니다.

```sh
git clone https://github.com/littleduck1219/carrot-cron-web.git
cd carrot-cron-web
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

브라우저에서 http://127.0.0.1:5173/ 을 엽니다.
이미 복제한 폴더라면 작업 상태를 확인한 뒤 `git pull --ff-only`와 `npm ci`를 실행합니다.
Windows PowerShell에서 npm 실행 정책 오류가 나면 `npm.cmd`를 사용합니다.

- 홈: `/#/`
- 미개봉 백본원: `/#/product/backbone`
- 아주 귀한 따라큐: `/#/product/mimikyu`
- 기존 글쓰기: `/#/write` → 단일 가격 글을 기존 홈과 기존형 상세에 등록합니다.
- 신규 기획 글쓰기: `/#/planned/write` → 복수 물품 글을 신규 기획 홈과 선택형 상세에 등록합니다.
- 작성한 게시글·사진은 현재 브라우저의 IndexedDB에 저장됩니다. 새로고침 후 유지되지만 기기 간 동기화는 없습니다.
- 기획 버전에서 등록 글의 구매자는 물품·수량을 선택하고 공통 배송지·결제 직전 화면까지 진행할 수 있습니다. 캡처 재현용 배송비·수수료·적립을 표시하며 실제 결제 완료는 구현하지 않았습니다.
- 작성한 게시글은 브라우저 IndexedDB와 함께 개발 서버의 `data/posts.json`에도 저장됩니다(`/api/posts`, Git 제외). 서버 파일이 있으면 어느 브라우저에서 열어도 같은 게시글이 보입니다. 작성 게시글은 피드 항목과 상세 헤더의 ⋯ 메뉴에서 삭제할 수 있습니다.
- 채팅하기는 정적 채팅방을 엽니다. 인사 한 번과 “구매 가능할까요?”만 있으며 실제 전송은 구현하지 않았습니다. 배송지·결제·채팅은 상세 위에 오른쪽 슬라이드 인으로 겹칩니다.
- 별도 서버·DB 서비스·API 키·환경 변수 파일은 필요하지 않습니다.
- 배터리로 박경덕(서울특별시) ↔ 유주연(경상북도)을 전환합니다. 계정별 지역·거래 장소·수거지를 고정하고 바로구매는 다른 시·도일 때 질문하기로 표시합니다.

## 이어서 개발하기

**[AGENTS.md](AGENTS.md) → [프로젝트 인계 문서](docs/PROJECT_CONTEXT.md)** 순서로 읽습니다.
현재 구현, 사용자 결정, 데이터 관계, 캡처 파일, 미구현 범위와 검증 방법을 저장소에 함께 보관합니다. AI OS Wiki가 연결된 환경에서는 `📗 RE-carrot 현재 구현 및 인계 기준`을 최신 단일 기준으로 읽습니다.
다른 컴퓨터에 기존 채팅이나 로컬 Obsidian이 없어도 이 문서를 기준으로 이어갈 수 있습니다.

새 작업에 전달할 문장:

> AGENTS.md와 docs/PROJECT_CONTEXT.md를 읽고 RE:carrot 작업을 이어가자. 현재 구현과 확정된 기준을 확인하고 로컬 프로토타입을 실행해줘.

## 개발 명령

```sh
npm run build
npm run lint
npm run preview
node scripts/check-sale-items.ts
node scripts/check-publishing.ts
```

React 19, TypeScript, Vite, SEED Design을 사용합니다. 정확한 설치 버전은 package-lock.json을 따릅니다.
별도 test 스크립트는 없습니다. 변경에 맞는 빌드·린트 및 인계 문서의 수동 확인을 수행합니다.

기존 SEED/Figma 도구는 `npm run figma:export`, `npm run figma:check`로 실행하며
상세 사용법은 [figma-plugin/README.md](figma-plugin/README.md)를 참고합니다.
