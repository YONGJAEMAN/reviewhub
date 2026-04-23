interface Props {
  userName: string;
  unsubscribeUrl: string;
}

export function renderWelcomeEmail({ userName, unsubscribeUrl }: Props): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1B3A4B; font-size: 24px; margin: 0;">Welcome to ReviewHub!</h1>
      </div>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        Hi ${userName},<br/>
        Thank you for signing up for ReviewHub. You can now manage all your reviews from a single dashboard.
      </p>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1B3A4B; margin: 0 0 12px; font-size: 16px;">Getting Started</h3>
        <ul style="color: #4a5568; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0;">
          <li>Connect your Google, Yelp, and Facebook platforms</li>
          <li>Respond to reviews quickly with AI reply suggestions</li>
          <li>Send review requests via WhatsApp</li>
          <li>Track your market position with competitor benchmarking</li>
        </ul>
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${process.env.NEXTAUTH_URL || 'https://reviewhub.app'}/dashboard"
          style="display: inline-block; background: #1B3A4B; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
          Go to Dashboard
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        Explore all features during your 14-day free trial.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px;" />
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        ReviewHub - Review Management |
        <a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe from marketing emails</a>
      </p>
    </div>
  `;
}
