import { eq, and } from 'drizzle-orm';
import { db } from '../../db/db';
import { commissionApprovals, applications, users } from '../../db/schema';
import { AppError } from '../../utils/appError';
import { APP_STATUS } from '../../constants/app-status';
import type { JwtPayload } from '../auth/auth.service';

export const REQUIRED_POSITIONS = [
  'hokim', 'hokim_deputy', 'economics_head', 'construction_head',
  'poverty_head', 'ecology_head', 'culture_head', 'spirituality_head',
  'newspaper_head', 'dkp_head', 'historian', 'linguist', 'geographer',
] as const;

export async function getApprovals(applicationId: number) {
  return db.query.commissionApprovals.findMany({
    where: eq(commissionApprovals.applicationId, applicationId),
    with: {
      user: { columns: { id: true, fullName: true, username: true } },
    },
    orderBy: (t, { asc }) => asc(t.createdAt),
  });
}

async function checkAndGetUser(user: JwtPayload) {
  const userData = await db.query.users.findFirst({
    where: eq(users.id, user.userId),
    columns: { position: true, districtId: true },
  });
  if (!userData?.position) {
    throw new AppError("Sizning lavozimingiz belgilanmagan. Administrator bilan bog'laning.", 400);
  }
  return userData as { position: NonNullable<typeof userData.position>; districtId: number | null };
}

async function checkStep(applicationId: number, userData: { districtId: number | null }) {
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: { geographicObjects: { columns: { districtId: true }, limit: 1 } },
  });
  if (!app) throw new AppError('Ariza topilmadi', 404);
  if (app.currentStatus !== APP_STATUS.STEP_2_1_DISTRICT_COMMISSION) {
    throw new AppError("Ariza tuman komissiyasi bosqichida emas", 400);
  }
  const geoDistrict = app.geographicObjects?.[0]?.districtId;
  if (userData.districtId && geoDistrict && userData.districtId !== geoDistrict) {
    throw new AppError("Bu ariza sizning tumaningizga tegishli emas", 403);
  }
}

export async function approve(applicationId: number, user: JwtPayload) {
  const userData = await checkAndGetUser(user);
  await checkStep(applicationId, userData);

  await db.insert(commissionApprovals)
    .values({ applicationId, userId: user.userId, position: userData.position, approved: true })
    .onConflictDoUpdate({
      target: [commissionApprovals.applicationId, commissionApprovals.position],
      set: { userId: user.userId, approved: true, comment: null, createdAt: new Date() },
    });

  const all = await db.query.commissionApprovals.findMany({
    where: eq(commissionApprovals.applicationId, applicationId),
    columns: { position: true, approved: true },
  });

  const approvedCount = all.filter((a) => a.approved).length;
  return { approvedCount, total: REQUIRED_POSITIONS.length };
}

export async function reject(applicationId: number, user: JwtPayload, comment: string) {
  if (!comment?.trim()) throw new AppError("Rad etish sababi kiritilishi shart", 400);

  const userData = await checkAndGetUser(user);
  await checkStep(applicationId, userData);

  await db.insert(commissionApprovals)
    .values({ applicationId, userId: user.userId, position: userData.position, approved: false, comment: comment.trim() })
    .onConflictDoUpdate({
      target: [commissionApprovals.applicationId, commissionApprovals.position],
      set: { userId: user.userId, approved: false, comment: comment.trim(), createdAt: new Date() },
    });

  return { message: "Rad etildi" };
}

export async function revokeApproval(applicationId: number, user: JwtPayload) {
  const userData = await checkAndGetUser(user);

  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    columns: { currentStatus: true },
  });
  if (app?.currentStatus !== APP_STATUS.STEP_2_1_DISTRICT_COMMISSION) {
    throw new AppError("Kelishuvni qaytarib bo'lmaydi — ariza boshqa bosqichda", 400);
  }

  await db.delete(commissionApprovals).where(
    and(
      eq(commissionApprovals.applicationId, applicationId),
      eq(commissionApprovals.position, userData.position),
    ),
  );
}
