import { useInView, type HTMLMotionProps } from 'framer-motion';

export const useScrollAnimation = (ref: React.RefObject<HTMLElement | null>): HTMLMotionProps<"section"> => {
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return {
    initial: { y: 0 },
    animate: { y: isInView ? 0 : 50 },
    transition: { type: "spring", bounce: 0.2 }
  } as HTMLMotionProps<"section">;
};

export const useMobileCardAnimation = (ref: React.RefObject<HTMLDivElement | null>, index: number = 0): HTMLMotionProps<"div"> => {
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return {
    initial: { x: 100, opacity: 0 },
    animate: isInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 },
    transition: { 
      type: "spring" as const,
      bounce: 0.2,
      stiffness: 150,
      damping: 15,
      delay: index * 0.05 // Faster stagger effect
    }
  } as HTMLMotionProps<"div">;
}
