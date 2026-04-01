interface Props {
  userName: string;
  unsubscribeUrl: string;
}

export function renderWinbackEmail({ userName, unsubscribeUrl }: Props): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1B3A4B; font-size: 20px; margin: 0 0 16px;">놓치고 있는 리뷰가 있을 수 있어요</h2>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        안녕하세요 ${userName}님,
      </p>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        ReviewHub를 떠나신 지 1주일이 지났습니다. 그 사이 새로운 리뷰가 달렸을 수 있어요. 답변하지 않은 리뷰는 잠재 고객에게 부정적인 인상을 줄 수 있습니다.
      </p>
      <div style="background: #FFF3E0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p style="color: #E65100; font-size: 14px; margin: 0; line-height: 1.6;">
          📊 답변이 없는 부정 리뷰가 있으면 잠재 고객의 <strong>45%</strong>가 방문을 포기합니다.
        </p>
      </div>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        지금 돌아오시면 바로 리뷰를 확인하고 대응할 수 있습니다.
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${baseUrl}/pricing"
          style="display: inline-block; background: #1B3A4B; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600;">
          다시 시작하기
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
