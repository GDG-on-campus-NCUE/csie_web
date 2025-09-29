import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-gray-300 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=checked]:border-blue-600 hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5 hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20 size-4 shrink-0 rounded-[4px] border shadow-sm transition-all duration-300 ease-out outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
