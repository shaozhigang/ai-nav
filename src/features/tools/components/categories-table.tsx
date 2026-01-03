"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/button";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/features/tools/actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface CategoryData {
  id: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  nameEn: string;
  descriptionEn: string | null;
  nameZh: string | null;
  descriptionZh: string | null;
  toolCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoriesTableProps {
  categories: CategoryData[];
}

export function CategoriesTable({
  categories: initialCategories,
}: CategoriesTableProps) {
  const t = useTranslations("Admin.categoriesManagement");
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(
    null
  );

  const handleDelete = async (id: string, name: string, toolCount: number) => {
    if (toolCount > 0) {
      toast.error(t("cannotDelete", { count: toolCount }));
      return;
    }

    if (!confirm(t("confirmDelete", { name }))) {
      return;
    }

    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      toast.success(t("deleted"));
    } catch {
      toast.error(t("deleteFailed"));
    }
  };

  const handleEdit = (category: CategoryData) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleCategorySaved = (savedCategory: CategoryData) => {
    if (editingCategory) {
      setCategories(
        categories.map((c) => (c.id === savedCategory.id ? savedCategory : c))
      );
    } else {
      setCategories([...categories, savedCategory]);
    }
    handleModalClose();
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-end">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t("addCategory")}
        </Button>
      </div>

      {/* 分类表格 */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                  {t("order")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("category")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("slug")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("toolCount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category) => (
                  <tr key={category.id} className="hover:bg-hover">
                    <td className="px-6 py-4">
                      <div className="flex items-center text-muted-foreground cursor-move">
                        <GripVertical className="h-4 w-4" />
                        <span className="ml-2 text-sm">{category.sortOrder}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {category.icon && (
                          <span className="text-xl">{category.icon}</span>
                        )}
                        <div>
                          <div className="font-medium text-foreground">
                            {category.nameEn}
                          </div>
                          {category.nameZh && (
                            <div className="text-sm text-muted-foreground">
                              {category.nameZh}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-secondary px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {t("toolCountLabel", { count: category.toolCount })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1.5 rounded hover:bg-hover text-muted-foreground"
                          title={t("edit")}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              category.id,
                              category.nameEn,
                              category.toolCount
                            )
                          }
                          className="p-1.5 rounded hover:bg-hover text-red-600 dark:text-red-400"
                          title={t("delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分类编辑模态框 */}
      {isModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={handleModalClose}
          onSave={handleCategorySaved}
        />
      )}
    </div>
  );
}

interface CategoryFormModalProps {
  category: CategoryData | null;
  onClose: () => void;
  onSave: (category: CategoryData) => void;
}

function CategoryFormModal({
  category,
  onClose,
  onSave,
}: CategoryFormModalProps) {
  const t = useTranslations("Admin.categoriesManagement.modal");
  const isEditing = !!category;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    slug: category?.slug || "",
    icon: category?.icon || "",
    sortOrder: category?.sortOrder || 0,
    nameEn: category?.nameEn || "",
    descriptionEn: category?.descriptionEn || "",
    nameZh: category?.nameZh || "",
    descriptionZh: category?.descriptionZh || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug || !formData.nameEn) {
      toast.error(t("requiredField"));
      return;
    }

    setLoading(true);
    try {
      if (isEditing && category) {
        await updateCategory({
          id: category.id,
          ...formData,
          icon: formData.icon || undefined,
          descriptionEn: formData.descriptionEn || undefined,
          nameZh: formData.nameZh || undefined,
          descriptionZh: formData.descriptionZh || undefined,
        });
        onSave({
          ...category,
          ...formData,
          icon: formData.icon || null,
          descriptionEn: formData.descriptionEn || null,
          nameZh: formData.nameZh || null,
          descriptionZh: formData.descriptionZh || null,
          updatedAt: new Date(),
        });
        toast.success(t("updated"));
      } else {
        const result = await createCategory({
          ...formData,
          icon: formData.icon || undefined,
          descriptionEn: formData.descriptionEn || undefined,
          nameZh: formData.nameZh || undefined,
          descriptionZh: formData.descriptionZh || undefined,
        });
        onSave({
          id: result.id,
          ...formData,
          icon: formData.icon || null,
          descriptionEn: formData.descriptionEn || null,
          nameZh: formData.nameZh || null,
          descriptionZh: formData.descriptionZh || null,
          toolCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success(t("created"));
      }
    } catch {
      toast.error(isEditing ? t("updateFailed") : t("createFailed"));
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-background rounded-lg w-full max-w-lg border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? t("editTitle") : t("addTitle")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t("slug")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="ai-tools"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t("icon")}
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="🤖"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t("nameEn")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                placeholder="AI Tools"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t("nameZh")}
              </label>
              <input
                type="text"
                value={formData.nameZh}
                onChange={(e) =>
                  setFormData({ ...formData, nameZh: e.target.value })
                }
                placeholder="AI 工具"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t("sortOrder")}
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t("descriptionEn")}
            </label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) =>
                setFormData({ ...formData, descriptionEn: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t("descriptionZh")}
            </label>
            <textarea
              value={formData.descriptionZh}
              onChange={(e) =>
                setFormData({ ...formData, descriptionZh: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("saving") : isEditing ? t("saveChanges") : t("createCategory")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  // 使用 Portal 将弹窗渲染到 body，避免被父元素的 overflow 影响
  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
