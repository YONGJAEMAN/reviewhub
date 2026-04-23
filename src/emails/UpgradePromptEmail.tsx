interface Props {
  userName: string;
  unsubscribeUrl: string;
}

export function renderUpgradePromptEmail({ userName, unsubscribeUrl }: Props): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1B3A4B; font-size: 20px; margin: 0 0 16px;">Your Free Trial Has Ended</h2>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        Hi ${userName},
      </p>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        Your 14-day free trial has ended. Please choose a plan to continue managing your reviews.
      </p>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1B3A4B; margin: 0 0 16px; font-size: 16px;">What You Accomplished During the Trial</h3>
        <p style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0;">
          ✅ Unified review management<br/>
          ✅ AI reply suggestions<br/>
          ✅ Real-time alerts<br/>
          ✅ WhatsApp review requests
        </p>
      </div>
      <div style="background: #E8F4FD; border: 2px solid #2E86C1; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
        <p style="color: #1B3A4B; font-size: 16px; font-weight: 700; margin: 0 0 4px;">Starter Plan</p>
        <p style="color: #2E86C1; font-size: 28px; font-weight: 800; margin: 0;">$19<span style="font-size: 14px; font-weight: 400;">/mo</span></p>
        <p style="color: #4a5568; font-size: 13px; margin: 8px 0 0;">The perfect price for small businesses</p>
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${baseUrl}/pricing"
          style="display: inline-block; background: #1B3A4B; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 15px; font-weight: 600;">
          Choose a Plan
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
