import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export function SidebarBadge({
    count,
    hasUnread,
    className,
    variant = "default"
}) {
    if (count > 0) {
        return (
            <Badge
                variant={variant}
                className={cn(
                "ml-auto min-w-[20px] h-5 flex items-center justify-center px-1 py-0",
                "bg-custom-primary text-white border-custom-primary hover:bg-custom-primary-hover",
                "dark:bg-custom-primary dark:text-white dark:border-custom-primary dark:hover:bg-custom-primary-hover",
                className
                )}
            >
                {count > 99 ? '99+' : count}
            </Badge>
        )
    }

    if (hasUnread) {
        return (
            <div
                className={cn(
                "ml-auto w-2 h-2 rounded-full bg-custom-primary animate-pulse",
                "dark:bg-custom-primary",
                className
                )}
            />
        )
    }

    return null
}