## 4. 제작

### 1단계: 기획 구체화 및 n8n 자동화 파이프라인 설계

프론트엔드 규모는 단순화하고, **n8n 자동화 파이프라인이 가공한 맥락 데이터(JSON)를 얼마나 매끄럽고 설득력 있게 시각화하는가**에 집중했습니다.

[n8n 데이터 파이프라인 설계] → [LLM 기반 맥락 추출 & JSON 정형화] → [React 컴포넌트 매핑 및 렌더링]

#### 1) 파이프라인 전체 구조

두 개의 n8n 워크플로우가 각각 하나의 화면 섹션을 담당합니다. 둘 다 **Cache-Aside 패턴**으로 AI 호출을 하루 단위로 제한합니다.

| 워크플로우 | 연결 화면 | 캐시 키 | AI 역할 |
| --- | --- | --- | --- |
| `member-news` | `ArtistDetail.js` 멤버 모달 | `date + artist + member` | 최신 기사 제목 → 활동 브리핑 요약 |
| `curation` | `Home.js` Algorithm's Choice | `date + artist` | 최신 기사 맥락 → 굿즈 1:1 매핑 |

```
[React] ──GET /webhook/member-news?artist=&member=──▶ [n8n member-news]
[React] ──POST /webhook/curation {artist, cart, catalog}──▶ [n8n curation]
                                     │
               ┌─────────────────────┴─────────────────────┐
               ▼                                           ▼
     [Data Table 캐시 조회]                       (Cache Miss 시)
     Hit ➜ 즉시 응답                    Google News RSS ➜ Code 정제 ➜ Gemini ➜ 검증
                                                ➜ 응답 ➜ (성공 결과만) 캐시 적재
```

- **AI 모델:** Google Gemini `gemini-3.8-flash`. n8n `HTTP Request` 노드로 `generateContent` API를 호출하고, `responseMimeType: application/json`으로 JSON 출력을 강제합니다. (초기 버전은 OpenAI Chat Model을 사용했으나 Gemini로 전환)
- **뉴스 소스:** Google News RSS (`when:30d` / `when:7d`로 기간 제한, 최신순 재정렬)
- **엔드포인트 관리:** 주소를 코드에 하드코딩하지 않고 `.env`의 `REACT_APP_N8N_BASE_URL`로 분리했습니다. 로컬 개발(`npm start`)은 `.env.development.local`의 로컬 n8n을 사용합니다.

#### 2) n8n 정제 JSON을 React로 전달하는 방식

| 방식 | 파이프라인 구성 | 장점 | 고려 사항 |
| --- | --- | --- | --- |
| **Webhook API 실시간 호출 (채택)** | React → n8n Webhook → (캐시 or LLM) → JSON 응답 | 실시간 데이터, 사용자 신호 반영 가능 | n8n이 https로 상시 접근 가능해야 함 (n8n Cloud / 터널 / 셀프 호스팅) |

n8n에 연결할 수 없는 환경(서버 중지, 네트워크 오류)에서도 화면이 비지 않도록 **프론트 Fallback**을 함께 설계했습니다. (3단계 참고)

---

### 2단계: React 구조 핵심

#### 1) 폴더 및 데이터 구조

```
weversshop/
├── n8n/                           # n8n 워크플로우 정의 (Import from File 용)
│   ├── setup-cache-tables.workflow.json   # 캐시 Data Table 생성 (1회 실행)
│   ├── member-news.workflow.json          # 멤버 뉴스 브리핑
│   └── algorithm-choice.workflow.json     # Algorithm's Choice 큐레이션
├── src/
│   ├── components/
│   │   └── Navigation.js          # 전역 상단 네비게이션 바 (GNB)
│   ├── data/
│   │   ├── artists.json           # 아티스트 메타데이터 (active 플래그 포함)
│   │   ├── members.json           # 멤버 프로필 (역할, 영문명, 설명, 이미지)
│   │   ├── best_albums.json       # 앨범 디스코그래피 데이터
│   │   ├── goods_catalog.json     # 공식 굿즈 카탈로그 (AI 추천 후보군)
│   │   ├── seventeen_curation.json# Algorithm's Choice Fallback 데이터
│   │   └── slider_items.json      # 메인 배너 데이터
│   ├── pages/
│   │   ├── Home.js                # 메인 피드 + Algorithm's Choice
│   │   ├── ArtistDetail.js        # 3D 멤버 휠 + 실시간 AI 뉴스 브리핑
│   │   ├── AlbumDetail.js         # 앨범 상세 + 장바구니 담기
│   │   ├── Cart.js                # 장바구니
│   │   └── Login.js               # 로그인
│   ├── App.js                     # 라우팅 (BrowserRouter basename)
│   └── ...
├── docs/
│   └── portfolio-build.md         # 제작 과정 문서 (본 문서)
├── .env                           # 배포용 n8n 주소 (REACT_APP_N8N_BASE_URL)
├── .env.example                   # 환경 변수 예시
├── .gitignore                     # Git 제외 목록 (.env.development.local 등)
├── package.json                   # 의존성 및 실행/배포 스크립트 (gh-pages)
└── README.md                      # 프로젝트 소개 및 구동 화면 캡처
```

#### 2) 디렉토리별 핵심 역할 및 데이터 연계

- **`n8n/`**: 백엔드 자동화 파이프라인을 코드와 함께 버전 관리합니다. n8n 화면에서 `Import from File`로 그대로 복원할 수 있습니다.
- **`data/`**
  - `artists.json` & `members.json`: 3D 캐러셀과 멤버 휠의 원천 데이터이며, n8n 요청 파라미터(`artist`, `member`)로 주입됩니다.
  - `goods_catalog.json`: AI 추천의 **후보군이자 마스터 데이터**입니다. AI는 상품 `id`와 추천 문구만 반환하고, 이미지·가격·구매 링크는 프론트가 이 카탈로그에서 조인합니다.
  - `seventeen_curation.json`: n8n 장애 시 Algorithm's Choice에 표시하는 Fallback 데이터입니다.
- **`pages/`**
  - `Home.js`: Algorithm's Choice에서 선택 아티스트·장바구니를 사용자 신호로 n8n에 전송합니다.
  - `ArtistDetail.js`: 멤버 모달 오픈 시 `member-news`를 호출해 AI 브리핑과 근거 기사를 렌더링합니다.

---

### 3단계: 섹션별 세부 설명

#### 1) 글로벌 헤더 (Navigation)

- **구성:** React-Bootstrap `Navbar`(sticky-top) 기반. 로고, 섹션 앵커 메뉴(Artists / Albums / AI Curation), 검색 입력, 알림 벨, 로그인 버튼.
- **구현 포인트**
  - 로고·Home은 `Nav.Link as={Link}`로 SPA 라우팅, 섹션 메뉴는 `#popular-star` 등 앵커로 이동합니다.
  - 알림 벨은 `useState`로 새 알림 점(●) 노출 상태를 관리하고, 클릭 시 읽음 처리합니다.
  - 로그인 버튼은 `useNavigate`로 `/login` 이동.
  - `App.js`의 `BrowserRouter basename={process.env.PUBLIC_URL}`로 GitHub Pages 서브 디렉터리 배포 시 라우팅 경로 충돌을 방지했습니다.

#### 2) 메인 비주얼 슬라이더 (Hero Banner)

- **구성:** React-Bootstrap `Carousel`(`interval={4500}`)로 앨범 릴리즈·투어·이벤트 배너를 자동 회전합니다. 자동 롤링, 좌우 컨트롤, 인디케이터는 Carousel 내장 기능을 사용했습니다.
- **구현 포인트**
  - 배경 이미지 경로는 `getAssetPath()`로 정규화해 로컬/배포 환경 모두에서 404를 방지합니다.
  - 이미지 위에 그라데이션 오버레이를 얹어 텍스트 가독성을 확보했습니다.
  - `Unfold the Story` 버튼은 현재 "준비 중" 안내를 띄우며, 스토리 뷰 페이지는 후속 과제입니다.

#### 3) 팬 소통 퀵 메뉴 (`quickMenus`)

- **구성:** LIVE 방송, 아티스트 피드, 공식 스케줄, 미디어, AI 큐레이션, 멤버십 전용의 6개 숏컷.
- **구현 포인트**
  - **데이터 주도 렌더링:** 아이콘·라벨·이동 대상을 객체 배열로 정의하고 `.map()`으로 렌더링해 마크업과 데이터를 분리했습니다.
  - **의도 기반 분기:** 하나의 클릭 핸들러에서 3가지 동작을 분기합니다.

    ```jsx
    onClick={() => {
      if (item.label === "AI 큐레이션") {
        const target = document.querySelector(item.link);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      } else if (item.label === "멤버십 전용") {
        navigate(item.link);
      } else {
        alert(`[${item.label}] 현재 서비스 준비 중입니다.`);
      }
    }}
    ```
- **n8n 연계:** "AI 큐레이션" 클릭 시 n8n 데이터가 렌더링되는 `#ai-curation`으로 스무스 스크롤합니다.

#### 4) 주간 트렌딩 아티스트 (`#popular-star`)

- **구성:** 아티스트 카드가 수평 트랙 위에서 회전하고, 중앙 카드가 확대 포커싱되는 3D 서큘러 캐러셀.
- **구현 포인트**
  - **외부 라이브러리 없는 3D 캐러셀:** 원형 인덱스 오프셋 연산으로 배치를 계산합니다.

    ```js
    let offset = idx - activeStarIdx;
    const total = artistsData.length;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    ```
  - **오프셋 기반 스타일:** `translateX(${offset * 300}px) scale(${isCenter ? 1.15 : 0.85})`, `zIndex`, `opacity`를 실시간 계산해 원근감을 표현합니다.
  - **오클릭 방지:** 시야 밖 카드(`Math.abs(offset) > 2`)는 `opacity: 0`, `pointerEvents: "none"` 처리.
  - **클릭 분기:** 사이드 카드는 중앙으로 회전, 중앙 카드는 `artist.active`에 따라 상세 페이지 이동 또는 준비 중 안내.
- **n8n 연계**
  - `artist.active` 플래그를 `Curation` / `Standby` 배지로 시각화합니다.
  - **중앙에 선택된 아티스트는 Algorithm's Choice의 사용자 신호로 전달**되어, 아티스트를 바꾸면 추천이 자동 갱신됩니다.

#### 5) 공식 앨범 디스코그래피 (`#best-album`)

- **구성:** 앨범 커버, 멀티 썸네일 콜라주, PICKUP/BENEFIT 뱃지, 가격을 갖춘 커머스 그리드.
- **구현 포인트**
  - 앨범 순회 안에서 `album.thumbs.map`, `album.badges.map`을 중첩 매핑해 복합 카드 UI를 구성했습니다.
  - `getAssetPath()`가 외부 URL, `data:` URI, 로컬 상대 경로를 판별하고 `PUBLIC_URL`을 조합해 배포 환경 이미지 깨짐을 방지합니다.
  - 뱃지 문자열(`PICKUP` / `BENEFIT`)에 따라 스타일을 조건부 적용합니다.
- **라우팅:** 카드 클릭 시 `/album/:id`로 이동하고, 상세 화면은 `useParams()`로 JSON과 매칭합니다. 상세 화면의 장바구니 담기는 `localStorage(contextverse_cart)`에 저장되며, **이 장바구니가 Algorithm's Choice의 개인화 신호**가 됩니다.

#### 6) 알고리즘 추천 MD (Algorithm's Choice, `#ai-curation`) ⭐ 핵심 쇼케이스

- **기능:** 아티스트의 최신 뉴스 맥락(투어, 화보, 컴백 등)을 AI가 굿즈와 연결하고, 여기에 **사용자의 장바구니와 선택 아티스트를 반영해 사용자마다 다른 순서와 문구로** 추천합니다.
- **구현 포인트**
  - **사용자 신호 전송:** 중앙 캐러셀 아티스트, `localStorage` 장바구니, 카탈로그 후보를 `POST` 본문으로 전송합니다.
  - **자동 재요청 + 경쟁 상태 방지:** 아티스트가 바뀌면 600ms 디바운스 후 재요청하고, 이전 요청은 `AbortController`로 취소합니다.
  - **`useCallback` 메모이제이션:** `fetchN8nCurationData`를 메모이제이션해 `useEffect` 의존성을 안정화했습니다.
  - **클라이언트 사이드 데이터 조인:** AI가 반환한 `id`를 `goodsCatalog`와 `find`로 매칭해 이미지·가격·구매 링크를 보강합니다. **카탈로그에 없는 id는 다른 상품으로 대체하지 않고 제외**해 잘못된 상품 노출을 막았습니다.
  - **Fallback:** 네트워크 오류나 빈 응답 시 `seventeen_curation.json`을 유지합니다.
  - **수동 동기화:** 새로고침 버튼(`FaSyncAlt`)이 `isLoading`과 연동되어 회전하고, 성공 시 동기화 시각을 갱신합니다.
- **n8n 연계:** `POST {REACT_APP_N8N_BASE_URL}/curation` → 응답의 `category_badge`, `headline`, `reason`, `source`를 카드에 바인딩합니다. (4단계 파이프라인 2)

#### 7) 미드 프로모션 배너

- **구성:** 팬사인회, 멤버십 선예매, AI 기능 업데이트 공지를 카드형으로 회전 노출합니다.
- **구현 포인트**
  - React-Bootstrap `Carousel`에 `pause="hover"`를 적용해 마우스 오버 시 일시 정지합니다.
  - 프로모션 객체의 `bgGradient`, `badgeColor`를 인라인 스타일과 Bootstrap 클래스로 주입합니다.
  - `promo.link`가 `#`으로 시작하면 앵커 스크롤, 아니면 `navigate()`로 분기합니다.

#### 8) 멤버 AI 뉴스 브리핑 (`ArtistDetail.js` 모달)

- **기능:** 멤버를 선택하면 해당 멤버의 최근 30일 기사를 AI가 요약한 브리핑과 **근거 기사 3건(링크·언론사·날짜)**을 보여줍니다.
- **구현 포인트**
  - **요청 취소:** 모달을 닫거나 멤버를 바꾸면 `AbortController`로 이전 요청을 취소해, 늦게 도착한 응답이 다른 멤버 화면을 덮어쓰지 않게 했습니다.
  - **타임아웃:** 기사 검색과 AI 요약(재시도 포함) 시간을 고려해 55초 타임아웃을 적용했습니다.
  - **Fallback:** n8n 실패 시 `members.json`의 역할·소개로 "기본 프로필 브리핑"을 생성해 에러 문구 대신 콘텐츠를 노출합니다.
  - **출처 표시:** `실시간 뉴스 브리핑 · n8n Gemini 분석`처럼 데이터 출처를 라벨에 표시합니다.

---

### 4단계: n8n 구조

#### (1) 파이프라인 1: 멤버별 온디맨드 뉴스 브리핑 (`member-news`)

**1. 기능 기획**

- **배경:** 모든 멤버의 브리핑을 매일 일괄 생성하면, 아무도 조회하지 않는 멤버까지 LLM을 호출해 비용이 낭비됩니다.
- **전략: On-Demand + Cache-Aside**
  - 사용자가 멤버 카드를 연 시점에만 파이프라인 실행
  - `date + artist + member` 복합 키로 하루 단위 캐시
  - 당일 첫 조회만 RSS 수집과 AI 호출, 이후는 캐시에서 응답

**2. 캐시 테이블 스키마 (`member_news_cache`, n8n Data Table)**

| Column | Type | 설명 | 예시 |
| --- | --- | --- | --- |
| `date` | String | 캐시 기준일 (한국 시간, YYYY-MM-DD) | `2026-10-29` |
| `artist` | String | 아티스트명 (괄호 영문명 제거) | `세븐틴` |
| `member` | String | 멤버명 | `에스쿱스` |
| `news_data` | String | 최종 브리핑 JSON 문자열 | `{"headline":...,"articles":[...]}` |

**3. 아키텍처**

```
[React] GET /webhook/member-news?artist=세븐틴&member=에스쿱스
   ▼
[Webhook] ➜ [Build News Query] 검색어·오늘 날짜(KST) 생성
   ▼
[Get Cached Briefing] date AND artist AND member (All Conditions, limit 1)
   ▼
[Cache Hit?]
 ├─ True ➜ [Restore Cached Briefing] ➜ [Respond (Cache Hit)]
 └─ False ➜ [Search Latest News] Google News RSS (when:30d)
            ➜ [Parse Articles] 중복·언론사 꼬리 제거, 최신순 정렬, 상위 8건
            ➜ [Summarize (Gemini)] 4개 필드 JSON 생성
            ➜ [Validate Briefing] 파싱·검증, 근거 기사 3건 첨부
            ➜ [Respond (Fresh)] 클라이언트 선 응답
            ➜ [Prepare Cache Row] AI 성공 결과만 통과
            ➜ [Insert Cache Row] 캐시 적재
```

**4. 안정성 및 예외 처리**

- **복합 키 캐시 격리:** `Must Match: All Conditions`로 날짜·아티스트·멤버가 모두 일치할 때만 캐시를 반환해, 다른 멤버 데이터가 섞이는 캐시 오염을 차단했습니다.
- **실패 결과 캐싱 금지:** AI 실패로 기사 제목 기반 대체 브리핑이 나간 경우 캐시에 저장하지 않습니다. 실패 결과가 하루 종일 고정되는 문제를 막습니다.
- **응답 노드 분리:** 캐시 적중 / 신규 생성 경로의 응답 노드를 물리적으로 분리하고, 신규 경로는 **선 응답 후 적재** 순서로 구성해 `Insert row`가 응답 데이터를 덮어쓰거나 중복 응답이 발생하는 문제를 피했습니다.
- **환각 억제:** 프롬프트에서 "기사 제목에 있는 사실만 사용, 일정·수치·발언 생성 금지"를 명시하고, 근거 기사 링크를 함께 반환해 사용자가 원문을 확인할 수 있게 했습니다.
- **AI 출력 방어:** `responseMimeType: application/json`으로 JSON을 강제하고, 그래도 섞일 수 있는 코드블록 백틱은 `.replace(/```json|```/g, '')`로 제거한 뒤 `JSON.parse`합니다.
- **응답 지연 대응:** `gemini-3.8-flash`는 기본 추론(thinking) 단계 때문에 15초를 넘기는 경우가 있어, 요약·매핑처럼 깊은 추론이 필요 없는 작업에는 `thinkingLevel: "low"`를 지정했습니다.
- **일시 장애 자동 재시도:** Gemini의 `503 high demand`나 타임아웃에 대비해 Gemini 노드에 자동 재시도(최대 2회, 2초 간격, 시도당 25초 제한)를 설정했습니다.
- **단계별 장애 격리:** RSS·Gemini 노드는 오류 시에도 다음 노드로 진행(`continueRegularOutput`)합니다. Gemini 실패 → 기사 제목 브리핑, 기사 없음 → 프론트 기본 프로필 브리핑으로 단계적으로 대체됩니다.
- **CORS:** Webhook 노드의 `Allowed Origins`를 설정해 GitHub Pages 도메인에서 호출할 수 있게 했습니다.

**5. 프론트 연동 규격**

- **Request:** `GET {REACT_APP_N8N_BASE_URL}/member-news?artist={아티스트}&member={멤버}`
- **Response:**

```json
{
  "activity_tag": "근황",
  "headline": "LA에서 포착된 여유로운 근황",
  "summary": "최근 LA 일정 중 근황이 전해졌고, 브랜드 콜라보 소식도 예고됐습니다.",
  "fan_cheer": "어디서든 빛나는 에스쿱스를 응원해요!",
  "source": "n8n Gemini 분석",
  "member": "에스쿱스",
  "articles": [
    { "title": "세븐틴 에스쿱스, LA 야간 거리에서 여유 만끽…", "link": "https://news.google.com/...", "source": "톱스타뉴스", "pubDate": "2026-10-03" }
  ],
  "cached": false
}
```

**6. 핵심 Code 노드: RSS 전처리 (`Parse Articles`)**

```js
const xml = typeof $json.data === 'string' ? $json.data : '';
// ...decode / pick 헬퍼 생략
for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
  const source = pick(m[1], 'source');
  let title = pick(m[1], 'title');
  if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
  if (!title || seen.has(title)) continue;   // 중복 제거
  // ...
}
// Google News는 관련도 순 → 최신순 재정렬
articles = articles.sort((a, b) => b.pubDate.localeCompare(a.pubDate)).slice(0, 8);
```

#### (2) 파이프라인 2: Algorithm's Choice (`curation`)

**1. 설계: 맥락 레이어(캐시) + 개인화 레이어(요청마다)**

| 레이어 | 실행 주기 | AI 호출 | 내용 |
| --- | --- | --- | --- |
| ① 맥락 레이어 | 아티스트별 하루 1회 | O (Gemini) | 최근 7일 기사에서 팬덤 접점 맥락(무대/투어, 공항/패션, 음반/포카, 멤버십)을 찾아 굿즈와 1:1 매핑 |
| ② 개인화 레이어 | 요청마다 | X | 맥락 순위 + 사용자 관심 점수(장바구니)로 재정렬, 개인화 문구 추가 |

- 맥락 결과에는 사용자 정보를 넣지 않아 **아티스트 단위로 안전하게 공유 캐시**할 수 있습니다.
- 개인화는 규칙 기반 Code 노드라 캐시와 결합해도 **모든 사용자가 같은 결과를 보지 않습니다.**

**2. 캐시 테이블 스키마 (`daily_curation`)**

| Column | Type | 설명 |
| --- | --- | --- |
| `date` | String | 캐시 기준일 (KST) |
| `artist` | String | 아티스트명 |
| `curation_data` | String | 맥락 매핑 결과 JSON (`headline`, `contextKeyword`, `contexts[]`) |

**3. 아키텍처**

```
[React] POST /webhook/curation { artist, artistId, cart[], catalog[] }
   ▼
[Webhook] ➜ [Build User Context] 장바구니 → 관심 카테고리 점수, 후보별 사용자 점수
   ▼
[Get Cached Context] date AND artist
   ▼
[Context Cached?]
 ├─ True ➜ [Restore Cached Context] ────────────────────────┐
 └─ False ➜ [Search Artist News] Google News RSS (when:7d)  │
            ➜ [Build Context Prompt] 기사 + 굿즈 후보(사용자 정보 제외)
            ➜ [Map Context to Goods (Gemini)]               │
            ➜ [Validate Context] 후보에 없는 id·중복 제거    │
               ├─────────────────────────────────────────────┤
               │                                             ▼
               │                                [Personalize Picks] 맥락 순위 + 사용자 점수
               │                                             ▼
               │                                [Return Curation]
               ▼
            [Prepare Context Cache] AI 성공 시만 ➜ [Insert Context Cache]
```

**4. 개인화 점수 규칙 (`Build User Context`)**

- 장바구니 상품명·특전 뱃지에서 관심 카테고리를 추정합니다. (`앨범/MINI/SET` → ALBUM, `POB/포토카드` → COLLECTION 등)
- 같은 카테고리에는 수량 × 2점, 함께 사기 좋은 카테고리(예: ALBUM → COLLECTION, CONCERT)에는 수량만큼 보너스를 줍니다.
- 이미 장바구니에 있는 상품은 제외합니다.
- 최종 순위 = 맥락 순위 점수 + 사용자 점수 × 2. 관심 카테고리와 일치하면 배지에 `· 맞춤`, 추천 이유에 장바구니 상품을 언급하는 문구를 추가합니다.

**5. 안정성**

- **ID 화이트리스트 검증:** AI가 반환한 id가 후보 목록에 없거나 중복이면 n8n(`Validate Context`)과 프론트(카탈로그 조인)에서 이중으로 제외합니다.
- **AI 실패 시:** 캐시에 저장하지 않고, 사용자 관심 점수 순 규칙 기반 추천으로 응답합니다. (`source: "n8n 규칙 기반 추천"`)
- **선 응답 후 적재:** 실행 순서상 `Personalize Picks → Return Curation`이 캐시 적재보다 먼저 실행됩니다.

**6. 프론트 연동 규격**

- **Request:** `POST {REACT_APP_N8N_BASE_URL}/curation`

```json
{
  "artist": "세븐틴 (SEVENTEEN)",
  "artistId": "seventeen",
  "cart": [{ "id": "a1", "title": "12th Mini Album", "quantity": 1, "badges": ["POB"] }],
  "catalog": [{ "id": "g4", "name": "PHOTOCARD SET", "category": "COLLECTION", "price": 15000 }]
}
```

- **Response:**

```json
{
  "headline": "투어 시즌 맞춤 큐레이션",
  "contextKeyword": "TOUR",
  "source": "n8n Gemini 분석",
  "cached": true,
  "signals": { "artist": "세븐틴", "cartCount": 1, "interest": { "ALBUM": 1, "COLLECTION": 1 } },
  "recommendedGoods": [
    { "id": "g4", "headline": "앨범과 함께 모으는 포토카드", "category_badge": "수집 · 맞춤", "reason": "컴백 소식과 함께... 장바구니의 '12th Mini Album'와(과) 함께 보기 좋아요." }
  ]
}
```

---

### 5단계: 성과 및 측정

> 아래 수치는 n8n **Executions** 탭의 실행 시간(Cache Miss 첫 호출 vs 같은 키 재호출)으로 실측해 기입합니다.

| 지표 | Cache Miss (첫 호출) | Cache Hit (재호출) | 비고 |
| --- | --- | --- | --- |
| member-news 응답 시간 | [측정 후 기입] | [측정 후 기입] | RSS + Gemini 생략 여부 |
| curation 응답 시간 | [측정 후 기입] | [측정 후 기입] | 개인화 레이어는 Hit에서도 실행 |
| LLM 호출 횟수 | 키당 하루 1회 | 0회 | member-news: 조회된 멤버만 / curation: 아티스트당 |

- **비용 구조:** LLM 호출 수는 방문자 수가 아니라 **"하루 동안 조회된 (아티스트, 멤버) 조합 수"**에 비례합니다. 세븐틴 13명을 매일 일괄 생성하는 방식과 비교하면, 실제로 조회된 멤버 수만큼만 호출합니다.
- **개인화와 캐시의 양립:** 맥락(공유)과 개인화(요청별)를 분리해, 캐시로 비용을 줄이면서도 사용자마다 다른 추천을 제공합니다.

### 6단계: 한계 및 후속 과제

- **카탈로그 범위:** 현재 `goods_catalog.json`은 세븐틴 상품 5종뿐이라, 다른 아티스트를 선택해도 세븐틴 굿즈가 후보가 됩니다. 아티스트별 상품과 `artist` 필드를 추가하면 워크플로우가 자동으로 후보를 필터링합니다.
- **기사 본문 미수집:** RSS 제목만 근거로 요약하므로 요약 깊이에 한계가 있습니다.
- **배포 환경:** GitHub Pages(https)에서 쓰려면 n8n이 https로 상시 접근 가능해야 합니다. (n8n Cloud / Cloudflare Tunnel / 셀프 호스팅)
- **미구현:** 스토리 뷰(`Unfold the Story`), 파이프라인 시각화 모달, 검색 기능은 후속 과제입니다.
