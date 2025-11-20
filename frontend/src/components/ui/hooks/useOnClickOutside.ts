import { useEffect } from "react";

export function useOnClickOutside(
  el: HTMLElement | null,
  handler: (e: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    if (!el) return;
    const listener = (event: MouseEvent | TouchEvent) => {
      if (el.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [el, handler]);
}
