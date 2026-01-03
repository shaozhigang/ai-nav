"use server";

import { db } from "@/lib/db";
import { tool, toolCategory, toolTag, category, tag } from "@/lib/db/schema";
import { eq, desc, and, ilike, inArray, sql } from "drizzle-orm";
import { isAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

// ========== 类型定义 ==========
export type ToolStatus = "draft" | "published";

export interface CreateToolInput {
  slug: string;
  domain?: string;
  websiteUrl?: string;
  coverImageUrl?: string;
  logoUrl?: string;
  nameEn: string;
  descriptionEn?: string;
  nameZh?: string;
  descriptionZh?: string;
  status?: ToolStatus;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface UpdateToolInput extends Partial<CreateToolInput> {
  id: string;
}

export interface ToolListParams {
  page?: number;
  pageSize?: number;
  status?: ToolStatus;
  categoryId?: string;
  tagId?: string;
  search?: string;
}

// ========== 查询操作 ==========

/**
 * 获取工具列表（前台）
 */
export async function getPublishedTools(params: ToolListParams = {}) {
  const { page = 1, pageSize = 12, categoryId, tagId, search } = params;
  const offset = (page - 1) * pageSize;

  let toolIds: string[] | undefined;

  // 如果有分类筛选，先获取该分类下的工具 ID
  if (categoryId) {
    const categoryTools = await db
      .select({ toolId: toolCategory.toolId })
      .from(toolCategory)
      .where(eq(toolCategory.categoryId, categoryId));
    toolIds = categoryTools.map((t) => t.toolId);
    if (toolIds.length === 0) {
      return { tools: [], total: 0, page, pageSize };
    }
  }

  // 如果有标签筛选
  if (tagId) {
    const tagTools = await db
      .select({ toolId: toolTag.toolId })
      .from(toolTag)
      .where(eq(toolTag.tagId, tagId));
    const tagToolIds = tagTools.map((t) => t.toolId);

    if (toolIds) {
      toolIds = toolIds.filter((id) => tagToolIds.includes(id));
    } else {
      toolIds = tagToolIds;
    }

    if (toolIds.length === 0) {
      return { tools: [], total: 0, page, pageSize };
    }
  }

  // 构建查询条件
  const conditions = [eq(tool.status, "published")];

  if (toolIds) {
    conditions.push(inArray(tool.id, toolIds));
  }

  if (search) {
    conditions.push(
      sql`(${tool.nameEn} ILIKE ${`%${search}%`} OR ${tool.nameZh} ILIKE ${`%${search}%`} OR ${tool.descriptionEn} ILIKE ${`%${search}%`} OR ${tool.descriptionZh} ILIKE ${`%${search}%`})`
    );
  }

  // 查询工具
  const [tools, countResult] = await Promise.all([
    db
      .select()
      .from(tool)
      .where(and(...conditions))
      .orderBy(desc(tool.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(tool)
      .where(and(...conditions)),
  ]);

  return {
    tools,
    total: Number(countResult[0]?.count || 0),
    page,
    pageSize,
  };
}

/**
 * 根据 slug 获取工具详情
 */
export async function getToolBySlug(slug: string) {
  const [result] = await db
    .select()
    .from(tool)
    .where(and(eq(tool.slug, slug), eq(tool.status, "published")))
    .limit(1);

  if (!result) return null;

  // 获取关联的分类和标签
  const [categories, tags] = await Promise.all([
    db
      .select({ category })
      .from(toolCategory)
      .innerJoin(category, eq(toolCategory.categoryId, category.id))
      .where(eq(toolCategory.toolId, result.id)),
    db
      .select({ tag })
      .from(toolTag)
      .innerJoin(tag, eq(toolTag.tagId, tag.id))
      .where(eq(toolTag.toolId, result.id)),
  ]);

  return {
    ...result,
    categories: categories.map((c) => c.category),
    tags: tags.map((t) => t.tag),
  };
}

/**
 * 获取工具关联的分类和标签 ID（用于编辑表单回显）
 */
export async function getToolRelations(toolId: string) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  const [categoryRelations, tagRelations] = await Promise.all([
    db
      .select({ categoryId: toolCategory.categoryId })
      .from(toolCategory)
      .where(eq(toolCategory.toolId, toolId)),
    db
      .select({ tagId: toolTag.tagId })
      .from(toolTag)
      .where(eq(toolTag.toolId, toolId)),
  ]);

  return {
    categoryIds: categoryRelations.map((r) => r.categoryId),
    tagIds: tagRelations.map((r) => r.tagId),
  };
}

/**
 * 获取工具列表（后台，包含所有状态）
 */
export async function getToolsAdmin(params: ToolListParams = {}) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  const { page = 1, pageSize = 20, status, search } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (status) {
    conditions.push(eq(tool.status, status));
  }

  if (search) {
    conditions.push(
      sql`(${tool.nameEn} ILIKE ${`%${search}%`} OR ${tool.nameZh} ILIKE ${`%${search}%`})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [tools, countResult] = await Promise.all([
    db
      .select()
      .from(tool)
      .where(whereClause)
      .orderBy(desc(tool.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(tool)
      .where(whereClause),
  ]);

  return {
    tools,
    total: Number(countResult[0]?.count || 0),
    page,
    pageSize,
  };
}

// ========== 管理操作 ==========

/**
 * 创建工具
 */
export async function createTool(input: CreateToolInput) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  const id = nanoid();
  const { categoryIds, tagIds, ...toolData } = input;

  // 创建工具
  await db.insert(tool).values({
    id,
    ...toolData,
    status: toolData.status || "draft",
  });

  // 关联分类
  if (categoryIds && categoryIds.length > 0) {
    await db.insert(toolCategory).values(
      categoryIds.map((categoryId) => ({
        toolId: id,
        categoryId,
      }))
    );
  }

  // 关联标签
  if (tagIds && tagIds.length > 0) {
    await db.insert(toolTag).values(
      tagIds.map((tagId) => ({
        toolId: id,
        tagId,
      }))
    );
  }

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  return { success: true, id };
}

/**
 * 更新工具
 */
export async function updateTool(input: UpdateToolInput) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  const { id, categoryIds, tagIds, ...toolData } = input;

  // 更新工具基本信息
  await db
    .update(tool)
    .set({
      ...toolData,
      updatedAt: new Date(),
    })
    .where(eq(tool.id, id));

  // 更新分类关联
  if (categoryIds !== undefined) {
    await db.delete(toolCategory).where(eq(toolCategory.toolId, id));
    if (categoryIds.length > 0) {
      await db.insert(toolCategory).values(
        categoryIds.map((categoryId) => ({
          toolId: id,
          categoryId,
        }))
      );
    }
  }

  // 更新标签关联
  if (tagIds !== undefined) {
    await db.delete(toolTag).where(eq(toolTag.toolId, id));
    if (tagIds.length > 0) {
      await db.insert(toolTag).values(
        tagIds.map((tagId) => ({
          toolId: id,
          tagId,
        }))
      );
    }
  }

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath(`/tools/${input.slug}`);
  return { success: true };
}

/**
 * 删除工具
 */
export async function deleteTool(id: string) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  await db.delete(tool).where(eq(tool.id, id));

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  return { success: true };
}

/**
 * 更新工具状态
 */
export async function updateToolStatus(id: string, status: ToolStatus) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  await db
    .update(tool)
    .set({ status, updatedAt: new Date() })
    .where(eq(tool.id, id));

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  return { success: true };
}
