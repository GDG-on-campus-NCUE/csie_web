import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        // 預設背景與文字顏色，增強互動效果
        "border-input placeholder:text-neutral-500 selection:bg-primary selection:text-primary-foreground flex w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3 text-sm shadow-sm transition-all duration-200 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        "hover:border-gray-400 hover:shadow-md",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-md",
        "aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
