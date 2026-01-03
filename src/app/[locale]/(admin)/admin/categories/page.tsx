import { getCategoriesWithCount } from "@/features/tools/actions";
import { CategoriesTable } from "@/features/tools/components/categories-table";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [categories, t] = await Promise.all([
    getCategoriesWithCount(),
    getTranslations({ locale, namespace: "Admin.categoriesManagement" }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {t("toolCountLabel", { count: categories.length })}
          </div>
        </div>
      </div>

      <CategoriesTable categories={categories} />
    </div>
  );
}
