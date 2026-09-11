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
- 별도 서버·DB·API 키·환경 변수 파일은 필요하지 않습니다.
- 인증동네는 브라우저 localStorage에 저장됩니다. 다른 컴퓨터에서는 기본 관악구로 시작하며 프레임 밖 버튼에서 바꿀 수 있습니다.

## 이어서 개발하기

**[AGENTS.md](AGENTS.md) → [프로젝트 인계 문서](docs/PROJECT_CONTEXT.md)** 순서로 읽습니다.
현재 구현, 사용자 결정, 데이터 관계, 캡처 파일, 미구현 범위와 검증 방법을 저장소에 함께 보관합니다.
다른 컴퓨터에 기존 채팅이나 로컬 Obsidian이 없어도 이 문서를 기준으로 이어갈 수 있습니다.

새 작업에 전달할 문장:

> AGENTS.md와 docs/PROJECT_CONTEXT.md를 읽고 RE:carrot 작업을 이어가자. 현재 구현과 확정된 기준을 확인하고 로컬 프로토타입을 실행해줘.

## 개발 명령

```sh
npm run build
npm run lint
npm run preview
```

React 19, TypeScript, Vite, SEED Design을 사용합니다. 정확한 설치 버전은 package-lock.json을 따릅니다.
별도 test 스크립트는 없습니다. 변경에 맞는 빌드·린트 및 인계 문서의 수동 확인을 수행합니다.

기존 SEED/Figma 도구는 `npm run figma:export`, `npm run figma:check`로 실행하며
상세 사용법은 [figma-plugin/README.md](figma-plugin/README.md)를 참고합니다.
