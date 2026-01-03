"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/button";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { createTag, updateTag, deleteTag } from "@/features/tools/actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface TagData {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string | null;
  toolCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TagsTableProps {
  tags: TagData[];
}

export function TagsTable({ tags: initialTags }: TagsTableProps) {
  const t = useTranslations("Admin.tagsManagement");
  const [tags, setTags] = useState(initialTags);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);

  const filteredTags = useMemo(() => {
    return tags.filter(
      (tag) =>
        tag.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.nameZh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tags, searchTerm]);

  const handleDelete = async (id: string, name: string, toolCount: number) => {
    if (toolCount > 0) {
      if (!confirm(t("confirmDeleteWithTools", { count: toolCount }))) {
        return;
      }
    } else {
      if (!confirm(t("confirmDelete", { name }))) {
        return;
      }
    }

    try {
      await deleteTag(id);
      setTags(tags.filter((t) => t.id !== id));
      toast.success(t("deleted"));
    } catch {
      toast.error(t("deleteFailed"));
    }
  };

  const handleEdit = (tag: TagData) => {
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTag(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  const handleTagSaved = (savedTag: TagData) => {
    if (editingTag) {
      setTags(tags.map((t) => (t.id === savedTag.id ? savedTag : t)));
    } else {
      setTags([...tags, savedTag]);
    }
    handleModalClose();
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md px-4 border border-border rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 bg-transparent text-foreground focus:outline-none"
          />
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t("addTag")}
        </Button>
      </div>

      {/* 标签网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTags.map((tag) => (
          <div
            key={tag.id}
            className="bg-background rounded-lg border border-border p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {tag.nameEn}
                </h3>
                {tag.nameZh && (
                  <p className="text-sm text-muted-foreground truncate">
                    {tag.nameZh}
                  </p>
                )}
                <code className="text-xs bg-secondary px-1.5 py-0.5 rounded mt-1 inline-block">
                  {tag.slug}
                </code>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => handleEdit(tag)}
                  className="p-1.5 rounded hover:bg-hover text-muted-foreground"
                  title={t("edit")}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    handleDelete(tag.id, tag.nameEn, tag.toolCount)
                  }
                  className="p-1.5 rounded hover:bg-hover text-red-600 dark:text-red-400"
                  title={t("delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {t("toolCountLabel", { count: tag.toolCount })}
            </div>
          </div>
        ))}
        {filteredTags.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {t("noData")}
          </div>
        )}
      </div>

      {/* 标签编辑模态框 */}
      {isModalOpen && (
        <TagFormModal
          tag={editingTag}
          onClose={handleModalClose}
          onSave={handleTagSaved}
        />
      )}
    </div>
  );
}

interface TagFormModalProps {
  tag: TagData | null;
  onClose: () => void;
  onSave: (tag: TagData) => void;
}

function TagFormModal({ tag, onClose, onSave }: TagFormModalProps) {
  const t = useTranslations("Admin.tagsManagement.modal");
  const isEditing = !!tag;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    slug: tag?.slug || "",
    nameEn: tag?.nameEn || "",
    nameZh: tag?.nameZh || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug || !formData.nameEn) {
      toast.error(t("requiredField"));
      return;
    }

    setLoading(true);
    try {
      if (isEditing && tag) {
        await updateTag({
          id: tag.id,
          ...formData,
          nameZh: formData.nameZh || undefined,
        });
        onSave({
          ...tag,
          ...formData,
          nameZh: formData.nameZh || null,
          updatedAt: new Date(),
        });
        toast.success(t("updated"));
      } else {
        const result = await createTag({
          ...formData,
          nameZh: formData.nameZh || undefined,
        });
        onSave({
          id: result.id,
          ...formData,
          nameZh: formData.nameZh || null,
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
      <div className="bg-background rounded-lg w-full max-w-md border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? t("editTitle") : t("addTitle")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              placeholder="chatgpt"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

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
              placeholder="ChatGPT"
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
              placeholder="聊天机器人"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
              {loading ? t("saving") : isEditing ? t("saveChanges") : t("createTag")}
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
