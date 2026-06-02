"use client";

import React, { useState, useEffect } from "react";
import { getTier } from "@/lib/loyalty";
import type { Session } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/database.types";
import { Button } from "@/app/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/app/components/ui/navigation-menu";
import { Menu, X, User, Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  activeSection: string;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  userSession: Session | null;
  userProfile: UserProfile | null;
  unreadReplies: number;
}

export default function Header({
  isScrolled,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activeSection,
  scrollToSection,
  userSession,
  userProfile,
  unreadReplies,
}: HeaderProps) {
  
  const navItems = [
    { id: "hero", label: "Trang Chủ" },
    { id: "why-us", label: "Giới Thiệu" },
    { id: "team", label: "HDV" },
    { id: "tours", label: "Tours" },
    { id: "destinations", label: "Điểm Đến" },
    { id: "cam-nang", label: "Cẩm Nang" },
    { id: "contact", label: "Liên Hệ" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container flex items-center justify-between px-4">
        {/* Logo */}
        <a 
          href="#hero" 
          onClick={(e) => scrollToSection(e, "hero")}
          className="flex items-center gap-2 z-50"
        >
          <img 
            src="/logo.png" 
            alt="Cao Bằng Travel Connect" 
            className={cn(
              "h-10 w-10 object-contain transition-all duration-300",
              !isScrolled && "brightness-0 invert"
            )}
          />
          <div className={cn(
            "flex flex-col font-geist transition-colors duration-300",
            isScrolled ? "text-nature-green" : "text-white"
          )}>
            <strong className="text-lg leading-tight font-black">Cao Bằng</strong>
            <span className="text-[10px] uppercase tracking-widest leading-none font-bold">Travel Connect</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  <a href={`#${item.id}`} onClick={(e) => scrollToSection(e, item.id)}>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "bg-transparent font-medium cursor-pointer transition-colors duration-200",
                        activeSection === item.id 
                          ? (isScrolled ? "text-nature-green bg-nature-green/10" : "text-warm-yellow bg-white/10")
                          : (isScrolled ? "text-text-mid hover:text-nature-green hover:bg-slate-50" : "text-white/80 hover:text-white hover:bg-white/10")
                      )}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </a>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Account & CTA */}
          <div className="flex items-center gap-3">
            {userSession ? (
              <Button asChild variant="outline" className={cn(
                "rounded-full border-2 gap-2 font-bold transition-all",
                isScrolled 
                  ? "border-nature-green text-nature-green hover:bg-nature-green hover:text-white" 
                  : "border-white text-white hover:bg-white hover:text-nature-green"
              )}>
                <Link href="/tai-khoan">
                  <User className="w-4 h-4" />
                  {userProfile?.full_name || "Tài Khoản"}
                  {unreadReplies > 0 && (
                    <span className="bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ml-1">
                      {unreadReplies}
                    </span>
                  )}
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className={cn(
                "rounded-full border-2 font-bold transition-all",
                isScrolled 
                  ? "border-nature-green text-nature-green hover:bg-nature-green hover:text-white" 
                  : "border-white text-white hover:bg-white hover:text-nature-green"
              )}>
                <Link href="/dang-nhap">Đăng Nhập</Link>
              </Button>
            )}

            <Button 
              onClick={(e) => scrollToSection(e as any, "pricing")}
              className="bg-warm-yellow hover:bg-yellow-500 text-nature-green font-bold rounded-full px-6"
            >
              Đặt Tour Ngay
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 z-50 text-2xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-7 h-7 text-nature-green" />
          ) : (
            <Menu className={cn("w-7 h-7", isScrolled ? "text-nature-green" : "text-white")} />
          )}
        </button>
      </div>
    </header>
  );
}
