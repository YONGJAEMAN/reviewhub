import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ReportData } from '@/services/reportService';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  cover: { textAlign: 'center', marginTop: 120, marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0F1B2D', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280' },
  period: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F1B2D', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 6 },
  row: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: '#0F1B2D', fontWeight: 'bold' },
  col: { flex: 1 },
  colNarrow: { width: 80 },
  kpiGrid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: '#F8F9FB', borderRadius: 8, padding: 16, alignItems: 'center' },
  kpiValue: { fontSize: 22, fontWeight: 'bold', color: '#0F1B2D' },
  kpiLabel: { fontSize: 9, color: '#6B7280', marginTop: 4, textTransform: 'uppercase' },
  reviewCard: { backgroundColor: '#F8F9FB', borderRadius: 6, padding: 12, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewContent: { fontSize: 9, color: '#374151', lineHeight: 1.4 },
  stars: { color: '#F59E0B' },
});

export default function ReportPDF({ data }: { data: ReportData }) {
  const startDate = data.period.start.toLocaleDateString('ko-KR');
  const endDate = data.period.end.toLocaleDateString('ko-KR');

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.title}>ReviewHub</Text>
          <Text style={styles.subtitle}>{data.businessName}</Text>
          <Text style={styles.period}>{startDate} ~ {endDate}</Text>
        </View>

        {/* KPI Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KPI Summary</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.kpi.totalReviews}</Text>
              <Text style={styles.kpiLabel}>Total Reviews</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.kpi.avgRating}</Text>
              <Text style={styles.kpiLabel}>Avg Rating</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.kpi.positivePercent}%</Text>
              <Text style={styles.kpiLabel}>Positive</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.kpi.responseRate}%</Text>
              <Text style={styles.kpiLabel}>Response Rate</Text>
            </View>
          </View>
        </View>

        {/* Platform Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Performance</Text>
          <View style={styles.headerRow}>
            <Text style={styles.col}>Platform</Text>
            <Text style={styles.colNarrow}>Reviews</Text>
            <Text style={styles.colNarrow}>Avg Rating</Text>
          </View>
          {data.platformBreakdown.map((p) => (
            <View key={p.platform} style={styles.row}>
              <Text style={styles.col}>{p.platform}</Text>
              <Text style={styles.colNarrow}>{p.reviews}</Text>
              <Text style={styles.colNarrow}>{p.avgRating}</Text>
            </View>
          ))}
        </View>

        {/* Top Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 Reviews</Text>
          {data.topReviews.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text>{r.authorName} — {r.platform}</Text>
                <Text style={styles.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
              </View>
              <Text style={styles.reviewContent}>{r.content}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
