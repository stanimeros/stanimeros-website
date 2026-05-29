import { useRef } from "react"
import { useInView } from "framer-motion"
import { RoughNotation } from "react-rough-notation"

interface Props {
  children: React.ReactNode
  type?: "underline" | "circle" | "highlight" | "box" | "bracket"
  color?: string
  animate?: boolean
  className?: string
}

export default function UnderlineHighlight({
  children,
  type = "underline",
  color = "#4ade80",
  animate = true,
  className,
}: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <span ref={ref}>
      <RoughNotation type={type} show={inView} animate={animate} color={color} animationDelay={600} padding={type === "circle" ? 8 : 2} iterations={1}>
        <span className={className ?? (type === "underline" ? "text-green-400 px-1" : undefined)}>{children}</span>
      </RoughNotation>
    </span>
  )
}
