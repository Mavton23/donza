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
                "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700",
                "dark:bg-indigo-700 dark:text-white dark:border-indigo-800 dark:hover:bg-indigo-800",
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
                "ml-auto w-2 h-2 rounded-full bg-indigo-600 animate-pulse",
                "dark:bg-indigo-400",
                className
                )}
            />
        )
    }

    return null
}