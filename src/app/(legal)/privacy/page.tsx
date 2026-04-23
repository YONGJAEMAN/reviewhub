import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Privacy Policy | ReviewHub',
};

export default async function PrivacyPage() {
  const t = await getTranslations('legal');

  const section1Sub1Items: string[] = t.raw('privacy.section1Sub1Items');
  const section1Sub2Items: string[] = t.raw('privacy.section1Sub2Items');
  const section1Sub3Items: string[] = t.raw('privacy.section1Sub3Items');
  const section2Items: string[] = t.raw('privacy.section2Items');
  const section3Items: { name: string; desc: string }[] = t.raw('privacy.section3Items');
  const section5Items: { name: string; desc: string }[] = t.raw('privacy.section5Items');

  return (
    <article className="prose prose-sm max-w-none text-text-primary prose-headings:text-navy prose-a:text-accent-blue">
      <h1>{t('privacy.title')}</h1>
      <p className="text-text-secondary">{t('privacy.lastUpdated')}</p>

      <p>{t('privacy.intro')}</p>

      <h2>{t('privacy.section1Title')}</h2>
      <h3>{t('privacy.section1Sub1Title')}</h3>
      <ul>
        {section1Sub1Items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <h3>{t('privacy.section1Sub2Title')}</h3>
      <ul>
        {section1Sub2Items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <h3>{t('privacy.section1Sub3Title')}</h3>
      <ul>
        {section1Sub3Items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{t('privacy.section2Title')}</h2>
      <ul>
        {section2Items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{t('privacy.section3Title')}</h2>
      <p>{t('privacy.section3Intro')}</p>
      <ul>
        {section3Items.map((item, i) => (
          <li key={i}><strong>{item.name}</strong> — {item.desc}</li>
        ))}
      </ul>

      <h2>{t('privacy.section4Title')}</h2>
      <p>{t('privacy.section4Content')}</p>

      <h2>{t('privacy.section5Title')}</h2>
      <p>{t('privacy.section5Intro')}</p>
      <ul>
        {section5Items.map((item, i) => (
          <li key={i}><strong>{item.name}</strong> — {item.desc}</li>
        ))}
      </ul>
      <p>{t('privacy.section5Outro')}</p>

      <h2>{t('privacy.section6Title')}</h2>
      <p>{t('privacy.section6Content')}</p>

      <h2>{t('privacy.section7Title')}</h2>
      <p>{t('privacy.section7Content')}</p>

      <h2>{t('privacy.section8Title')}</h2>
      <p>{t('privacy.section8Content')}</p>
    </article>
  );
}
