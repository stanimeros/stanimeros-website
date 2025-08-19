import { useInView, type HTMLMotionProps } from 'framer-motion';

export const useScrollAnimation = (ref: React.RefObject<HTMLElement | null>): HTMLMotionProps<"section"> => {
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return {
    initial: { y: 50, opacity: 0 },
    animate: isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 },
    transition: { type: "spring", bounce: 0.2 }
  } as HTMLMotionProps<"section">;
};
