# TIL

`sungjujjang/study` 저장소의 마크다운 기록을 읽어서 보여주는 TIL 웹 애플리케이션입니다.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui
- TanStack Query
- react-markdown + remark-gfm + rehype

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Environment

GitHub API의 비인증 요청 한도를 늘리려면 `.env`에 토큰을 설정합니다.

```bash
VITE_GITHUB_TOKEN=
```

토큰이 없으면 브랜치 트리 조회가 제한될 수 있으며, 이 경우 jsDelivr 또는 이전에 캐시된 목록을 사용합니다.

## Data

- 글 목록: GitHub commits/tree API
- 본문과 이미지: `raw.githubusercontent.com`, 실패 시 `cdn.jsdelivr.net`
- 캐시: localStorage
