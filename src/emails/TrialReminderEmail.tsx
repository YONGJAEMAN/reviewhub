interface Props {
  userName: string;
  daysLeft: number;
  unsubscribeUrl: string;
}

export function renderTrialReminderEmail({ userName, daysLeft, unsubscribeUrl }: Props): string {
  const titleMap: Record<number, string> = {
    11: 'Have you replied to your first review?',
    7: 'Have you tried the AI reply feature?',
    4: `${daysLeft} days left until your trial expires`,
    1: 'Your trial expires tomorrow',
  };

  const title = titleMap[daysLeft] || `${daysLeft} days left until your trial expires`;

  const tipMap: Record<number, string> = {
    11: 'Responding to reviews increases customer return rate by 33%. Check your dashboard for reviews that need a reply.',
    7: 'Using AI reply suggestions reduces average response time by 80%. Click the "AI Reply Suggestion" button on the review detail page.',
    4: 'Have you been making the most of ReviewHub? Make sure to explore all features during the remaining trial period.',
    1: 'Your free trial ends tomorrow. Choose a plan now to keep managing your reviews without interruption.',
  };

  const tip = tipMap[daysLeft] || 'Explore all features during your trial period.';

  const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1B3A4B; font-size: 20px; margin: 0 0 16px;">${title}</h2>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        Hi ${userName},
      </p>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        ${tip}
      </p>
      ${daysLeft <= 4 ? `
        <div style="background: #FFF8E1; border: 1px solid #FFE082; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #F57F17; font-size: 13px; margin: 0; font-weight: 600;">
            ⏰ ${daysLeft} day${daysLeft === 1 ? '' : 's'} until free trial expires
          </p>
        </div>
      ` : ''}
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${baseUrl}/${daysLeft <= 4 ? 'pricing' : 'dashboard'}"
          style="display: inline-block; background: #1B3A4B; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
          ${daysLeft <= 4 ? 'Choose a Plan' : 'Go to Dashboard'}
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px;" />
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        ReviewHub - Review Management |
        <a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe from marketing emails</a>
      </p>
    </div>
  `;
}
