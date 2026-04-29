import { cn } from '../../lib/cn';

export interface BentoItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    href?: string;
    colSpan?: number;
    hasPersistentHover?: boolean;
}

interface BentoGridProps {
    items: BentoItem[];
}

function BentoGrid({ items }: BentoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {items.map((item, index) => {
                const Wrapper: any = item.href ? 'a' : 'div';
                const wrapperProps = item.href ? { href: item.href } : {};
                return (
                <Wrapper
                    key={index}
                    {...wrapperProps}
                    className={cn(
                        "group relative p-4 rounded-xl overflow-hidden transition-all duration-300 block",
                        "border border-line bg-surface",
                        "hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
                        "hover:-translate-y-0.5 will-change-transform",
                        item.href ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring" : "",
                        item.colSpan === 2 ? "md:col-span-2" : "col-span-1",
                        item.hasPersistentHover
                            ? "shadow-[0_2px_12px_rgba(0,0,0,0.06)] -translate-y-0.5"
                            : ""
                    )}
                >
                    <div
                        className={cn(
                            "absolute inset-0 transition-opacity duration-300",
                            item.hasPersistentHover
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                        )}
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[length:4px_4px]" />
                    </div>

                    <div className="relative flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-brand/10 group-hover:bg-brand/20 transition-all duration-300">
                                {item.icon}
                            </div>
                            {item.status && (
                                <span className="text-xs font-medium px-2 py-1 rounded-lg bg-surface-muted text-ink-secondary border border-line transition-colors duration-300 group-hover:border-brand/30">
                                    {item.status}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-ink tracking-tight text-[15px]">
                                {item.title}
                                {item.meta && (
                                    <span className="ml-2 text-xs text-ink-secondary font-normal">
                                        {item.meta}
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-ink-secondary leading-snug">
                                {item.description}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                {item.tags?.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="text-xs px-2 py-1 rounded-md bg-surface-muted text-ink-secondary border border-line hover:border-brand/30 transition-colors duration-200"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <span className="text-xs text-brand opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {item.cta || "Explore →"}
                            </span>
                        </div>
                    </div>

                    <div
                        className={cn(
                            "absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-brand/5 to-transparent transition-opacity duration-300",
                            item.hasPersistentHover
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                        )}
                    />
                </Wrapper>
                );
            })}
        </div>
    );
}

export { BentoGrid };
