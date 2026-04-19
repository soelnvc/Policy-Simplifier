import { useEffect, useRef, useState } from 'react';

/**
 * A hook to detect when an element enters the viewport.
 * We use this instead of Framer Motion to keep the bundle size small
 * and avoid forcing terminal restarts for new NPM installs.
 */
export function useScrollReveal(options = { threshold: 0.25 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Disconnect after revealing once so it doesn't fade out when scrolling past
        observer.unobserve(el);
      }
    }, options);

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold]);

  return { ref, isVisible };
}
