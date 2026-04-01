import type { ReportData } from '@/services/reportService';

export function generateCSV(data: ReportData): string {
  const lines: string[] = [];

  // Header
  lines.push('ReviewHub Report');
  lines.push(`Business: ${data.businessName}`);
  lines.push(`Period: ${data.period.start.toISOString().slice(0, 10)} ~ ${data.period.end.toISOString().slice(0, 10)}`);
  lines.push('');

  // KPI Summary
  lines.push('KPI Summary');
  lines.push('Metric,Value');
  lines.push(`Total Reviews,${data.kpi.totalReviews}`);
  lines.push(`Average Rating,${data.kpi.avgRating}`);
  lines.push(`Positive Sentiment,${data.kpi.positivePercent}%`);
  lines.push(`Response Rate,${data.kpi.responseRate}%`);
  lines.push('');

  // Platform Breakdown
  lines.push('Platform Breakdown');
  lines.push('Platform,Reviews,Avg Rating');
  for (const p of data.platformBreakdown) {
    lines.push(`${p.platform},${p.reviews},${p.avgRating}`);
  }
  lines.push('');

  // Top Reviews
  lines.push('Top Reviews');
  lines.push('Author,Platform,Rating,Content,Posted At');
  for (const r of data.topReviews) {
    const content = r.content.replace(/"/g, '""');
    lines.push(`"${r.authorName}",${r.platform},${r.rating},"${content}",${r.postedAt.toISOString().slice(0, 10)}`);
  }

  return lines.join('\n');
}
