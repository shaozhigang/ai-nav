import { pgTable, text, timestamp, integer, primaryKey, index } from "drizzle-orm/pg-core";

// ========== 工具表 ==========
export const tool = pgTable("tool", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  domain: text("domain"),
  websiteUrl: text("website_url"),
  coverImageUrl: text("cover_image_url"),
  logoUrl: text("logo_url"),

  // 英文字段
  nameEn: text("name_en").notNull(),
  descriptionEn: text("description_en"),

  // 中文字段
  nameZh: text("name_zh"),
  descriptionZh: text("description_zh"),

  // 状态: draft | published
  status: text("status").notNull().default("draft"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("tool_slug_idx").on(table.slug),
  index("tool_status_idx").on(table.status),
]);

// ========== 分类表 ==========
export const category = pgTable("category", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),

  // 英文字段
  nameEn: text("name_en").notNull(),
  descriptionEn: text("description_en"),

  // 中文字段
  nameZh: text("name_zh"),
  descriptionZh: text("description_zh"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("category_slug_idx").on(table.slug),
  index("category_sort_order_idx").on(table.sortOrder),
]);

// ========== 标签表 ==========
export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),

  // 英文字段
  nameEn: text("name_en").notNull(),

  // 中文字段
  nameZh: text("name_zh"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("tag_slug_idx").on(table.slug),
]);

// ========== 工具-分类关联表 ==========
export const toolCategory = pgTable("tool_category", {
  toolId: text("tool_id")
    .notNull()
    .references(() => tool.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => category.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.toolId, table.categoryId] }),
  index("tool_category_tool_id_idx").on(table.toolId),
  index("tool_category_category_id_idx").on(table.categoryId),
]);

// ========== 工具-标签关联表 ==========
export const toolTag = pgTable("tool_tag", {
  toolId: text("tool_id")
    .notNull()
    .references(() => tool.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tag.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.toolId, table.tagId] }),
  index("tool_tag_tool_id_idx").on(table.toolId),
  index("tool_tag_tag_id_idx").on(table.tagId),
]);
