interface Props {
  businessName: string;
  reviewerName: string;
  rating: number;
  content: string;
  reviewUrl: string;
}

export function renderReviewAlertEmail({ businessName, reviewerName, rating, content, reviewUrl }: Props): string {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a2332; margin: 0 0 16px;">New Review for ${businessName}</h2>
      <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #1a2332;">${reviewerName}</p>
        <p style="margin: 0 0 8px; color: #f59e0b; font-size: 18px;">${stars}</p>
        <p style="margin: 0; color: #4a5568; font-size: 14px;">${content.slice(0, 200)}${content.length > 200 ? '...' : ''}</p>
      </div>
      <a href="${reviewUrl}" style="display: inline-block; background: #1a2332; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 500;">
        View & Reply
      </a>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">ReviewHub - Review Management</p>
    </div>
  `;
}
