import { Container } from "@/components/container";
import { Hero } from "@/components/hero";
import { Background } from "@/components/background";
import { CTA } from "@/components/cta";
import { FeaturedTools } from "@/components/featured-tools";
import { WebSiteJsonLd, OrganizationJsonLd } from "@/components/json-ld";
import { Metadata } from "next";
import { getTranslations, getLocale } from 'next-intl/server';
import type { Locale } from "@/i18n.config";
import { generatePageMetadata } from "@/lib/metadata";
import { getPublishedTools, getCategoriesWithCount } from "@/features/tools/actions";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });

  return generatePageMetadata({
    locale,
    path: '',
    title: t('title'),
    description: t('description'),
  });
}

export default async function Home() {
  const locale = await getLocale();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toolso.ai';

  // 获取精选工具和分类数据
  const [{ tools }, categories] = await Promise.all([
    getPublishedTools({ pageSize: 8 }),
    getCategoriesWithCount(),
  ]);

  return (
    <div className="relative">
      {/* Structured Data for SEO */}
      <WebSiteJsonLd
        name="Toolso.AI"
        description="Discover the best AI tools to boost your productivity"
        url={`${baseUrl}/${locale}`}
        locale={locale}
      />
      <OrganizationJsonLd
        name="Toolso.AI"
        url={baseUrl}
        logo={`${baseUrl}/banner.png`}
        sameAs={[
          'https://coolchange.ai',
          'https://chatppt.app',
          'https://aihealthguide.co',
        ]}
      />

      {/* Background 放在最外层，覆盖整个页面 */}
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <Background />
      </div>

      {/* Hero 部分 */}
      <Container className="flex flex-col items-center justify-center pt-32 pb-20 md:pt-40 md:pb-32">
        <Hero />
      </Container>

      {/* 精选工具部分 */}
      <div className="relative bg-background">
        <Container>
          <FeaturedTools tools={tools} categories={categories} />
        </Container>
      </div>

      {/* CTA 部分 */}
      <div className="relative">
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <Background />
        </div>
        <CTA />
      </div>
    </div>
  );
}
