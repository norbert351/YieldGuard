'use client';

import { useEffect, useRef } from 'react';

type AnimationType = 'fade-up' | 'fade-left' | 'fade-right' | 'scale-in' | 'fade-in';

const animationMap: Record<AnimationType, string> = {
  'fade-up': 'animate-fade-up',
  'fade-left': 'animate-fade-left',
  'fade-right': 'animate-fade-right',
  'scale-in': 'animate-scale-in',
  'fade-in': 'animate-fade-in',
};

interface Options {
  animation?: AnimationType;
  delay?: number; // delay in ms, increments per element with stagger
  threshold?: number;
  stagger?: boolean;
}

export default function useScrollReveal<T extends HTMLElement>(
  options: Options = {}
) {
  const ref = useRef<T>(null!);
  const { animation = 'fade-up', delay = 0, threshold = 0.1, stagger = false } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If stagger, animate child elements instead
    if (stagger) {
      const children = Array.from(el.children) as HTMLElement[];
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const child = entry.target as HTMLElement;
              const index = children.indexOf(child);
              const classname = animationMap[animation];
              child.classList.add(classname);
              child.style.animationDelay = `${index * 100}ms`;
              child.style.opacity = '1';
              observer.unobserve(child);
            }
          });
        },
        { threshold }
      );
      children.forEach((child) => {
        child.style.opacity = '0';
        observer.observe(child);
      });
      return () => observer.disconnect();
    }

    // Default: animate the single element
    el.style.opacity = '0';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const classname = animationMap[animation];
          el.classList.add(classname);
          if (delay) el.style.animationDelay = `${delay}ms`;
          el.style.opacity = '1';
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animation, delay, threshold, stagger]);

  return ref;
}
