interface Props {
  userName: string;
  unsubscribeUrl: string;
}

export function renderWelcomeEmail({ userName, unsubscribeUrl }: Props): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1B3A4B; font-size: 24px; margin: 0;">ReviewHub에 오신 것을 환영합니다!</h1>
      </div>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        안녕하세요 ${userName}님,<br/>
        ReviewHub에 가입해 주셔서 감사합니다. 이제 모든 리뷰를 하나의 대시보드에서 관리할 수 있습니다.
      </p>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1B3A4B; margin: 0 0 12px; font-size: 16px;">시작하기</h3>
        <ul style="color: #4a5568; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0;">
          <li>Google, Yelp, Facebook 플랫폼 연결</li>
          <li>AI 답변 제안으로 리뷰에 빠르게 대응</li>
          <li>WhatsApp으로 리뷰 요청 보내기</li>
          <li>경쟁사 벤치마킹으로 시장 위치 파악</li>
        </ul>
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${process.env.NEXTAUTH_URL || 'https://reviewhub.app'}/dashboard"
          style="display: inline-block; background: #1B3A4B; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
          대시보드로 이동
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        14일 무료 체험 기간 동안 모든 기능을 사용해 보세요.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px;" />
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        ReviewHub - Review Management |
        <a href="${unsubscribeUrl}" style="color: #9ca3af;">마케팅 이메일 수신 거부</a>
      </p>
    </div>
  `;
}
