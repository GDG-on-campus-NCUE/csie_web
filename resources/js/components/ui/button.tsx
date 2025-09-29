import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-out cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-md hover:drop-shadow-[0_4px_12px_rgba(29,78,216,0.25)]",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 hover:shadow-md hover:drop-shadow-[0_4px_12px_rgba(225,29,72,0.25)] focus-visible:ring-destructive/20",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:border-primary/30",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 hover:shadow-md hover:drop-shadow-[0_4px_12px_rgba(252,163,17,0.25)]",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
        link: "text-primary underline-offset-4 hover:underline hover:drop-shadow-[0_2px_6px_rgba(29,78,216,0.2)]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  // Prevent props.className from accidentally overwriting the computed
  // variant classes. Merge in the explicit `className` and any incoming
  // `props.className` so callers can still add small tweaks without
  // removing the base styles. This fixes cases where callers passed
  // `className` to the Button and it replaced the essential button styles.
  const { className: propsClassName, ...rest } = props as any
  const mergedClassName = cn(buttonVariants({ variant, size }), className, propsClassName)

  return (
    <Comp
      data-slot="button"
      className={mergedClassName}
      {...rest}
    />
  )
}

export { Button, buttonVariants }
