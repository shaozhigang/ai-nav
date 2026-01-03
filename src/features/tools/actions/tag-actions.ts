"use server";

import { db } from "@/lib/db";
import { tag, toolTag } from "@/lib/db/schema";
import { eq, asc, sql, ilike } from "drizzle-orm";
import { isAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

// ========== 类型定义 ==========
export interface CreateTagInput {
  slug: string;
  nameEn: string;
  nameZh?: string;
}

export interface UpdateTagInput extends Partial<CreateTagInput> {
  id: string;
}

// ========== 查询操作 ==========

/**
 * 获取所有标签
 */
export async function getTags() {
  const tags = await db.select().from(tag).orderBy(asc(tag.nameEn));

  return tags;
}

/**
 * 获取标签及其工具数量
 */
export async function getTagsWithCount() {
  const result = await db
    .select({
      tag,
      toolCount: sql<number>`count(${toolTag.toolId})`,
    })
    .from(tag)
    .leftJoin(toolTag, eq(tag.id, toolTag.tagId))
    .groupBy(tag.id)
    .orderBy(asc(tag.nameEn));

  return result.map((r) => ({
    ...r.tag,
    toolCount: Number(r.toolCount),
  }));
}

/**
 * 搜索标签
 */
export async function searchTags(query: string) {
  const tags = await db
    .select()
    .from(tag)
    .where(ilike(tag.nameEn, `%${query}%`))
    .orderBy(asc(tag.nameEn))
    .limit(20);

  return tags;
}

// ========== 管理操作 ==========

/**
 * 创建标签
 */
export async function createTag(input: CreateTagInput) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  const id = nanoid();

  await db.insert(tag).values({
    id,
    ...input,
  });

  revalidatePath("/admin/tags");
  return { success: true, id };
}

/**
 * 更新标签
 */
export async function updateTag(input: UpdateTagInput) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  const { id, ...data } = input;

  await db
    .update(tag)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tag.id, id));

  revalidatePath("/admin/tags");
  return { success: true };
}

/**
 * 删除标签
 */
export async function deleteTag(id: string) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  await db.delete(tag).where(eq(tag.id, id));

  revalidatePath("/admin/tags");
  return { success: true };
}

/**
 * 批量创建标签
 */
export async function createTagsBatch(
  inputs: CreateTagInput[]
) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  const tags = inputs.map((input) => ({
    id: nanoid(),
    ...input,
  }));

  await db.insert(tag).values(tags);

  revalidatePath("/admin/tags");
  return { success: true, ids: tags.map((t) => t.id) };
}
