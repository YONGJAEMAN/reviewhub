import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Terms of Service | ReviewHub',
};

export default async function TermsPage() {
  const t = await getTranslations('legal');

  const section2Items: string[] = t.raw('terms.section2Items');
  const section3Items: string[] = t.raw('terms.section3Items');
  const section5Items: string[] = t.raw('terms.section5Items');
  const section7Items: string[] = t.raw('terms.section7Items');
  const section8Items: string[] = t.raw('terms.section8Items');

  return (
    <article className="prose prose-sm max-w-none text-text-primary prose-headings:text-navy prose-a:text-accent-blue">
      <h1>{t('terms.title')}</h1>
      <p className="text-text-secondary">{t('terms.lastUpdated')}</p>

      <h2>{t('terms.section1Title')}</h2>
      <p>{t('terms.section1Content')}</p>

      <h2>{t('terms.section2Title')}</h2>
      <ul>
        {section2Items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{t('terms.section3Title')}</h2>
      <ul>
        {section3Items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{t('terms.section4Title')}</h2>
      <p>{t('terms.section4Content')}</p>

      <h2>{t('terms.section5Title')}</h2>
      <ul>
        {section5Items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{t('terms.section6Title')}</h2>
      <p>{t('terms.section6Content')}</p>

      <h2>{t('terms.section7Title')}</h2>
      <ul>
        {section7Items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{t('terms.section8Title')}</h2>
      <ul>
        {section8Items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h2>{t('terms.section9Title')}</h2>
      <p>{t('terms.section9Content')}</p>

      <h2>{t('terms.section10Title')}</h2>
      <p>{t('terms.section10Content')}</p>

      <h2>{t('terms.section11Title')}</h2>
      <p>{t('terms.section11Content')}</p>
    </article>
  );
}
