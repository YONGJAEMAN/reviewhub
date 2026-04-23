'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { LayoutDashboard, MessageSquare, Sparkles, Bell, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LandingSections from './LandingSections';
import Footer from './Footer';

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 40;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('landing');
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-navy">
          ReviewHub
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#solutions" className="text-sm text-text-secondary hover:text-navy transition-colors">{t('navbar.features')}</a>
          <a href="#pricing" className="text-sm text-text-secondary hover:text-navy transition-colors">{t('navbar.pricing')}</a>
          <a href="#testimonials" className="text-sm text-text-secondary hover:text-navy transition-colors">{t('navbar.testimonials')}</a>
          <Link href="/login" className="text-sm font-medium text-navy hover:text-navy-dark transition-colors">
            {t('navbar.logIn')}
          </Link>
          <Link
            href="/signup"
            className="bg-navy text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-navy-dark transition-colors"
          >
            {t('navbar.startForFree')}
          </Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-text-secondary">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 space-y-3">
          <a href="#solutions" onClick={() => setOpen(false)} className="block text-sm text-text-secondary">{t('navbar.features')}</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="block text-sm text-text-secondary">{t('navbar.pricing')}</a>
          <a href="#testimonials" onClick={() => setOpen(false)} className="block text-sm text-text-secondary">{t('navbar.testimonials')}</a>
          <Link href="/login" className="block text-sm font-medium text-navy">{t('navbar.logIn')}</Link>
          <Link href="/signup" className="block bg-navy text-white text-sm font-medium px-5 py-2.5 rounded-lg text-center">{t('navbar.startForFree')}</Link>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const t = useTranslations('landing');
  return (
    <section id="hero" className="pt-32 pb-20" style={{ background: 'linear-gradient(180deg, #F8F9FA 0%, #E8F4FD 100%)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <h1 className="text-[42px] md:text-[52px] font-bold text-navy leading-tight mb-6">
              {t('hero.title').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-lg">
              {t('hero.subtitle')}{' '}
              <span className="font-semibold text-navy">{t('hero.startingAt')}</span>
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="bg-navy text-white font-semibold px-8 py-3.5 rounded-xl text-base hover:bg-navy-dark transition-colors shadow-lg shadow-navy/20"
              >
                {t('hero.startForFree')}
              </Link>
              <a
                href="#solutions"
                className="border-2 border-navy text-navy font-semibold px-8 py-3.5 rounded-xl text-base hover:bg-navy/5 transition-colors"
              >
                {t('hero.viewDemo')}
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="relative">
              {/* Browser frame mockup */}
              <div className="bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white rounded-md px-3 py-1 text-xs text-text-secondary border border-border">
                      app.reviewhub.com/dashboard
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-background">
                  {/* Mini dashboard mockup */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {['4.6', '1,247', '89%', '12'].map((val, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-border">
                        <div className="text-[10px] text-text-secondary uppercase mb-1">
                          {[t('mockup.rating'), t('mockup.reviews'), t('mockup.positive'), t('mockup.pending')][i]}
                        </div>
                        <div className="text-lg font-bold text-navy">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-border h-32 flex items-center justify-center">
                    <div className="flex items-end gap-1">
                      {[40, 55, 45, 65, 50, 70, 60, 75, 68, 80, 72, 85].map((h, i) => (
                        <div key={i} className="w-4 rounded-sm bg-accent-blue/70" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Stats */}
        <FadeIn delay={0.3}>
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-navy"><CountUp end={2500} suffix="+" /></div>
              <div className="text-sm text-text-secondary mt-1">{t('stats.activeBusinesses')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-navy"><CountUp end={150000} suffix="+" /></div>
              <div className="text-sm text-text-secondary mt-1">{t('stats.reviewsManaged')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-navy"><CountUp end={98} suffix="%" /></div>
              <div className="text-sm text-text-secondary mt-1">{t('stats.customerSatisfaction')}</div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export { FadeIn };

export default function LandingPage() {
  const t = useTranslations('landing');
  return (
    <div className="min-h-screen bg-white scroll-smooth">
      <Navbar />
      <HeroSection />
      <LandingSections />

      {/* Final CTA */}
      <section className="bg-navy py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-white/70 mb-8">
              {t('cta.subtitle')}
            </p>
            <Link
              href="/signup"
              className="inline-block bg-white text-navy font-semibold px-10 py-4 rounded-xl text-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              {t('cta.startForFree')}
            </Link>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
