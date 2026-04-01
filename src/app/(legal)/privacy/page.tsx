import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 | ReviewHub',
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-sm max-w-none text-text-primary prose-headings:text-navy prose-a:text-accent-blue">
      <h1>개인정보처리방침</h1>
      <p className="text-text-secondary">최종 수정일: 2026년 4월 1일</p>

      <p>
        ReviewHub(이하 &ldquo;회사&rdquo;)는 이용자의 개인정보를 소중히 여기며, 관련 법령에 따라
        개인정보를 보호하고 있습니다. 본 개인정보처리방침은 회사가 제공하는 리뷰 관리 서비스
        이용과 관련하여 수집하는 개인정보의 처리에 관한 사항을 규정합니다.
      </p>

      <h2>1. 수집하는 개인정보</h2>
      <h3>필수 정보</h3>
      <ul>
        <li>이메일 주소, 이름 (회원가입 시)</li>
        <li>비즈니스 이름, 업종, 위치 (서비스 이용 시)</li>
        <li>결제 정보 (Stripe를 통해 처리, 카드 번호는 회사에 저장되지 않음)</li>
      </ul>
      <h3>자동 수집 정보</h3>
      <ul>
        <li>접속 IP, 브라우저 정보, 접속 시간</li>
        <li>쿠키 및 유사 기술을 통한 이용 패턴</li>
      </ul>
      <h3>제3자 플랫폼 연동 정보</h3>
      <ul>
        <li>Google Business Profile: OAuth 토큰, 비즈니스 리뷰 데이터</li>
        <li>Facebook/Meta: 페이지 액세스 토큰, 추천 데이터</li>
        <li>Yelp: API를 통한 리뷰 데이터</li>
        <li>WhatsApp Business: 메시지 발송 기록</li>
      </ul>

      <h2>2. 이용 목적</h2>
      <ul>
        <li>리뷰 통합 관리 서비스 제공</li>
        <li>WhatsApp을 통한 리뷰 요청 메시지 발송</li>
        <li>AI 기반 리뷰 답변 생성 (Anthropic API 활용)</li>
        <li>감성 분석 및 인사이트 제공</li>
        <li>서비스 개선 및 통계 분석</li>
        <li>고객 지원 및 공지사항 전달</li>
      </ul>

      <h2>3. 제3자 제공</h2>
      <p>회사는 다음 서비스 제공자에게 업무 처리를 위탁합니다:</p>
      <ul>
        <li><strong>Google</strong> — 비즈니스 리뷰 동기화</li>
        <li><strong>Meta (Facebook/WhatsApp)</strong> — 추천 동기화, 메시지 발송</li>
        <li><strong>Yelp</strong> — 리뷰 데이터 조회</li>
        <li><strong>Stripe</strong> — 결제 처리</li>
        <li><strong>Anthropic</strong> — AI 답변 생성, 감성 분석</li>
        <li><strong>Resend</strong> — 이메일 발송</li>
        <li><strong>Vercel</strong> — 호스팅 및 분석</li>
        <li><strong>Sentry</strong> — 오류 모니터링</li>
      </ul>

      <h2>4. 보관 기간</h2>
      <p>
        개인정보는 서비스 이용 기간 동안 보관되며, 계정 삭제 요청 시 30일 이내에 영구 삭제됩니다.
        단, 관련 법령에 따라 일정 기간 보관이 필요한 정보는 해당 기간 동안 별도 보관합니다.
      </p>

      <h2>5. 이용자의 권리</h2>
      <ul>
        <li><strong>열람권</strong> — 수집된 개인정보의 열람을 요청할 수 있습니다.</li>
        <li><strong>정정권</strong> — 부정확한 정보의 정정을 요청할 수 있습니다.</li>
        <li><strong>삭제권</strong> — 개인정보의 삭제를 요청할 수 있습니다.</li>
        <li><strong>이동권</strong> — 개인정보를 다른 서비스로 이전할 수 있습니다.</li>
        <li><strong>처리 제한권</strong> — 개인정보 처리의 제한을 요청할 수 있습니다.</li>
      </ul>
      <p>위 권리 행사는 Settings 페이지 또는 support@reviewhub.app으로 요청하실 수 있습니다.</p>

      <h2>6. 쿠키</h2>
      <p>
        본 서비스는 인증, 기능 제공, 분석 목적으로 쿠키를 사용합니다.
        자세한 내용은 <a href="/cookie">쿠키 정책</a>을 참고하세요.
      </p>

      <h2>7. 보안</h2>
      <p>
        회사는 SSL 암호화, 접근 제어, 정기적 보안 점검 등 기술적·관리적 보호 조치를 시행합니다.
        OAuth 토큰은 암호화되어 저장되며, 비밀번호는 bcrypt 해시로 저장됩니다.
      </p>

      <h2>8. 문의</h2>
      <p>
        개인정보 처리에 관한 문의: <a href="mailto:support@reviewhub.app">support@reviewhub.app</a>
      </p>
    </article>
  );
}
