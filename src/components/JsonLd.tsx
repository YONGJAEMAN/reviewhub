import { getTranslations } from 'next-intl/server';

interface FaqItem {
  question: string;
  answer: string;
}

interface JsonLdProps {
  type: 'organization' | 'software' | 'faq';
  faqItems?: FaqItem[];
}

export default async function JsonLd({ type, faqItems }: JsonLdProps) {
  const t = await getTranslations('jsonLd');
  const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';

  const schemas: Record<string, object> = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ReviewHub',
      url: baseUrl,
      logo: `${baseUrl}/icon.svg`,
      description: t('organizationDescription'),
      sameAs: [],
    },
    software: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'ReviewHub',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '19',
        highPrice: '69',
        priceCurrency: 'USD',
        offerCount: 3,
      },
      description: t('softwareDescription'),
    },
    faq: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: (faqItems || []).map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas[type]) }}
    />
  );
}
