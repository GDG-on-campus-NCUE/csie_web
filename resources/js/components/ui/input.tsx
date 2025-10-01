import * as React from "react"

import { cn } from "@/lib/shared/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                ref={ref}
                type={type}
                data-slot="input"
                className={cn(
                    // 預設背景與文字顏色，增強互動效果
                    "border-input file:text-foreground placeholder:text-neutral-500 selection:bg-primary selection:text-primary-foreground flex h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2 text-sm shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    "hover:border-gray-400 hover:shadow-md",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-md",
                    "aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
                    className
                )}
                {...props}
            />
        )
    }
)

Input.displayName = "Input"

export { Input }
