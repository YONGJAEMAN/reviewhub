'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('landing');

  const footerLinks = {
    product: [
      { label: t('footer.features'), href: '/#solutions' },
      { label: t('footer.pricing'), href: '/#pricing' },
      { label: t('footer.faq'), href: '/#faq' },
      { label: t('footer.blog'), href: '/blog' },
    ],
    company: [
      { label: t('footer.about'), href: '/#hero' },
      { label: t('footer.contactUs'), href: 'mailto:support@reviewhub.app' },
    ],
    legal: [
      { label: t('footer.privacyPolicy'), href: '/privacy' },
      { label: t('footer.termsOfService'), href: '/terms' },
      { label: t('footer.cookiePolicy'), href: '/cookie' },
    ],
  };

  return (
    <footer className="bg-[#0F2430] text-white/70">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">ReviewHub</h3>
            <p className="text-sm leading-relaxed">
              {t('footer.tagline').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {category === 'product' ? t('footer.product') : category === 'company' ? t('footer.company') : t('footer.legal')}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
