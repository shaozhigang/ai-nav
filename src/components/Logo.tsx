"use client";
import Link from "next/link";
import React from "react";

export const LogoIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
    >
      {/* 圆形背景 */}
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      {/* 字母 T - 代表 Toolso */}
      <path
        d="M8 8h8M12 8v8"
        stroke="hsl(var(--background))"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* AI 小星芒装饰 */}
      <circle cx="17" cy="7" r="1.5" fill="hsl(var(--background))" />
    </svg>
  );
};

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm mr-4 text-foreground px-2 py-1 relative z-20"
    >
      <LogoIcon />
      <span className="font-medium text-foreground">Toolso.AI</span>
    </Link>
  );
};
