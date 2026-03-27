"use client";

import Animatedheader from "@/components/Animatedheader";
import { MegaFooter } from "@/components/MegaFooter";
import { useTheme } from "@/components/ThemeProvider";
import AnimatedLeaderboard from "@/components/Leaderboardanimation";

export default function LeaderboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <main className={`flex min-h-screen flex-col transition-colors duration-500 font-sans ${isDark ? "bg-[#2a221c] text-[#e9ddce]" : "bg-[#ddd1c0] text-[#1c1612]"}`}>
      <Animatedheader />

      <section className="px-6 pt-28 pb-16 lg:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Leaderboard</h1>
          <p className={`mb-8 text-lg ${isDark ? "text-[#d3c2af]" : "text-[#4a3c31]"}`}>
            Track the top contributors in your local civic platform. Click run to watch a dynamic leaderboard animation.
          </p>

          <AnimatedLeaderboard />
        </div>
      </section>

      <MegaFooter
        brandColor={isDark ? "#ffffff" : "#000000"}
        brandColorDark="#ffffff"
        newsletterTitleColor={isDark ? "#ffffff" : "#000000"}
        newsletterTitleColorDark="#ffffff"
        brandName="Team 404"
        tagline="Designing delightful digital experiences."
        socialLinks={[
          { platform: "twitter", href: "https://twitter.com" },
          { platform: "github", href: "https://github.com/Prakharrdev/ps-crmdev1" },
          { platform: "linkedin", href: "https://linkedin.com" },
        ]}
        showNewsletter={true}
        newsletterTitle="Stay updated"
        newsletterPlaceholder="Enter your email"
      />
    </main>
  );
}
