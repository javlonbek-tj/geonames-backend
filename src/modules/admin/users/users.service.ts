import bcrypt from 'bcryptjs';
import { eq, ilike, and, count, SQL } from 'drizzle-orm';
import { db } from '../../../db/db';
import { users } from '../../../db/schema';
import { AppError } from '../../../utils/appError';
import type {
  CreateUserInput,
  UpdateUserInput,
  ResetPasswordInput,
} from './users.schema';

const USER_SELECT = {
  id: users.id,
  username: users.username,
  fullName: users.fullName,
  role: users.role,
  position: users.position,
  regionId: users.regionId,
  districtId: users.districtId,
  isActive: users.isActive,
  isBlocked: users.isBlocked,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export async function getUsers(query: {
  page: number;
  limit: number;
  role?: string;
  search?: string;
}) {
  const { page, limit, role, search } = query;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];
  if (role) conditions.push(eq(users.role, role as any));
  if (search) conditions.push(ilike(users.username, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, [{ total }]] = await Promise.all([
    db.select(USER_SELECT).from(users).where(where).limit(limit).offset(offset),
    db.select({ total: count() }).from(users).where(where),
  ]);

  return {
    data,
    meta: {
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit),
    },
  };
}

export async function getUserById(id: number) {
  const [user] = await db
    .select(USER_SELECT)
    .from(users)
    .where(eq(users.id, id));
  if (!user) throw new AppError('Foydalanuvchi topilmadi', 404);
  return user;
}

export async function createUser(input: CreateUserInput) {
  const username = input.username.toLowerCase();

  const existing = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  if (existing) throw new AppError('Bu username allaqachon band', 409);

  const passwordHash = await bcrypt.hash(input.password, 12);

  const [user] = await db
    .insert(users)
    .values({
      username,
      passwordHash,
      fullName: input.fullName,
      role: input.role,
      position: input.position,
      regionId: input.regionId,
      districtId: input.districtId,
    })
    .returning(USER_SELECT);

  return user;
}

export async function updateUser(id: number, input: UpdateUserInput) {
  await getUserById(id);

  const [updated] = await db
    .update(users)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning(USER_SELECT);

  return updated;
}

export async function resetPassword(id: number, input: ResetPasswordInput) {
  await getUserById(id);

  const passwordHash = await bcrypt.hash(input.newPassword, 12);

  await db
    .update(users)
    .set({ passwordHash, passwordChangedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  await getUserById(id);
  await db.delete(users).where(eq(users.id, id));
}
