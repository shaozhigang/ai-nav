"use client";

import { useState } from "react";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { IoIosClose, IoIosMenu } from "react-icons/io";
import { Link } from "next-view-transitions";

import { Button } from "@/components/button";
import { Logo } from "@/components/Logo";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import { marketingNavigationKeys } from "@/features/navigation/config";

export const MobileNavbar = () => {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('navigation.main');
  const tCommon = useTranslations('common.actions');

  const { scrollY } = useScroll();

  const [showBackground, setShowBackground] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    if (value > 100) {
      setShowBackground(true);
    } else {
      setShowBackground(false);
    }
  });

  return (
    <div
      className={cn(
        "flex justify-between bg-background items-center w-full rounded-full px-4 py-2 transition duration-200",
        showBackground &&
          "bg-secondary shadow-[0px_-2px_0px_0px_hsl(var(--muted)),0px_2px_0px_0px_hsl(var(--muted))]"
      )}
    >
      <Logo />
      <IoIosMenu
        className="text-foreground h-6 w-6"
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col items-start justify-start pt-4 text-xl text-muted-foreground transition duration-200">
          <div className="flex items-center justify-between w-full px-5 pb-4 border-b border-border">
            <Logo />
            <div className="flex items-center gap-2">
              <ModeToggle />
              <button
                onClick={() => setOpen(!open)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <IoIosClose className="h-7 w-7 text-foreground" />
              </button>
            </div>
          </div>
          <div className="flex flex-col items-start justify-start gap-3 px-6 py-6 w-full overflow-y-auto flex-1">
            {marketingNavigationKeys.map((navItem) => (
              <div key={navItem.key} className="w-full">
                <Link
                  href={`/${locale}${navItem.href}`}
                  onClick={() => setOpen(false)}
                  className="relative block w-full py-2 hover:opacity-70 transition-opacity"
                >
                  <span className="block text-xl text-foreground font-semibold">
                    {t(navItem.key)}
                  </span>
                </Link>
              </div>
            ))}
          </div>
          <div className="flex flex-col w-full items-start gap-4 px-6 py-5 border-t border-border bg-secondary">
            <div className="w-full">
              <LanguageSwitcher />
            </div>
            {session.data?.user ? (
              <>
                <div className="flex flex-col gap-2 w-full">
                  <div className="pb-3 mb-2 border-b border-border">
                    <p className="text-[15px] font-semibold text-foreground">
                      {session.data.user.name || session.data.user.email}
                    </p>
                    {session.data.user.name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {session.data.user.email}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/${locale}/dashboard`}
                    onClick={() => setOpen(false)}
                    className="text-[15px] font-medium text-muted-foreground py-2 hover:text-foreground transition-colors"
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    href={`/${locale}/profile`}
                    onClick={() => setOpen(false)}
                    className="text-[15px] font-medium text-muted-foreground py-2 hover:text-foreground transition-colors"
                  >
                    {t('profile')}
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      setOpen(false);
                      router.push("/");
                      router.refresh();
                    }}
                    className="text-[15px] font-medium text-destructive py-2 text-left hover:opacity-80 transition-opacity"
                  >
                    {tCommon('signOut')}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2.5 w-full">
                <Button
                  as={Link}
                  href={`/${locale}/signup`}
                  onClick={() => setOpen(false)}
                  className="w-full justify-center"
                >
                  {tCommon('signUp')}
                </Button>
                <Button
                  variant="simple"
                  as={Link}
                  href={`/${locale}/login`}
                  onClick={() => setOpen(false)}
                  className="w-full justify-center"
                >
                  {tCommon('signIn')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
