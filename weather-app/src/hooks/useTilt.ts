import { useRef, useCallback } from 'react';

export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // -0.5 (левый/верхний край) ... 0.5 (правый/нижний край)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--tilt-x', x.toFixed(3));
    el.style.setProperty('--tilt-y', y.toFixed(3));
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0');
    el.style.setProperty('--tilt-y', '0');
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}