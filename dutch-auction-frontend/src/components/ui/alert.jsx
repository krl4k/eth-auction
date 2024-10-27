import * as React from "react"
import { cn } from "../../lib/utils"

const alertVariants = {
    default: "bg-background text-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    success: "bg-green-100 text-green-800",
}

const Alert = React.forwardRef(({
                                    className,
                                    variant = "default",
                                    ...props
                                }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(
            "relative w-full rounded-lg border p-4",
            alertVariants[variant],
            className
        )}
        {...props}
    />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({
                                         className,
                                         ...props
                                     }, ref) => (
    <h5
        ref={ref}
        className={cn("mb-1 font-medium leading-none tracking-tight", className)}
        {...props}
    />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({
                                               className,
                                               ...props
                                           }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm [&_p]:leading-relaxed", className)}
        {...props}
    />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }