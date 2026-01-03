import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale, type Locale } from '@/i18n.config';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the requestLocale promise to get the actual locale value
  let locale = await requestLocale;

  // If locale is undefined or invalid, use default locale
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    return {
      locale,
      messages
    };
  } catch (error) {
    console.error('Error loading messages for locale:', locale, error);
    notFound();
  }
});
