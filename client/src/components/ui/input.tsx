import * as React from "react"
import { cn } from "@/lib/utils"

// Placeholder components - implement as needed
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
  )
)
Input.displayName = "Input"

export const Dialog = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 rounded-lg", className)}>{children}</div>
export const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>{children}</div>
export const DialogTitle = ({ children }: { children: React.ReactNode }) => <h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>

export const Tooltip = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

export const Sonner = () => null
export const Toaster = () => null
