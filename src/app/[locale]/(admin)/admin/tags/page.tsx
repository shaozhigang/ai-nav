import { getTagsWithCount } from "@/features/tools/actions";
import { TagsTable } from "@/features/tools/components/tags-table";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";

export default async function AdminTagsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [tags, t] = await Promise.all([
    getTagsWithCount(),
    getTranslations({ locale, namespace: "Admin.tagsManagement" }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {t("toolCountLabel", { count: tags.length })}
          </div>
        </div>
      </div>

      <TagsTable tags={tags} />
    </div>
  );
}
