import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getUnsubscribeUrl } from '@/lib/unsubscribe';
import { renderWelcomeEmail } from '@/emails/WelcomeEmail';
import { renderTrialReminderEmail } from '@/emails/TrialReminderEmail';
import { renderUpgradePromptEmail } from '@/emails/UpgradePromptEmail';
import { renderWinbackEmail } from '@/emails/WinbackEmail';

interface RenderParams {
  userName: string;
  unsubscribeUrl: string;
  daysLeft: number;
}

interface CampaignStep {
  dayOffset: number;
  templateKey: string;
  subject: string;
  render: (params: RenderParams) => string;
}

const DRIP_SEQUENCE: CampaignStep[] = [
  {
    dayOffset: 0,
    templateKey: 'welcome',
    subject: 'ReviewHub에 오신 것을 환영합니다!',
    render: ({ userName, unsubscribeUrl }) => renderWelcomeEmail({ userName, unsubscribeUrl }),
  },
  {
    dayOffset: 3,
    templateKey: 'tips_day3',
    subject: '첫 리뷰에 답변해 보셨나요?',
    render: ({ userName, unsubscribeUrl }) =>
      renderTrialReminderEmail({ userName, daysLeft: 11, unsubscribeUrl }),
  },
  {
    dayOffset: 7,
    templateKey: 'tips_day7',
    subject: 'AI 답변 기능을 사용해 보셨나요?',
    render: ({ userName, unsubscribeUrl }) =>
      renderTrialReminderEmail({ userName, daysLeft: 7, unsubscribeUrl }),
  },
  {
    dayOffset: 10,
    templateKey: 'trial_reminder_10',
    subject: '트라이얼 만료까지 4일 남았습니다',
    render: ({ userName, unsubscribeUrl }) =>
      renderTrialReminderEmail({ userName, daysLeft: 4, unsubscribeUrl }),
  },
  {
    dayOffset: 13,
    templateKey: 'trial_reminder_13',
    subject: '트라이얼이 내일 만료됩니다',
    render: ({ userName, unsubscribeUrl }) =>
      renderTrialReminderEmail({ userName, daysLeft: 1, unsubscribeUrl }),
  },
  {
    dayOffset: 14,
    templateKey: 'upgrade_prompt',
    subject: '트라이얼이 종료되었습니다 - 지금 업그레이드하세요',
    render: ({ userName, unsubscribeUrl }) =>
      renderUpgradePromptEmail({ userName, unsubscribeUrl }),
  },
  {
    dayOffset: 21,
    templateKey: 'winback',
    subject: '아직 ReviewHub를 고민 중이시라면',
    render: ({ userName, unsubscribeUrl }) =>
      renderWinbackEmail({ userName, unsubscribeUrl }),
  },
];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function processDripCampaigns(): Promise<{ sent: number; skipped: number }> {
  let sent = 0;
  let skipped = 0;

  for (const step of DRIP_SEQUENCE) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - step.dayOffset);
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
        marketingOptOut: false,
        emailLogs: { none: { templateKey: step.templateKey } },
      },
      select: { id: true, name: true, email: true },
    });

    for (const user of users) {
      try {
        const unsubscribeUrl = getUnsubscribeUrl(user.id);
        const html = step.render({
          userName: user.name || 'there',
          unsubscribeUrl,
          daysLeft: 14 - step.dayOffset,
        });

        const result = await sendEmail({
          to: user.email,
          subject: step.subject,
          html,
        });

        if (result.success) {
          await prisma.emailLog.create({
            data: { userId: user.id, templateKey: step.templateKey },
          });
          sent++;
        } else {
          skipped++;
        }
      } catch {
        skipped++;
      }
    }
  }

  return { sent, skipped };
}
