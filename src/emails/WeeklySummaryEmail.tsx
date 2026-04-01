interface Props {
  businessName: string;
  newReviews: number;
  avgRating: string;
  positivePercent: number;
  unanswered: number;
  dashboardUrl: string;
}

export function renderWeeklySummaryEmail({
  businessName, newReviews, avgRating, positivePercent, unanswered, dashboardUrl,
}: Props): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a2332; margin: 0 0 4px;">Weekly Review Summary</h2>
      <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px;">${businessName}</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
        <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1a2332;">${newReviews}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">New Reviews</p>
        </div>
        <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1a2332;">${avgRating}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Avg Rating</p>
        </div>
        <div style="background: #faf5ff; border-radius: 8px; padding: 16px; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1a2332;">${positivePercent}%</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Positive</p>
        </div>
        <div style="background: ${unanswered > 0 ? '#fef2f2' : '#f8f9fa'}; border-radius: 8px; padding: 16px; text-align: center;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${unanswered > 0 ? '#dc2626' : '#1a2332'};">${unanswered}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Unanswered</p>
        </div>
      </div>

      ${unanswered > 0 ? `
        <a href="${dashboardUrl}" style="display: block; background: #1a2332; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-size: 14px; font-weight: 500; text-align: center;">
          Reply Now (${unanswered} waiting)
        </a>
      ` : `
        <p style="text-align: center; color: #10b981; font-weight: 500; font-size: 14px;">All reviews responded to!</p>
      `}

      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">ReviewHub - Review Management</p>
    </div>
  `;
}
