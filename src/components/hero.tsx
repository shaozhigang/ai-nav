"use client";

import { Button } from "./button";
import { HiArrowRight } from "react-icons/hi2";
import { motion } from "framer-motion";

import { LocaleLink } from "@/components/locale-link";
import { useTranslations } from 'next-intl';

export const Hero = () => {
  const t = useTranslations('hero');
  return (
    <div className="flex flex-col relative overflow-hidden">
      <motion.h1
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
        }}
        className="text-4xl md:text-6xl lg:text-[5rem] font-semibold max-w-6xl mx-auto text-center mt-6 relative z-10"
      >
        {t('title')}
      </motion.h1>
      <motion.h2
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
          delay: 0.2,
        }}
        className="text-center mt-6 text-base md:text-xl text-muted-foreground max-w-3xl mx-auto relative z-10 font-normal"
      >
        {t('description')}
      </motion.h2>
      <motion.div
        initial={{
          y: 80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
          delay: 0.4,
        }}
        className="flex items-center gap-4 justify-center mt-6 relative z-10"
      >
        <Button
          as={LocaleLink}
          href="/tools"
        >
          {t('cta.primary')}
        </Button>
        <Button
          variant="simple"
          as={LocaleLink}
          href="/blog"
          className="flex space-x-2 items-center group"
        >
          <span>{t('cta.secondary')}</span>
          <HiArrowRight className="text-muted-foreground group-hover:translate-x-1 stroke-[1px] h-3 w-3 transition-transform duration-200" />
        </Button>
      </motion.div>
    </div>
  );
};
