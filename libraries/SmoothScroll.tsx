'use client';

import { useEffect } from 'react';

/**
 * Adds smooth scroll with bounce/ease for anchor links (href="#...").
 * Compatible with Tailwind + TypeScript + Next.js.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

    const handleClick = (e: MouseEvent) => {
      const link = e.currentTarget as HTMLAnchorElement;
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const targetId = href.substring(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      smoothScrollTo(target);
    };

    links.forEach((link) => link.addEventListener('click', handleClick));
    return () => links.forEach((link) => link.removeEventListener('click', handleClick));
  }, []);
}

/**
 * Custom smooth scroll animation with easing + bounce effect
 */
function smoothScrollTo(target: HTMLElement) {
  const startY = window.scrollY;
  const endY = target.getBoundingClientRect().top + window.scrollY;
  const distance = endY - startY;
  const duration = 1000; // ms
  const overshoot = 0.06; // bounce intensity

  let startTime: number | null = null;

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const animate = (time: number) => {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);

    const bounce =
      progress < 1
        ? distance * (eased + overshoot * Math.sin(progress * Math.PI * 2))
        : distance;

    window.scrollTo(0, startY + bounce);

    if (progress < 1) requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}