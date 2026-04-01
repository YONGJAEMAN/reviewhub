interface Props {
  userName: string;
  daysLeft: number;
  unsubscribeUrl: string;
}

export function renderTrialReminderEmail({ userName, daysLeft, unsubscribeUrl }: Props): string {
  const titleMap: Record<number, string> = {
    11: '첫 리뷰에 답변해 보셨나요?',
    7: 'AI 답변 기능을 사용해 보셨나요?',
    4: `트라이얼 만료까지 ${daysLeft}일 남았습니다`,
    1: '트라이얼이 내일 만료됩니다',
  };

  const title = titleMap[daysLeft] || `트라이얼 만료까지 ${daysLeft}일 남았습니다`;

  const tipMap: Record<number, string> = {
    11: '리뷰에 답변하면 고객 재방문율이 33% 높아집니다. 대시보드에서 답변이 필요한 리뷰를 확인해 보세요.',
    7: 'AI 답변 제안을 사용하면 평균 답변 시간이 80% 단축됩니다. 리뷰 상세 페이지에서 "AI 답변 제안" 버튼을 클릭해 보세요.',
    4: '지금까지 ReviewHub의 기능을 잘 활용하고 계신가요? 남은 기간 동안 모든 기능을 충분히 체험해 보세요.',
    1: '내일이면 무료 체험이 종료됩니다. 중단 없이 리뷰를 관리하려면 지금 플랜을 선택하세요.',
  };

  const tip = tipMap[daysLeft] || '체험 기간 동안 모든 기능을 사용해 보세요.';

  const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1B3A4B; font-size: 20px; margin: 0 0 16px;">${title}</h2>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        안녕하세요 ${userName}님,
      </p>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        ${tip}
      </p>
      ${daysLeft <= 4 ? `
        <div style="background: #FFF8E1; border: 1px solid #FFE082; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #F57F17; font-size: 13px; margin: 0; font-weight: 600;">
            ⏰ 무료 체험 만료까지 ${daysLeft}일
          </p>
        </div>
      ` : ''}
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${baseUrl}/${daysLeft <= 4 ? 'pricing' : 'dashboard'}"
          style="display: inline-block; background: #1B3A4B; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
          ${daysLeft <= 4 ? '플랜 선택하기' : '대시보드로 이동'}
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
