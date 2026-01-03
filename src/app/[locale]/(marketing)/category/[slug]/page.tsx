import { notFound, redirect } from "next/navigation";
import { getCategoryBySlug } from "@/features/tools/actions";
import { getLocale } from "next-intl/server";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.nameEn} - AI Tools`,
    description: category.descriptionEn || `Explore ${category.nameEn} AI tools`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // 重定向到工具列表页并带上分类参数
  redirect(`/${locale}/tools?category=${slug}`);
}
