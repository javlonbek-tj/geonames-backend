import { eq, ilike, and } from 'drizzle-orm';
import { db } from '../../../db/db';
import { objectCategories, objectTypes } from '../../../db/schema';
import { AppError } from '../../../utils/appError';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateTypeInput,
  UpdateTypeInput,
} from './object-types.schema';

// ─── Categories ────────────────────────────────────────────────────────────

export async function getCategories() {
  return db.query.objectCategories.findMany({
    where: eq(objectCategories.isActive, true),
    with: {
      objectTypes: {
        where: eq(objectTypes.isActive, true),
      },
    },
    orderBy: (c, { asc }) => asc(c.nameUz),
  });
}

export async function createCategory(input: CreateCategoryInput) {
  const existing = await db.query.objectCategories.findFirst({
    where: ilike(objectCategories.code, input.code),
  });
  if (existing) {
    throw new AppError(`"${input.code.toUpperCase()}" kodi allaqachon mavjud`, 409);
  }

  const [category] = await db
    .insert(objectCategories)
    .values(input)
    .returning();
  return category;
}

export async function updateCategory(id: number, input: UpdateCategoryInput) {
  const [updated] = await db
    .update(objectCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(objectCategories.id, id))
    .returning();

  if (!updated) throw new AppError('Kategoriya topilmadi', 404);
  return updated;
}

export async function deleteCategory(id: number) {
  const category = await db.query.objectCategories.findFirst({
    where: eq(objectCategories.id, id),
  });
  if (!category) throw new AppError('Kategoriya topilmadi', 404);

  await db.transaction(async (tx) => {
    await tx
      .update(objectTypes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(objectTypes.categoryId, id), eq(objectTypes.isActive, true)));

    await tx
      .update(objectCategories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(objectCategories.id, id));
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────

export async function getTypes(categoryId?: number) {
  return db.query.objectTypes.findMany({
    where: categoryId
      ? and(eq(objectTypes.categoryId, categoryId), eq(objectTypes.isActive, true))
      : eq(objectTypes.isActive, true),
    with: { category: true },
    orderBy: (t, { asc }) => asc(t.nameUz),
  });
}

export async function createType(input: CreateTypeInput) {
  const category = await db.query.objectCategories.findFirst({
    where: eq(objectCategories.id, input.categoryId),
  });
  if (!category) throw new AppError('Kategoriya topilmadi', 404);

  const [type] = await db.insert(objectTypes).values(input).returning();
  return type;
}

export async function updateType(id: number, input: UpdateTypeInput) {
  if (input.categoryId) {
    const category = await db.query.objectCategories.findFirst({
      where: eq(objectCategories.id, input.categoryId),
    });
    if (!category) throw new AppError('Kategoriya topilmadi', 404);
  }

  const [updated] = await db
    .update(objectTypes)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(objectTypes.id, id))
    .returning();

  if (!updated) throw new AppError('Tur topilmadi', 404);
  return updated;
}

export async function deleteType(id: number) {
  const type = await db.query.objectTypes.findFirst({
    where: eq(objectTypes.id, id),
  });
  if (!type) throw new AppError('Tur topilmadi', 404);

  await db
    .update(objectTypes)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(objectTypes.id, id));
}
