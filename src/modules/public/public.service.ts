import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { and, eq, gt, inArray } from 'drizzle-orm';
import { db } from '../../db/db';
import {
  citizens,
  citizenOtps,
  publicDiscussions,
  publicVotes,
  geographicObjects,
} from '../../db/schema';
import { AppError } from '../../utils/appError';
import { ENV } from '../../config';
import { sendOtp } from '../telegram-bot/bot';

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function requestOtp(
  phone: string,
): Promise<{ sessionId: string }> {
  const citizen = await db.query.citizens.findFirst({
    where: eq(citizens.phone, phone),
  });

  if (!citizen) {
    throw new AppError(
      "Bu telefon raqam tizimda yo'q. Avval @geonomlar_bot botini ishga tushiring.",
      404,
    );
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const sessionId = randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(citizenOtps).values({ sessionId, phone, code, expiresAt });
  await sendOtp(citizen.telegramId, code);

  return { sessionId };
}

export async function verifyOtp(
  sessionId: string,
  code: string,
): Promise<{
  accessToken: string;
  citizen: {
    id: number;
    telegramId: string;
    fullName: string | null;
    phone: string | null;
  };
}> {
  const otp = await db.query.citizenOtps.findFirst({
    where: and(
      eq(citizenOtps.sessionId, sessionId),
      eq(citizenOtps.used, false),
      gt(citizenOtps.expiresAt, new Date()),
    ),
  });

  if (!otp) throw new AppError("Kod noto'g'ri yoki muddati o'tgan", 400);
  if (otp.code !== code) throw new AppError("Noto'g'ri tasdiqlash kodi", 400);

  await db
    .update(citizenOtps)
    .set({ used: true })
    .where(eq(citizenOtps.id, otp.id));

  const citizen = await db.query.citizens.findFirst({
    where: otp.telegramId
      ? eq(citizens.telegramId, otp.telegramId)
      : eq(citizens.phone, otp.phone!),
  });
  if (!citizen) throw new AppError('Fuqaro topilmadi', 404);

  const accessToken = jwt.sign(
    { citizenId: citizen.id, telegramId: citizen.telegramId },
    ENV.JWT_CITIZEN_SECRET,
    { expiresIn: '30d' },
  );

  return {
    accessToken,
    citizen: {
      id: citizen.id,
      telegramId: citizen.telegramId,
      fullName: citizen.fullName,
      phone: citizen.phone,
    },
  };
}

// ─── Discussions ─────────────────────────────────────────────────────────────

export async function listDiscussions(
  citizenId: number | null,
  filters: { regionId?: number; districtId?: number } = {},
) {
  let discussionWhere = undefined;

  if (filters.districtId || filters.regionId) {
    const geoConditions = [];
    if (filters.districtId)
      geoConditions.push(eq(geographicObjects.districtId, filters.districtId));
    if (filters.regionId)
      geoConditions.push(eq(geographicObjects.regionId, filters.regionId));

    const matchingIds = (
      await db
        .select({ id: geographicObjects.id })
        .from(geographicObjects)
        .where(and(...geoConditions))
    ).map((g) => g.id);

    if (matchingIds.length === 0) return [];
    discussionWhere = inArray(publicDiscussions.geoObjectId, matchingIds);
  }

  const filtered = await db.query.publicDiscussions.findMany({
    where: discussionWhere,
    with: {
      geoObject: {
        with: {
          objectType: true,
          district: true,
          region: true,
        },
      },
      votes: { columns: { vote: true, citizenId: true } },
    },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  return filtered.map((d) => {
    const geo = d.geoObject;
    const supportCount = d.votes.filter((v) => v.vote === 'support').length;
    const opposeCount = d.votes.filter((v) => v.vote === 'oppose').length;
    const myVote = citizenId
      ? (d.votes.find((v) => v.citizenId === citizenId)?.vote ?? null)
      : null;
    return {
      id: d.id,
      applicationId: d.applicationId,
      geoObjectId: d.geoObjectId,
      proposedNameUz: geo?.nameUz ?? '—',
      proposedNameKrill: geo?.nameKrill ?? null,
      objectType: geo?.objectType?.nameUz ?? '—',
      regionName: geo?.region?.nameUz ?? null,
      districtName: geo?.district?.nameUz ?? null,
      endsAt: d.endsAt.toISOString(),
      createdAt: d.createdAt.toISOString(),
      supportCount,
      opposeCount,
      voteCount: supportCount + opposeCount,
      myVote: myVote as 'support' | 'oppose' | null,
    };
  });
}

export async function getDiscussion(id: number, citizenId: number | null) {
  const discussion = await db.query.publicDiscussions.findFirst({
    where: eq(publicDiscussions.id, id),
    with: {
      geoObject: {
        with: {
          objectType: { with: { category: true } },
          district: true,
          region: true,
        },
      },
      votes: citizenId
        ? { where: eq(publicVotes.citizenId, citizenId) }
        : { where: eq(publicVotes.citizenId, -1) },
    },
  });

  if (!discussion) throw new AppError('Muhokama topilmadi', 404);

  const allVotes = await db.query.publicVotes.findMany({
    where: eq(publicVotes.discussionId, id),
    columns: { vote: true },
  });

  const supportCount = allVotes.filter((v) => v.vote === 'support').length;
  const opposeCount = allVotes.filter((v) => v.vote === 'oppose').length;

  const geo = discussion.geoObject;

  return {
    id: discussion.id,
    applicationId: discussion.applicationId,
    geoObjectId: discussion.geoObjectId,
    proposedNameUz: geo?.nameUz ?? '—',
    proposedNameKrill: geo?.nameKrill ?? null,
    objectType: geo?.objectType?.nameUz ?? '—',
    category: geo?.objectType?.category?.nameUz ?? null,
    regionName: geo?.region?.nameUz ?? null,
    districtName: geo?.district?.nameUz ?? null,
    geometry: (geo?.geometry ?? null) as object | null,
    endsAt: discussion.endsAt.toISOString(),
    supportCount,
    opposeCount,
    voteCount: supportCount + opposeCount,
    myVote: (discussion.votes[0]?.vote ?? null) as 'support' | 'oppose' | null,
  };
}

export async function submitVote(
  discussionId: number,
  citizenId: number,
  vote: 'support' | 'oppose',
) {
  const discussion = await db.query.publicDiscussions.findFirst({
    where: eq(publicDiscussions.id, discussionId),
  });
  if (!discussion) throw new AppError('Muhokama topilmadi', 404);
  if (discussion.endsAt < new Date())
    throw new AppError('Muhokama muddati tugagan', 400);

  const existing = await db.query.publicVotes.findFirst({
    where: and(
      eq(publicVotes.discussionId, discussionId),
      eq(publicVotes.citizenId, citizenId),
    ),
  });
  if (existing) throw new AppError('Siz allaqachon ovoz bergansiz', 409);

  await db.insert(publicVotes).values({ discussionId, citizenId, vote });
}

// ─── Used by applications service when submitting to public discussion ────────

export async function createDiscussion(applicationId: number): Promise<void> {
  const endsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days

  const geoObjs = await db.query.geographicObjects.findMany({
    where: eq(geographicObjects.applicationId, applicationId),
    columns: { id: true },
  });

  if (geoObjs.length === 0) return;

  await db
    .insert(publicDiscussions)
    .values(geoObjs.map((g) => ({ applicationId, geoObjectId: g.id, endsAt })))
    .onConflictDoUpdate({
      target: [publicDiscussions.applicationId, publicDiscussions.geoObjectId],
      set: { endsAt, createdAt: new Date() },
    });
}

export async function getDiscussionResults(applicationId: number) {
  const discussion = await db.query.publicDiscussions.findFirst({
    where: eq(publicDiscussions.applicationId, applicationId),
    with: { votes: true },
  });
  if (!discussion) return null;

  const support = discussion.votes.filter((v) => v.vote === 'support').length;
  const oppose = discussion.votes.filter((v) => v.vote === 'oppose').length;

  return {
    id: discussion.id,
    endsAt: discussion.endsAt.toISOString(),
    supportCount: support,
    opposeCount: oppose,
    total: discussion.votes.length,
  };
}
