import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/cn"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-background-elevated border border-border rounded-lg p-6",
          "transition-all duration-300",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

export { Card }
