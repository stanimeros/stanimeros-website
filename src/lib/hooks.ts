import { useInView, type HTMLMotionProps } from 'framer-motion';

export const useScrollAnimation = (ref: React.RefObject<HTMLElement | null>): HTMLMotionProps<"section"> => {
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  return {
    initial: { y: 0 },
    animate: { y: isInView ? 0 : 24 },
    transition: { type: "spring", stiffness: 300, damping: 26 }
  } as HTMLMotionProps<"section">;
};

export const useMobileCardAnimation = (ref: React.RefObject<HTMLDivElement | null>, index: number = 0): HTMLMotionProps<"div"> => {
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  return {
    initial: { x: 40, opacity: 0 },
    animate: isInView ? { x: 0, opacity: 1 } : { x: 40, opacity: 0 },
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
      // Unique, capped delay: spreads spring starts across frames (avoids many
      // cards animating on the same tick) without letting large grids drag on.
      delay: Math.min(index * 0.025, 0.25)
    }
  } as HTMLMotionProps<"div">;
}
