"use client";

import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Container } from "@/components/container";
import { Background } from "@/components/background";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const session = useSession();
  const locale = useLocale();
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  // Authentication is already handled in the layout
  const user = session.data?.user;
  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  // Format registration date
  const formatMemberSince = () => {
    if (!user?.createdAt) return "-";
    const date = new Date(user.createdAt);
    return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <Container className="relative z-10 py-20">
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Background />
      <Container className="relative z-10 py-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              {t("title")}
            </h1>
            <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ease: "easeOut", duration: 0.5, delay: 0.1 }}
            className="bg-card/50 backdrop-blur-md rounded-3xl p-8 border border-border"
          >
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ease: "easeOut", duration: 0.5, delay: 0.2 }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl mb-6 ring-4 ring-border/50"
              >
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user?.name || "User"}
                    width={128}
                    height={128}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  initial
                )}
              </motion.div>
              <h2 className="text-3xl font-bold text-card-foreground mb-2">
                {user?.name || t("sections.basicInfo.nameNotSet")}
              </h2>
              <p className="text-lg text-muted-foreground">{user?.email}</p>
            </div>

            {/* Information Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ ease: "easeOut", duration: 0.5, delay: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    {t("sections.basicInfo.title")}
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <span className="text-sm text-muted-foreground block mb-1">
                        {t("sections.basicInfo.fullName")}
                      </span>
                      <span className="text-lg font-medium text-card-foreground">
                        {user?.name || t("sections.basicInfo.notSet")}
                      </span>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <span className="text-sm text-muted-foreground block mb-1">
                        {t("sections.basicInfo.email")}
                      </span>
                      <span className="text-lg font-medium text-card-foreground">
                        {user?.email}
                      </span>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <span className="text-sm text-muted-foreground block mb-1">
                        {t("sections.basicInfo.verificationStatus")}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-600">
                        {tCommon("status.verified")}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Account Information */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ ease: "easeOut", duration: 0.5, delay: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    {t("sections.accountSettings.title")}
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <span className="text-sm text-muted-foreground block mb-1">
                        {t("sections.accountSettings.memberSince")}
                      </span>
                      <span className="text-lg font-medium text-card-foreground">
                        {formatMemberSince()}
                      </span>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <span className="text-sm text-muted-foreground block mb-1">
                        {t("sections.basicInfo.accountId")}
                      </span>
                      <span className="text-lg font-medium text-card-foreground font-mono">
                        {user?.id || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}
