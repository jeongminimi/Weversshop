# Weversshop: AI Context Commerce

K-POP 팬 커머스 플랫폼(Weverse Shop)을 재해석한 포트폴리오 프로젝트입니다.
단순히 상품을 나열하는 대신, **n8n 자동화 파이프라인이 아티스트의 최신 뉴스 맥락을 분석하고, 사용자의 관심사에 맞춰 굿즈를 추천**하는 흐름을 React로 시각화했습니다.

- **배포:** https://jeongminimi.github.io/Weversshop
- **상세 제작 문서:** [docs/portfolio-build.md](docs/portfolio-build.md)

> 배포 사이트의 AI 기능은 n8n 서버가 https로 연결되어 있을 때만 동작합니다. 연결되지 않은 경우에는 기본 데이터(Fallback)가 표시됩니다.

## 핵심 기능

### 1. Algorithm's Choice: 맥락 + 개인화 굿즈 추천
- 아티스트의 최근 7일 기사에서 팬덤 접점 맥락(투어, 화보, 컴백 등)을 Gemini가 찾아 공식 굿즈와 1:1로 연결합니다.
- 여기에 **선택한 아티스트와 장바구니 내용**을 반영해 사용자마다 다른 순서와 추천 문구를 보여줍니다.
- 뉴스 맥락은 아티스트별로 하루 1회만 AI를 호출하고 캐시합니다. 개인화는 요청마다 AI 호출 없이 계산합니다.

### 2. 멤버 AI 뉴스 브리핑
- 멤버 카드를 열면 해당 멤버의 최근 30일 기사를 검색해 AI가 활동 태그, 헤드라인, 요약, 응원 문구를 생성합니다.
- 근거가 된 기사 3건(링크·언론사·날짜)을 함께 표시합니다.
- `날짜 + 아티스트 + 멤버` 기준으로 캐시해, 같은 날 같은 멤버는 AI를 다시 호출하지 않습니다.

### 3. 장애 대응
- n8n이나 AI가 실패해도 빈 화면 대신 규칙 기반 추천, 기사 제목 브리핑, 기본 프로필 브리핑 순으로 단계적으로 대체됩니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| Frontend | React 19, React Router 7, React-Bootstrap, react-icons |
| Automation | n8n (Webhook, Code, HTTP Request, Data Table, If) |
| AI / Data | Google Gemini 3.8 Flash, Google News RSS |
| Deploy | GitHub Pages (`gh-pages`) |

## 아키텍처

```
[React]                                [n8n]
Home.js ──POST /curation──────────▶ 사용자 신호 점수 → 맥락 캐시 조회
  (아티스트, 장바구니, 카탈로그)          ├ 적중 → 캐시 맥락
                                        └ 미적중 → News RSS → Gemini 맥락↔굿즈 매핑 → 캐시 저장
                                        → 개인화 재정렬 → 응답

ArtistDetail.js ──GET /member-news──▶ 브리핑 캐시 조회
  (아티스트, 멤버)                       ├ 적중 → 캐시 브리핑
                                        └ 미적중 → News RSS → Gemini 요약 → 응답 → 캐시 저장
```

## 실행 방법

### 1. 프론트엔드
```bash
npm install
npm start
```

### 2. 환경 변수
| 파일 | 용도 | 값 |
| --- | --- | --- |
| `.env.development.local` | `npm start` (git 제외) | `REACT_APP_N8N_BASE_URL=http://localhost:5678/webhook` |
| `.env` | `npm run build` / `deploy` | `REACT_APP_N8N_BASE_URL=https://<n8n 주소>/webhook` |

> Gemini API 키는 `.env`에 넣지 않습니다. React 환경 변수는 빌드 결과물에 그대로 노출되므로, 키는 n8n Credentials에만 등록합니다.

### 3. n8n 워크플로우
1. n8n **Credentials**에 `Google Gemini(PaLM) Api` 계정을 등록합니다. ([API 키 발급](https://aistudio.google.com/apikey))
2. `n8n/` 폴더의 워크플로우 3개를 **Import from File**로 가져옵니다.
3. `setup-cache-tables` 워크플로우를 한 번 실행해 캐시 테이블(`member_news_cache`, `daily_curation`)을 만듭니다.
4. `member-news`, `algorithm-choice` 워크플로우의 Gemini 노드에 계정을 연결하고 **Publish**합니다.

### 4. 배포
```bash
npm run deploy
```

## 폴더 구조

```
weversshop/
├── n8n/               # n8n 워크플로우 정의 (Import용)
├── docs/              # 제작 과정 문서
├── src/
│   ├── components/    # Navigation
│   ├── data/          # 아티스트·멤버·앨범·굿즈 카탈로그 JSON
│   └── pages/         # Home, ArtistDetail, AlbumDetail, Cart, Login
├── .env / .env.example
└── package.json
```

## 구동 화면

<img width="1707" height="960" alt="슬라이드1" src="https://github.com/user-attachments/assets/44b5eff3-91d0-498b-9f4a-20fc7791853d" />
<img width="1707" height="960" alt="슬라이드2" src="https://github.com/user-attachments/assets/f2b6791d-20ca-4314-bc3b-acc3cebd7cab" />
<img width="1707" height="960" alt="슬라이드3" src="https://github.com/user-attachments/assets/b13df9ac-75a3-4252-b30d-fc00a20e2ae6" />
<img width="1707" height="960" alt="슬라이드4" src="https://github.com/user-attachments/assets/8ec35259-4f2c-4adf-a148-8e82a75991aa" />
<img width="1707" height="960" alt="슬라이드5" src="https://github.com/user-attachments/assets/e3cd0e46-d92e-4497-a8a5-c66abc47cd44" />
<img width="1707" height="960" alt="슬라이드6" src="https://github.com/user-attachments/assets/ea70f386-3be1-4dab-bfa1-841b544d98da" />
<img width="1707" height="960" alt="슬라이드7" src="https://github.com/user-attachments/assets/299f623c-5905-4f39-b3da-6b1df5b529d4" />
<img width="1707" height="960" alt="슬라이드8" src="https://github.com/user-attachments/assets/f4166acf-d26d-4499-b4e5-b027348991de" />
<img width="1707" height="960" alt="슬라이드9" src="https://github.com/user-attachments/assets/82632377-d77f-44ef-87aa-ce48ddd1d872" />
<img width="1707" height="960" alt="슬라이드10" src="https://github.com/user-attachments/assets/7e366c15-eee4-4e34-9807-e4cecf5ba813" />
<img width="1707" height="960" alt="슬라이드11" src="https://github.com/user-attachments/assets/791c94d4-7350-403a-aad5-cbe8dede2693" />
<img width="1707" height="960" alt="슬라이드12" src="https://github.com/user-attachments/assets/4ca8e3c5-4ea9-4e4a-81f8-e5fa5131fbdc" />
<img width="1707" height="960" alt="슬라이드13" src="https://github.com/user-attachments/assets/4441d142-239e-4b7e-be19-6b37a72cd315" />
