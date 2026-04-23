# ReviewHub

중소 비즈니스를 위한 리뷰 통합 관리 SaaS. Google, Yelp, Facebook, WhatsApp 리뷰를 하나의 대시보드에서 모니터링·응답·분석합니다.

## 주요 기능

- **멀티플랫폼 리뷰 수집**: Google Business Profile, Yelp Fusion, Facebook Graph API
- **WhatsApp 리뷰 요청**: 고객에게 리뷰 링크 자동 발송 + 전송 상태 추적
- **AI 답변 생성**: Claude 기반 톤/길이 조절 답변 제안 (월 사용량 플랜별 제한)
- **감성 분석**: 리뷰 내용의 긍정/부정/중립 + 긴급도 자동 분류
- **경쟁사 벤치마킹**: Google Places로 경쟁사 평점 추적 + 스냅샷
- **QR 리뷰 키트**: 매장 비치용 QR 생성, 스캔 추적
- **플랜 기반 구독**: Stripe 연동, 14일 체험, FREE/STARTER/GROWTH/PRO
- **그로스 도구**: 초대 코드 베타, 레퍼럴 리워드, 드립 이메일 캠페인
- **관리자 대시보드**: 유저/대기열/피드백/초대 코드 관리 (`ADMIN_EMAILS` 기반)
- **다국어**: 한국어, 영어, 일본어, 중국어, 프랑스어, 스페인어

## 기술 스택

- **Framework**: Next.js 16.2 (App Router, RSC), React 19.2, TypeScript 5
- **DB**: PostgreSQL (Supabase), Prisma 7
- **Auth**: NextAuth 5 (beta) — email/password + Google OAuth
- **Payments**: Stripe
- **AI**: Anthropic Claude
- **Email**: Resend + React Email
- **i18n**: next-intl
- **Observability**: Sentry
- **Cron**: Vercel Cron
- **Testing**: Jest + React Testing Library

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env.local
```

필수 변수:
- `DATABASE_URL` — Supabase Transaction Pooler (6543)
- `DIRECT_URL` — Supabase Direct Connection (5432, 마이그레이션용)
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3001`

선택 변수(해당 기능을 사용할 때만 필요):
- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
- API: `GOOGLE_PLACES_API_KEY`, `YELP_API_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- WhatsApp: `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- Cron: `CRON_SECRET`
- Admin: `ADMIN_EMAILS` (콤마 구분, `/admin` 접근 허용)

### 3. 데이터베이스 마이그레이션

```bash
npm run db:push    # 스키마 동기화
npm run db:seed    # 샘플 데이터(옵션)
```

### 4. 개발 서버

```bash
npm run dev
```

http://localhost:3001

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | Next.js 개발 서버 |
| `npm run build` | 프로덕션 빌드 (`prisma generate` 포함) |
| `npm run start` | 프로덕션 서버 |
| `npm run test` | Jest 단위·컴포넌트 테스트 |
| `npm run test:watch` | 테스트 watch 모드 |
| `npm run test:coverage` | 커버리지 리포트 |
| `npm run db:push` | Prisma 스키마 DB에 푸시 |
| `npm run db:migrate` | 마이그레이션 생성·적용 |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | 시드 데이터 삽입 |

## 디렉터리 구조

```
src/
├─ app/                    # Next.js App Router
│  ├─ (app)/               # 인증 필요한 대시보드 라우트
│  │  ├─ dashboard/
│  │  ├─ reviews/
│  │  ├─ analytics/
│  │  ├─ review-requests/
│  │  └─ settings/
│  ├─ (legal)/             # 법적 문서 (privacy, terms, cookie)
│  ├─ admin/               # 관리자 전용 (ADMIN_EMAILS 게이트)
│  ├─ api/                 # API 라우트 (REST)
│  │  ├─ admin/            # 관리자 API (requireAdmin)
│  │  ├─ cron/             # Vercel Cron (verifyCronAuth)
│  │  ├─ stripe/           # 결제
│  │  └─ ...
│  ├─ blog/                # MDX 블로그
│  └─ r/[code], ref/[code] # QR/레퍼럴 단축 URL
├─ components/             # 재사용 컴포넌트
├─ lib/                    # 유틸/인프라 (env, auth, api, rateLimit, ...)
├─ services/               # 비즈니스 로직 계층 (prisma 호출)
├─ emails/                 # React Email 템플릿
├─ i18n/                   # 6개 언어 메시지
└─ generated/prisma/       # Prisma client (gitignored)
```

## 보안 가드

- **공개 엔드포인트 Rate Limit**: `/api/waitlist`, `/api/feedback`, `/api/auth/register` (in-memory, `src/lib/rateLimit.ts`)
- **관리자 엔드포인트**: `requireAdmin()` → `ADMIN_EMAILS` 이메일 allowlist (`src/lib/adminAuth.ts`)
- **Cron 인증**: `verifyCronAuth()` → `CRON_SECRET` 타이밍-세이프 비교 (`src/lib/cronAuth.ts`)
- **환경변수 검증**: 앱 부팅 시 필수 env 확인 (`validateEnv()`, `src/lib/env.ts`)

## Cron 작업

Vercel `vercel.json`에 등록:

| Path | Schedule | 목적 |
|---|---|---|
| `/api/cron/sync-google` | `*/30 * * * *` | Google 리뷰 동기화 |
| `/api/cron/sync-facebook` | `*/30 * * * *` | Facebook 리뷰 동기화 |
| `/api/cron/email-campaigns` | `0 0 * * *` | 드립 이메일 |
| `/api/cron/monthly-report` | `0 9 1 * *` | 월간 리포트 메일 |

추가 수동 트리거용(스케줄 없음): `sync-competitors`, `weekly-summary`, `process-deletions`.

## 배포

Vercel에 배포:

1. Vercel 프로젝트 연결
2. 환경변수를 Vercel Secrets로 등록 (`@database-url`, `@nextauth-secret` 등, `vercel.json` 참고)
3. Push → 자동 빌드·배포

## 테스트

```bash
npm test
```

현재: 26 suites / 200+ tests

## 참고

- `AGENTS.md` — Next.js 16 breaking changes 경고
- `CLAUDE.md` — Claude Code 에이전트 설정
- `node_modules/next/dist/docs/` — Next 16 현재 문서
