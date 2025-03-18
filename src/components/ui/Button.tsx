import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = {
  variant: {
    default:
      "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md focus-visible:bg-primary/90 active:scale-[0.98] transition-all duration-200",
    destructive:
      "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md focus-visible:bg-destructive/90 active:scale-[0.98] transition-all duration-200",
    outline:
      "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md active:scale-[0.98] transition-all duration-200",
    secondary:
      "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md focus-visible:bg-secondary/80 active:scale-[0.98] transition-all duration-200",
    ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all duration-200",
    link: "text-primary underline-offset-4 hover:underline focus-visible:underline transition-all duration-200",
  },
  size: {
    default: "h-10 px-4 py-2 rounded-lg",
    sm: "h-9 px-3 py-1.5 text-sm rounded-lg",
    lg: "h-11 px-8 py-2.5 text-lg rounded-lg",
    icon: "h-10 w-10 rounded-lg",
  },
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
