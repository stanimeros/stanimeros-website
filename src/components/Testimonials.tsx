import { useRef } from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useScrollAnimation } from "@/lib/hooks"
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline"

const quoteKeys = ["first", "second", "third"] as const

// Hidden until real client quotes replace the generic placeholders.
const TESTIMONIALS_ENABLED = false

export default function Testimonials() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const animation = useScrollAnimation(sectionRef)

  if (!TESTIMONIALS_ENABLED) return null

  return (
    <motion.section
      ref={sectionRef}
      id="testimonials"
      className="py-20 bg-card/70 scroll-mt-10 overflow-hidden"
      {...(animation as HTMLMotionProps<"section">)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-center">
            <ChatBubbleLeftRightIcon className="inline h-8 w-8 text-primary mr-3 align-text-bottom" />
            {t("testimonials.title")}
          </h2>
          <Separator className="w-24 mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("testimonials.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {quoteKeys.map((key) => (
            <Card key={key} className="h-full flex flex-col bg-card/70 hover:bg-card/70">
              <CardContent className="flex-grow pt-6">
                <p className="text-muted-foreground leading-relaxed italic">
                  “{t(`testimonials.quotes.${key}.quote`)}”
                </p>
                <p className="text-sm text-foreground/80 mt-4 font-medium">
                  {t(`testimonials.quotes.${key}.attribution`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
