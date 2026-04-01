import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '쿠키 정책 | ReviewHub',
};

export default function CookiePage() {
  return (
    <article className="prose prose-sm max-w-none text-text-primary prose-headings:text-navy prose-a:text-accent-blue">
      <h1>쿠키 정책</h1>
      <p className="text-text-secondary">최종 수정일: 2026년 4월 1일</p>

      <p>
        본 쿠키 정책은 ReviewHub(이하 &ldquo;서비스&rdquo;)가 쿠키 및 유사 기술을
        어떻게 사용하는지 설명합니다.
      </p>

      <h2>1. 쿠키란?</h2>
      <p>
        쿠키는 웹사이트 방문 시 브라우저에 저장되는 작은 텍스트 파일입니다.
        쿠키를 통해 웹사이트는 사용자의 설정을 기억하고 더 나은 경험을 제공할 수 있습니다.
      </p>

      <h2>2. 사용하는 쿠키 유형</h2>

      <h3>필수 쿠키</h3>
      <p>서비스 이용에 반드시 필요한 쿠키입니다. 비활성화할 수 없습니다.</p>
      <ul>
        <li><strong>인증 쿠키</strong> — 로그인 상태 유지 (NextAuth 세션)</li>
        <li><strong>CSRF 토큰</strong> — 보안을 위한 요청 검증</li>
        <li><strong>쿠키 동의</strong> — 사용자의 쿠키 설정 기억</li>
      </ul>

      <h3>기능 쿠키</h3>
      <p>사용자 환경을 개선하기 위한 쿠키입니다.</p>
      <ul>
        <li><strong>테마 설정</strong> — 다크/라이트 모드 선택 기억</li>
        <li><strong>활성 비즈니스</strong> — 마지막으로 선택한 비즈니스 기억</li>
      </ul>

      <h3>분석 쿠키</h3>
      <p>서비스 이용 패턴을 분석하여 개선에 활용합니다. 동의 후 활성화됩니다.</p>
      <ul>
        <li><strong>Vercel Analytics</strong> — 페이지 방문 통계</li>
        <li><strong>Sentry</strong> — 오류 추적 및 성능 모니터링</li>
      </ul>

      <h2>3. 쿠키 관리</h2>
      <p>
        서비스 하단의 쿠키 배너를 통해 분석 쿠키의 수집을 거부할 수 있습니다.
        브라우저 설정에서도 쿠키를 관리하거나 삭제할 수 있습니다.
      </p>
      <p>
        쿠키를 비활성화하면 서비스의 일부 기능이 제한될 수 있습니다.
      </p>

      <h2>4. 제3자 쿠키</h2>
      <p>
        Google, Facebook 등 외부 플랫폼 연동 시 해당 플랫폼의 쿠키가 설정될 수 있습니다.
        이러한 쿠키는 각 플랫폼의 쿠키 정책에 따릅니다.
      </p>

      <h2>5. 문의</h2>
      <p>
        쿠키 정책에 관한 문의: <a href="mailto:support@reviewhub.app">support@reviewhub.app</a>
      </p>
    </article>
  );
}
