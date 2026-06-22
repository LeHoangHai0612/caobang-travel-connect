@echo off
cd /d D:\caobang-travel-connect
echo === Git Status ===
git status
echo.
echo === Adding all changes ===
git add -A
echo.
echo === Committing ===
git commit -m "feat: redesign UI to match caobang.travel style

- Header: split nav (left=tour menus, center=logo, right=secondary nav+CTA)
  transparent on top, white capsule on scroll, mobile drawer
- HeroSection: full-screen with Welcome to/title, hot-deal ticker,
  tag chips, Book Now + WhatsApp CTAs, arrow navigation
- TourCard: new card style with location/transport/duration chips,
  Hot-deal badge, price + redirect arrow button
- TourCategory: split into MOTORBIKE and JEEP sections, section
  underline SVG, icon, tab filters, horizontal scroll carousel,
  prev/next nav, See more link
- Footer: dark green (#1a3a25) with SVG mountain landscape,
  cloud decorations, newsletter, social links
- MobileNav: slide-in drawer from right with overlay
- globals.css: all new cb-* component classes added"
echo.
echo === Pushing ===
git push
echo.
echo === Done! ===
pause
