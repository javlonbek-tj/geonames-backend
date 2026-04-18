import { eq, ilike } from 'drizzle-orm';
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
    with: { objectTypes: true },
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
  const typesCount = await db.query.objectTypes.findFirst({
    where: eq(objectTypes.categoryId, id),
  });

  if (typesCount) {
    throw new AppError(
      "Bu kategoriyaga bog'liq turlar mavjud. Avval turlarni o'chiring",
      409,
    );
  }

  const [deleted] = await db
    .delete(objectCategories)
    .where(eq(objectCategories.id, id))
    .returning();

  if (!deleted) throw new AppError('Kategoriya topilmadi', 404);
}

// ─── Types ───────────────────────────────────────────────────────────────────

export async function getTypes(categoryId?: number) {
  return db.query.objectTypes.findMany({
    where: categoryId ? eq(objectTypes.categoryId, categoryId) : undefined,
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
  const [deleted] = await db
    .delete(objectTypes)
    .where(eq(objectTypes.id, id))
    .returning();

  if (!deleted) throw new AppError('Tur topilmadi', 404);
}
