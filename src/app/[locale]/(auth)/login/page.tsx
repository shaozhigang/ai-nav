import { LoginForm } from "@/features/auth/components/login-form";
import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import type { Locale } from "@/i18n.config";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  return {
    title: t('login.title'),
    description: t('login.description'),
    openGraph: {
      images: [t('login.ogImage')],
    },
  };
}

export default function LoginPage() {
  return <LoginForm />;
}
