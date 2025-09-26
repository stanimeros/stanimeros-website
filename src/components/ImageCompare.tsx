import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

interface ImageCompareProps {
  beforeImage: string
  afterImage: string
  beforeAlt?: string
  afterAlt?: string
}

export default function ImageCompare({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After"
}: ImageCompareProps) {
  const [sliderWidth, setSliderWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const constraintsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth
      setSliderWidth(width)
      x.set(width / 2)
    }
  }, [containerRef, x])

  const clipPath = useTransform(x, (value) => {
    if (!sliderWidth) return "inset(0 50% 0 0)"
    return `inset(0 ${100 - ((value / sliderWidth) * 100)}% 0 0)`
  })

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden"
    >
      {/* Both images stacked */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* After Image (Background) */}
        <img
          src={afterImage}
          alt={afterAlt}
          className="absolute inset-0 w-full h-full object-contain"
        />
        
        {/* Before Image (Overlay with clip) */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath }}
          >
            <img
              src={beforeImage}
              alt={beforeAlt}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </motion.div>
        </div>
      </div>

      {/* Slider */}
      <div
        ref={constraintsRef}
        className="absolute inset-0"
      >
        <motion.div
          drag="x"
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={constraintsRef}
          style={{ x }}
          className="absolute top-0 bottom-0 cursor-ew-resize touch-none select-none"
          onDrag={(_, info) => {
            const newX = x.get() + info.delta.x
            if (newX >= 0 && newX <= sliderWidth) {
              x.set(newX)
            }
          }}
        >
          <div 
            className="absolute top-0 bottom-0 w-1 bg-primary -ml-0.5 backdrop-blur-sm"
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
          >
            <svg 
              className="w-4 h-4 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 9l4-4 4 4m0 6l-4 4-4-4" 
              />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-2 left-2 text-xs font-medium bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
        Before
      </div>
      <div className="absolute bottom-2 right-2 text-xs font-medium bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
        After
      </div>
    </div>
  )
}
