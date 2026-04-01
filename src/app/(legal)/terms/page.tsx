import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 | ReviewHub',
};

export default function TermsPage() {
  return (
    <article className="prose prose-sm max-w-none text-text-primary prose-headings:text-navy prose-a:text-accent-blue">
      <h1>이용약관</h1>
      <p className="text-text-secondary">최종 수정일: 2026년 4월 1일</p>

      <h2>1. 서비스 소개</h2>
      <p>
        ReviewHub(이하 &ldquo;서비스&rdquo;)는 소규모 비즈니스를 위한 리뷰 통합 관리 플랫폼으로,
        Google, Yelp, Facebook, WhatsApp 등 다양한 플랫폼의 리뷰를 한곳에서 관리할 수 있는
        SaaS 서비스를 제공합니다.
      </p>

      <h2>2. 이용 조건</h2>
      <ul>
        <li>서비스 이용을 위해 회원가입이 필요합니다.</li>
        <li>이용자는 정확한 정보를 제공하고 최신 상태로 유지해야 합니다.</li>
        <li>계정은 본인만 사용할 수 있으며, 타인에게 양도할 수 없습니다.</li>
        <li>서비스를 불법적이거나 부적절한 목적으로 사용할 수 없습니다.</li>
      </ul>

      <h2>3. 요금 및 결제</h2>
      <ul>
        <li>무료 체험 기간(14일) 종료 후 유료 플랜을 선택하셔야 합니다.</li>
        <li>결제는 Stripe를 통해 처리되며, 월간 또는 연간 자동 갱신됩니다.</li>
        <li>플랜 변경은 언제든 Settings에서 가능하며, 다음 결제 주기부터 적용됩니다.</li>
        <li>가격은 사전 공지 후 변경될 수 있습니다.</li>
      </ul>

      <h2>4. 서비스 이용 범위</h2>
      <p>각 플랜별 이용 한도(AI 답변 수, WhatsApp 요청 수, 비즈니스 수 등)가 있으며,
        한도 초과 시 추가 기능이 제한될 수 있습니다.</p>

      <h2>5. 지적 재산권</h2>
      <ul>
        <li>서비스의 소프트웨어, 디자인, 로고 등 모든 지적 재산은 회사에 귀속됩니다.</li>
        <li>이용자가 입력한 비즈니스 정보 및 리뷰 답변의 저작권은 이용자에게 있습니다.</li>
        <li>AI가 생성한 답변은 이용자가 자유롭게 사용할 수 있습니다.</li>
      </ul>

      <h2>6. 면책 조항</h2>
      <ul>
        <li>회사는 외부 플랫폼(Google, Yelp, Facebook, WhatsApp)의 API 변경이나 서비스 중단에 대해 책임지지 않습니다.</li>
        <li>AI가 생성한 답변의 정확성이나 적절성을 보장하지 않으며, 최종 검토 책임은 이용자에게 있습니다.</li>
        <li>천재지변, 시스템 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임지지 않습니다.</li>
      </ul>

      <h2>7. 해지 및 환불</h2>
      <ul>
        <li>이용자는 언제든 서비스를 해지할 수 있습니다.</li>
        <li>해지 시 남은 결제 기간까지 서비스를 이용할 수 있습니다.</li>
        <li>연간 결제의 경우, 결제일로부터 14일 이내에 환불을 요청할 수 있습니다.</li>
        <li>계정 삭제 요청 시 30일의 유예 기간이 있으며, 이 기간 내 취소 가능합니다.</li>
      </ul>

      <h2>8. 약관 변경</h2>
      <p>
        회사는 약관을 변경할 수 있으며, 변경 시 이메일 및 서비스 내 공지로 사전 고지합니다.
        변경된 약관에 동의하지 않는 경우 서비스를 해지할 수 있습니다.
      </p>

      <h2>9. 준거법 및 관할</h2>
      <p>
        본 약관은 대한민국 법률에 따라 해석되며, 관련 분쟁은 서울중앙지방법원을 제1심 관할 법원으로 합니다.
      </p>

      <h2>10. 문의</h2>
      <p>
        약관에 관한 문의: <a href="mailto:support@reviewhub.app">support@reviewhub.app</a>
      </p>
    </article>
  );
}
