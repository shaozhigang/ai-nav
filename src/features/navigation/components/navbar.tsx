"use client";

import { DesktopNavbar } from "./desktop-navbar";
import { MobileNavbar } from "./mobile-navbar";

export function NavBar() {
  return (
    <nav className="fixed top-4 z-50 w-[95%] lg:w-full max-w-7xl mx-auto inset-x-0 animate-fade-in">
      <div className="hidden lg:block w-full">
        <DesktopNavbar />
      </div>
      <div className="flex h-full w-full items-center lg:hidden ">
        <MobileNavbar />
      </div>
    </nav>
  );
}

{
  /* <div className="hidden md:block ">
        <DesktopNavbar />
      </div>
      <div className="flex h-full w-full items-center md:hidden ">
        <MobileNavbar navItems={navItems} />
      </div> */
}
