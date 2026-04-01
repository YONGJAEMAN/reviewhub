interface FaqItem {
  question: string;
  answer: string;
}

interface JsonLdProps {
  type: 'organization' | 'software' | 'faq';
  faqItems?: FaqItem[];
}

export default function JsonLd({ type, faqItems }: JsonLdProps) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://reviewhub.app';

  const schemas: Record<string, object> = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ReviewHub',
      url: baseUrl,
      logo: `${baseUrl}/icon.svg`,
      description: '소규모 비즈니스를 위한 올인원 리뷰 관리 플랫폼',
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
      description: 'Google, Yelp, Facebook 리뷰를 하나의 대시보드에서 관리하세요.',
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
