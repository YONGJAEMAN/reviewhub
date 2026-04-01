import { auth } from '@/lib/auth';
import { errorResponse } from '@/lib/api';
import { getReportData } from '@/services/reportService';
import { generateCSV } from '@/lib/csvExport';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const days = parseInt(searchParams.get('days') || '30', 10);
    const businessId = searchParams.get('businessId');

    if (!businessId) return errorResponse('businessId required', 400);

    const data = await getReportData(businessId, days);

    if (format === 'csv') {
      const csv = generateCSV(data);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="reviewhub-report-${days}d.csv"`,
        },
      });
    }

    if (format === 'pdf') {
      // Dynamic import to avoid bundling react-pdf on every route
      const { renderToBuffer } = await import('@react-pdf/renderer');
      const { default: ReportPDF } = await import('@/components/export/ReportPDF');
      const { createElement } = await import('react');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buffer = await renderToBuffer(createElement(ReportPDF, { data }) as any);

      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="reviewhub-report-${days}d.pdf"`,
        },
      });
    }

    return errorResponse('Invalid format. Use csv or pdf.', 400);
  } catch (error) {
    console.error('Export error:', error);
    return errorResponse('Failed to generate report', 500);
  }
}
