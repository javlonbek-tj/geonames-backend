import TelegramBot from 'node-telegram-bot-api';
import { ENV } from '../../config';
import { db } from '../../db/db';
import { citizens } from '../../db/schema';
import { eq } from 'drizzle-orm';

let bot: TelegramBot | null = null;

export function getBot(): TelegramBot | null {
  return bot;
}

export async function sendOtp(telegramId: string, code: string): Promise<void> {
  if (!bot) throw new Error('Telegram bot ishga tushmagan');
  await bot.sendMessage(
    telegramId,
    `🔐 Geonomlar tasdiqlash kodi:\n\n*${code}*\n\n_Kod 5 daqiqa davomida amal qiladi._`,
    { parse_mode: 'Markdown' },
  );
}

export function startBot(): void {
  if (!ENV.TELEGRAM_BOT_TOKEN) {
    console.warn('[Bot] TELEGRAM_BOT_TOKEN mavjud emas, bot ishga tushmadi');
    return;
  }

  bot = new TelegramBot(ENV.TELEGRAM_BOT_TOKEN, { polling: true });

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = String(chatId);

    try {
      await db
        .insert(citizens)
        .values({
          telegramId,
          fullName:
            [msg.from?.first_name, msg.from?.last_name]
              .filter(Boolean)
              .join(' ') || null,
          username: msg.from?.username ?? null,
        })
        .onConflictDoUpdate({
          target: citizens.telegramId,
          set: {
            fullName:
              [msg.from?.first_name, msg.from?.last_name]
                .filter(Boolean)
                .join(' ') || null,
            username: msg.from?.username ?? null,
            updatedAt: new Date(),
          },
        });

      await bot!.sendMessage(
        chatId,
        `Assalomu alaykum! Geonomlar portaliga xush kelibsiz.\n\nTizimga kirish uchun telefon raqamingizni ulashing:`,
        {
          reply_markup: {
            keyboard: [
              [{ text: '📱 Telefon raqamni ulashish', request_contact: true }],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        },
      );
    } catch (err) {
      console.error('[Bot] /start xatolik:', err);
    }
  });

  bot.on('contact', async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = String(chatId);
    const phone = msg.contact?.phone_number;

    if (!phone) return;

    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    try {
      await db
        .update(citizens)
        .set({ phone: normalizedPhone, updatedAt: new Date() })
        .where(eq(citizens.telegramId, telegramId));

      await bot!.sendMessage(
        chatId,
        `✅ Telefon raqamingiz saqlandi: *${normalizedPhone}*\n\nEndi Geonomlar axborot portaliga kirishingiz mumkin.`,
        { parse_mode: 'Markdown', reply_markup: { remove_keyboard: true } },
      );
    } catch (err) {
      console.error('[Bot] contact xatolik:', err);
    }
  });

  bot.on('polling_error', (err) => {
    console.error('[Bot] Polling xatolik:', err.message);
    if (err.message.includes('409')) {
      bot!
        .stopPolling()
        .then(() => {
          setTimeout(() => bot!.startPolling(), 5000);
        })
        .catch(() => {});
    }
  });

  console.log('[Bot] Telegram bot polling rejimida ishga tushdi');
}
