"use client";

import { useTranslations } from "next-intl";
import { Users, Activity } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
  };
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  }[];
}

export function AdminDashboard({ stats, recentUsers }: AdminDashboardProps) {
  const t = useTranslations("Admin.dashboard");
  const locale = useLocale();

  const statCards = [
    {
      title: t("totalUsers"),
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "bg-muted",
      link: `/admin/users`,
    },
    {
      title: t("activeUsers"),
      value: stats.activeUsers.toLocaleString(),
      icon: Activity,
      color: "bg-muted",
      link: `/admin/users`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <span className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(locale, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={`/${locale}${stat.link}`}
              className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 最近注册的用户 */}
      <div className="bg-background rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">{t("recentUsers")}</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      user.role === "admin"
                        ? "bg-foreground text-background font-medium"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {user.role}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(user.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href={`/${locale}/admin/users`}
            className="block mt-4 text-center text-sm text-muted-foreground hover:text-hover-foreground hover:underline"
          >
            {t("viewAllUsers")}
          </Link>
        </div>
      </div>
    </div>
  );
}
