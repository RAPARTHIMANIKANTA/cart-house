// Delivered by Originkit · stack: nextjs · styling: tailwind
"use client";

"use client";

import type { KeyboardEvent } from "react";
import { Button } from "@/components/originkit/ui/hero-12/button";

/** Public asset under /sections/hero-12/assets */
function asset(file: string) {
  return `/originkit/hero-12/${file}`;
}

type NavbarProps = {
  onNavClick?: (section: string) => void;
  onOpenCommandCenter?: () => void;
  onToggleAiAssistant?: () => void;
  isDashboardMode?: boolean;
};

const NAV_LINKS = [
  { label: "Overview", href: "overview" },
  { label: "Orders", href: "orders" },
  { label: "Inventory", href: "inventory" },
  { label: "Allocation", href: "allocation" },
  { label: "Picking", href: "picking" },
  { label: "Exceptions", href: "exceptions" },
  { label: "Analytics", href: "analytics" },
] as const;

export const Navbar = ({
  onNavClick,
  onOpenCommandCenter,
  onToggleAiAssistant,
  isDashboardMode = false,
}: NavbarProps) => {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (onNavClick) onNavClick(href);
  };

  return (
    <nav aria-label="Primary" className="relative z-30 w-full">
      {/* Mobile / tablet */}
      <div className="flex w-full items-center justify-between p-4 ipad:px-12 desktop-sm:hidden">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (onNavClick) onNavClick("home");
          }}
          aria-label="SmartFulfill AI home"
          className="inline-flex min-h-11 items-center gap-2 touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white [-webkit-tap-highlight-color:transparent]"
        >
          <img
            src={asset("nav-logo.svg")}
            alt=""
            width={22}
            height={22}
            className="size-[22px] shrink-0"
            aria-hidden="true"
          />
          <span className="font-sans text-[20px] font-medium leading-[32.39px] tracking-[-0.4px] text-white whitespace-nowrap">
            SmartFulfill AI
          </span>
        </a>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={onToggleAiAssistant}
            className="px-3 py-1.5 text-xs text-[#c98bff] border-[#c98bff]/30"
          >
            AI Assistant
          </Button>
          <Button
            variant="primary"
            onClick={onOpenCommandCenter}
            className="px-3 py-1.5 text-xs text-black bg-white"
          >
            {isDashboardMode ? "Exit Dashboard" : "Command Center"}
          </Button>
        </div>
      </div>

      {/* Desktop */}
      <div className="relative mx-auto hidden w-full items-center justify-between pt-9 desktop-sm:flex">
        <div className="flex items-center gap-[52px]">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onNavClick) onNavClick("home");
            }}
            aria-label="SmartFulfill AI home"
            className="inline-flex min-h-11 items-center gap-2 touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white [-webkit-tap-highlight-color:transparent]"
          >
            <img
              src={asset("nav-logo.svg")}
              alt=""
              width={22}
              height={22}
              className="size-[22px] shrink-0"
              aria-hidden="true"
            />
            <span className="font-sans text-[20px] font-medium leading-[32.39px] tracking-[-0.4px] text-white whitespace-nowrap">
              SmartFulfill AI
            </span>
          </a>

          <ul className="flex items-center gap-6 font-tight text-[17px] leading-[25.5px] tracking-[-0.34px] text-white">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={`#${link.href}`}
                  tabIndex={0}
                  aria-label={link.label}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavClick) onNavClick(link.href);
                  }}
                  onKeyDown={(event) => handleKeyDown(event, link.href)}
                  className="inline-flex min-h-11 items-center touch-manipulation whitespace-nowrap transition-opacity duration-200 ease focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white [-webkit-tap-highlight-color:transparent] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-80"
                >
                  {"// "}
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3.5">
          <button
            onClick={onToggleAiAssistant}
            className="font-tight text-[17px] font-medium text-white/80 transition-all hover:text-[#c98bff] hover:glow cursor-pointer"
          >
            // AI Assistant
          </button>
          <Button
            variant="primary"
            aria-label="Open Command Center"
            onClick={onOpenCommandCenter}
            className="h-[43px] text-[14px] tracking-[-0.28px] text-[#040404]"
          >
            {isDashboardMode ? "Leave Command Center" : "Open Command Center"}
          </Button>
        </div>
      </div>
    </nav>
  );
};
