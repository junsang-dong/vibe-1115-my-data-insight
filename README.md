# MyDataInsight

CSV 파일을 업로드하면 GPT API로 자동 분석하고 차트로 시각화하는 React 웹앱입니다.

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 OpenAI API 키를 설정하세요:

```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 확인하세요.

## 📦 주요 기능

- **CSV 파일 업로드**: 드래그 앤 드롭 또는 클릭으로 CSV 파일 업로드
- **데이터 테이블**: 페이지네이션, 정렬, 검색, 컬럼 선택 기능
- **AI 분석**: GPT-4를 활용한 자동 데이터 분석 및 요약
- **차트 생성**: 막대, 선, 파이, 산점도 차트 생성 및 PNG 다운로드
- **질문 답변**: 데이터에 대한 자연어 질문 및 답변

## 🛠️ 기술 스택

- React 18 + Vite
- TypeScript
- Tailwind CSS
- Zustand (상태 관리)
- React Router v6
- Papaparse (CSV 파싱)
- Recharts (차트)
- OpenAI GPT-4 API

## 📁 프로젝트 구조

```
src/
├── components/     # React 컴포넌트
├── hooks/         # 커스텀 훅
├── store/         # Zustand 상태 관리
├── utils/         # 유틸리티 함수
├── types/         # TypeScript 타입 정의
└── pages/         # 페이지 컴포넌트
```

## 🔒 보안

- API 키는 `.env.local` 파일에만 저장하고 절대 커밋하지 마세요
- `.gitignore`에 `.env.local`이 포함되어 있습니다

## 📝 배포

Vercel에 배포할 경우:

1. GitHub에 프로젝트 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수에 `VITE_OPENAI_API_KEY` 추가
4. 배포 완료!

## 📄 라이선스

MIT

