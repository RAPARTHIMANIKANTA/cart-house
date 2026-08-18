"use client";

import "./hero-12.css";
import { Section19Hero } from "@/components/originkit/ui/hero-12/section-19-hero";

/** Source: https://github.com/diip3sh/sections/tree/main/app/section-19 */
const Hero12 = ({
  onOpenCommandCenter,
  onExploreSolution,
  onNavClick,
  onToggleAiAssistant,
  isDashboardMode = false,
}: {
  onOpenCommandCenter?: () => void;
  onExploreSolution?: () => void;
  onNavClick?: (section: string) => void;
  onToggleAiAssistant?: () => void;
  isDashboardMode?: boolean;
}) => (
  <Section19Hero
    onOpenCommandCenter={onOpenCommandCenter}
    onExploreSolution={onExploreSolution}
    onNavClick={onNavClick}
    onToggleAiAssistant={onToggleAiAssistant}
    isDashboardMode={isDashboardMode}
  />
);

export default Hero12;
