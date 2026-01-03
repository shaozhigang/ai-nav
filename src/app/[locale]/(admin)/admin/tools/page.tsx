import { getToolsAdmin } from "@/features/tools/actions";
import { ToolsTable } from "@/features/tools/components/tools-table";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";

export default async function AdminToolsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [{ tools, total }, t] = await Promise.all([
    getToolsAdmin({ pageSize: 100 }),
    getTranslations({ locale, namespace: "Admin.toolsManagement" }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">{t("totalCount", { count: total })}</div>
        </div>
      </div>

      <ToolsTable tools={tools} />
    </div>
  );
}
