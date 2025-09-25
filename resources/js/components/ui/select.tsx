import * as React from "react"

import { cn } from "@/lib/utils"

function Select({ className, multiple, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground w-full rounded-lg border border-gray-300 bg-white text-gray-900 text-sm shadow-sm transition-all duration-200 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-gray-400 hover:shadow-md",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-md",
        "aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
        multiple
          ? "min-h-[7.5rem] appearance-none px-3 py-2"
          : "flex h-10 appearance-none bg-no-repeat bg-right bg-origin-content px-4 py-2 pr-10",
        !multiple && "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke-width=%271.5%27 stroke=%27%236b7280%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M19.5 8.25l-7.5 7.5-7.5-7.5%27/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_8px_center]",
        className
      )}
      multiple={multiple}
      {...props}
    />
  )
}

export { Select }
