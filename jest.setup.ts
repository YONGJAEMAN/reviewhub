import '@testing-library/jest-dom';

// nanoid ships as pure ESM which jest's default transform rejects.
// Provide a deterministic-ish mock that still produces unique-ish strings.
jest.mock('nanoid', () => {
  let counter = 0;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return {
    nanoid: (size = 21) => {
      counter++;
      let out = '';
      for (let i = 0; i < size; i++) {
        const idx = (counter * 7 + i * 13) % alphabet.length;
        out += alphabet[idx];
      }
      return out;
    },
  };
});

// next-intl: lightweight mock that returns the last segment of the key
// so tests can still assert on labeled strings without loading real ESM module.
jest.mock('next-intl', () => {
  const messages: Record<string, string> = {
    actionRequired: 'Action Required',
    highPriority: 'High Priority',
    replied: 'Replied',
    localGuide: 'Local Guide',
    topReviewer: 'Top Reviewer',
    newReviewer: 'New Reviewer',
    platform: 'Platform',
    posted: 'Posted',
    yourReply: 'Your Reply',
    repliedAt: 'Replied {date}',
    viewThread: 'View Thread',
    openInYelp: 'Open in Yelp',
    replyTo: 'Reply to',
  };
  const translate = (key: string, vars?: Record<string, string | number>) => {
    const raw = messages[key] ?? key;
    if (!vars) return raw;
    return Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
      raw,
    );
  };
  return {
    useTranslations: () => translate,
    useLocale: () => 'en',
    useFormatter: () => ({
      dateTime: (d: Date) => d.toISOString(),
      number: (n: number) => String(n),
    }),
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});
