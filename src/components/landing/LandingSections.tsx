'use client';

import Link from 'next/link';
import { LayoutDashboard, MessageSquare, Sparkles, Bell, Check, Star } from 'lucide-react';
import { FadeIn } from './LandingPage';

/* ───── Pain Points ───── */
function PainPointsSection() {
  const points = [
    { emoji: '😩', title: '시간 낭비', desc: '여러 플랫폼을 하나씩 확인하느라 매일 30분 이상 소비' },
    { emoji: '😡', title: '늦은 대응', desc: '부정 리뷰를 늦게 발견해서 대응 시기를 놓치고 평점 하락' },
    { emoji: '📉', title: '비싼 비용', desc: '리뷰 관리 툴은 $44~$399, 소규모 비즈니스에겐 부담' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold text-navy text-center mb-4">
            소규모 비즈니스 사장님,<br className="md:hidden" /> 이런 고민 있으시죠?
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            리뷰 하나가 매출을 바꿉니다. 하지만 관리는 너무 번거롭습니다.
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {points.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1}>
              <div className="bg-background rounded-2xl p-8 border border-border text-center hover:shadow-md transition-shadow">
                <div className="text-5xl mb-4">{p.emoji}</div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{p.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Solutions ───── */
function SolutionsSection() {
  const features = [
    {
      icon: LayoutDashboard,
      title: '통합 대시보드',
      desc: '모든 플랫폼 리뷰를 한 화면에서 실시간으로 확인하고 관리하세요.',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp 리뷰 요청',
      desc: '98% 열람률의 WhatsApp으로 고객에게 리뷰를 요청하세요. 리뷰 수 폭발적 증가.',
    },
    {
      icon: Sparkles,
      title: 'AI 답변 생성',
      desc: '클릭 한 번으로 전문적인 답변을 자동 생성. 톤 선택과 길이 조절까지.',
    },
    {
      icon: Bell,
      title: '실시간 알림',
      desc: '부정 리뷰를 즉시 감지하고 이메일 알림으로 빠르게 대응하세요.',
    },
  ];

  return (
    <section id="solutions" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold text-navy text-center mb-4">
            ReviewHub이 해결합니다
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            복잡한 리뷰 관리를 하나의 도구로 간단하게.
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.1}>
              <div className="bg-surface rounded-2xl p-8 border border-border flex gap-5 hover:shadow-lg hover:scale-[1.02] transition-all cursor-default">
                <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center shrink-0">
                  <f.icon size={24} className="text-accent-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Comparison ───── */
function ComparisonSection() {
  const rows = [
    { feature: '리뷰 통합', brightlocal: true, podium: true, reviewhub: true },
    { feature: 'WhatsApp 자동화', brightlocal: false, podium: false, reviewhub: true },
    { feature: 'AI 답변 생성', brightlocal: false, podium: '제한적', reviewhub: true },
    { feature: '소규모 맞춤 가격', brightlocal: false, podium: false, reviewhub: true },
    { feature: '감성 분석', brightlocal: true, podium: true, reviewhub: true },
    { feature: '경쟁사 벤치마킹', brightlocal: true, podium: false, reviewhub: true },
  ];

  const renderCell = (val: boolean | string) => {
    if (val === true) return <span className="text-success font-bold">✓</span>;
    if (val === false) return <span className="text-text-secondary">✗</span>;
    return <span className="text-text-secondary text-xs">{val}</span>;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold text-navy text-center mb-4">
            왜 ReviewHub인가요?
          </h2>
          <p className="text-text-secondary text-center mb-12">
            경쟁사 대비 확실한 가치를 제공합니다.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-sm font-semibold text-text-primary p-4 border-b border-border">기능</th>
                  <th className="text-center text-sm font-semibold text-text-secondary p-4 border-b border-border">
                    BrightLocal<br /><span className="text-xs font-normal">$44+/월</span>
                  </th>
                  <th className="text-center text-sm font-semibold text-text-secondary p-4 border-b border-border">
                    Podium<br /><span className="text-xs font-normal">$399+/월</span>
                  </th>
                  <th className="text-center text-sm font-bold text-navy p-4 border-b-2 border-accent-blue bg-accent-blue/5 rounded-t-xl">
                    ReviewHub<br /><span className="text-xs font-semibold text-accent-blue">$19/월</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-0">
                    <td className="text-sm text-text-primary p-4 font-medium">{row.feature}</td>
                    <td className="text-center p-4">{renderCell(row.brightlocal)}</td>
                    <td className="text-center p-4">{renderCell(row.podium)}</td>
                    <td className="text-center p-4 bg-accent-blue/5">{renderCell(row.reviewhub)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ───── Pricing ───── */
function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: 19,
      popular: false,
      features: ['1 Business Location', '10 AI Replies / month', '100 WhatsApp Requests', 'Google & Yelp Integration', 'Basic Analytics'],
    },
    {
      name: 'Growth',
      price: 39,
      popular: true,
      features: ['3 Business Locations', '50 AI Replies / month', '500 WhatsApp Requests', 'All Platform Integrations', 'Advanced Analytics', 'Sentiment Analysis', '3 Competitor Tracking'],
    },
    {
      name: 'Pro',
      price: 69,
      popular: false,
      features: ['10 Business Locations', 'Unlimited AI Replies', 'Unlimited WhatsApp', 'All Integrations', 'Advanced Analytics & Reports', 'Sentiment Analysis', '10 Competitor Tracking', 'Priority Support'],
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold text-navy text-center mb-4">합리적인 가격</h2>
          <p className="text-text-secondary text-center mb-12">
            14일 무료 체험, 카드 등록 불필요
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div className={`relative bg-surface rounded-2xl border-2 p-8 flex flex-col ${
                plan.popular ? 'border-accent-blue shadow-lg shadow-accent-blue/10' : 'border-border'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent-blue text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={12} />
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-navy">${plan.price}</span>
                    <span className="text-text-secondary text-sm">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-text-secondary">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 w-full py-3 rounded-xl text-sm font-semibold text-center block transition-colors ${
                    plan.popular
                      ? 'bg-navy text-white hover:bg-navy-dark'
                      : 'bg-background text-text-primary border border-border hover:bg-border/50'
                  }`}
                >
                  무료로 시작하기
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Testimonials ───── */
function TestimonialsSection() {
  const reviews = [
    {
      name: '김○○',
      business: '카페 운영',
      rating: 5,
      text: '리뷰 응답 시간이 평균 6시간에서 30분으로 줄었어요. AI 답변 기능 덕분에 전문적인 답변을 빠르게 보낼 수 있습니다.',
      initials: 'KM',
    },
    {
      name: '이○○',
      business: '미용실',
      rating: 5,
      text: 'WhatsApp으로 리뷰 요청했더니 한 달 만에 Google 리뷰 40개 늘었습니다. 신규 고객이 눈에 띄게 증가했어요.',
      initials: 'LJ',
    },
    {
      name: '박○○',
      business: '음식점',
      rating: 5,
      text: '월 $19에 이 정도면 가성비 최고입니다. 부정 리뷰 알림 덕분에 바로 대응할 수 있어서 평점이 4.2에서 4.7로 올랐습니다.',
      initials: 'PS',
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold text-navy text-center mb-4">사장님들의 후기</h2>
          <p className="text-text-secondary text-center mb-12">
            실제로 사용하고 계신 사장님들의 이야기
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <FadeIn key={r.name} delay={i * 0.1}>
              <div className="bg-background rounded-2xl p-8 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm">
                    {r.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{r.name}</div>
                    <div className="text-xs text-text-secondary">{r.business}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed italic">
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingSections() {
  return (
    <>
      <PainPointsSection />
      <SolutionsSection />
      <ComparisonSection />
      <PricingSection />
      <TestimonialsSection />
    </>
  );
}
