import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Cookie Policy | ReviewHub',
};

export default async function CookiePage() {
  const t = await getTranslations('legal');

  const section2Sub1Items: { name: string; desc: string }[] = t.raw('cookie.section2Sub1Items');
  const section2Sub2Items: { name: string; desc: string }[] = t.raw('cookie.section2Sub2Items');
  const section2Sub3Items: { name: string; desc: string }[] = t.raw('cookie.section2Sub3Items');

  return (
    <article className="prose prose-sm max-w-none text-text-primary prose-headings:text-navy prose-a:text-accent-blue">
      <h1>{t('cookie.title')}</h1>
      <p className="text-text-secondary">{t('cookie.lastUpdated')}</p>

      <p>{t('cookie.intro')}</p>

      <h2>{t('cookie.section1Title')}</h2>
      <p>{t('cookie.section1Content')}</p>

      <h2>{t('cookie.section2Title')}</h2>

      <h3>{t('cookie.section2Sub1Title')}</h3>
      <p>{t('cookie.section2Sub1Intro')}</p>
      <ul>
        {section2Sub1Items.map((item, i) => (
          <li key={i}><strong>{item.name}</strong> — {item.desc}</li>
        ))}
      </ul>

      <h3>{t('cookie.section2Sub2Title')}</h3>
      <p>{t('cookie.section2Sub2Intro')}</p>
      <ul>
        {section2Sub2Items.map((item, i) => (
          <li key={i}><strong>{item.name}</strong> — {item.desc}</li>
        ))}
      </ul>

      <h3>{t('cookie.section2Sub3Title')}</h3>
      <p>{t('cookie.section2Sub3Intro')}</p>
      <ul>
        {section2Sub3Items.map((item, i) => (
          <li key={i}><strong>{item.name}</strong> — {item.desc}</li>
        ))}
      </ul>

      <h2>{t('cookie.section3Title')}</h2>
      <p>{t('cookie.section3Content1')}</p>
      <p>{t('cookie.section3Content2')}</p>

      <h2>{t('cookie.section4Title')}</h2>
      <p>{t('cookie.section4Content')}</p>

      <h2>{t('cookie.section5Title')}</h2>
      <p>{t('cookie.section5Content')}</p>
    </article>
  );
}
