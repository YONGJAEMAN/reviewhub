interface Props {
  userName: string;
  unsubscribeUrl: string;
}

export function renderWinbackEmail({ userName, unsubscribeUrl }: Props): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1B3A4B; font-size: 20px; margin: 0 0 16px;">You Might Be Missing Reviews</h2>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        Hi ${userName},
      </p>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        It's been a week since you left ReviewHub. New reviews may have come in since then. Unanswered reviews can leave a negative impression on potential customers.
      </p>
      <div style="background: #FFF3E0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p style="color: #E65100; font-size: 14px; margin: 0; line-height: 1.6;">
          📊 <strong>45%</strong> of potential customers avoid businesses with unanswered negative reviews.
        </p>
      </div>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        Come back now to check and respond to your reviews right away.
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${baseUrl}/pricing"
          style="display: inline-block; background: #1B3A4B; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600;">
          Get Started Again
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
