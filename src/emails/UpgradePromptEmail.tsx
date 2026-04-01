interface Props {
  userName: string;
  unsubscribeUrl: string;
}

export function renderUpgradePromptEmail({ userName, unsubscribeUrl }: Props): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1B3A4B; font-size: 20px; margin: 0 0 16px;">무료 체험이 종료되었습니다</h2>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        안녕하세요 ${userName}님,
      </p>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        14일간의 무료 체험이 종료되었습니다. 리뷰 관리를 계속하려면 플랜을 선택해 주세요.
      </p>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1B3A4B; margin: 0 0 16px; font-size: 16px;">체험 기간 동안의 성과</h3>
        <p style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0;">
          ✅ 리뷰 통합 관리<br/>
          ✅ AI 답변 제안<br/>
          ✅ 실시간 알림<br/>
          ✅ WhatsApp 리뷰 요청
        </p>
      </div>
      <div style="background: #E8F4FD; border: 2px solid #2E86C1; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
        <p style="color: #1B3A4B; font-size: 16px; font-weight: 700; margin: 0 0 4px;">Starter 플랜</p>
        <p style="color: #2E86C1; font-size: 28px; font-weight: 800; margin: 0;">$19<span style="font-size: 14px; font-weight: 400;">/월</span></p>
        <p style="color: #4a5568; font-size: 13px; margin: 8px 0 0;">소규모 비즈니스에 딱 맞는 가격</p>
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${baseUrl}/pricing"
          style="display: inline-block; background: #1B3A4B; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600;">
          플랜 선택하기
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px;" />
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        ReviewHub - Review Management |
        <a href="${unsubscribeUrl}" style="color: #9ca3af;">마케팅 이메일 수신 거부</a>
      </p>
    </div>
  `;
}
