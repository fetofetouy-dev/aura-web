import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/cn"

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  background?: "default" | "elevated"
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, background = "default", children, ...props }, ref) => {
    const backgrounds = {
      default: "bg-background",
      elevated: "bg-background-elevated",
    }

    return (
      <section
        ref={ref}
        className={cn(
          "py-16 md:py-24 lg:py-32",
          backgrounds[background],
          className
        )}
        {...props}
      >
        {children}
      </section>
    )
  }
)

Section.displayName = "Section"

export { Section }
