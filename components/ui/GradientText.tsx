import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/cn"

export interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {}

const GradientText = forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "bg-gradient-aura bg-clip-text text-transparent",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

GradientText.displayName = "GradientText"

export { GradientText }
