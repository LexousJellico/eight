import type { ReactNode } from 'react';

type BackendPageShellProps = {
    children: ReactNode;
    title?: string;
    eyebrow?: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

export default function BackendPageShell({
    children,
    title,
    eyebrow = 'Workspace',
    description,
    actions,
    className,
}: BackendPageShellProps) {
    return (
        <section
            className={cx(
                'overflow-hidden rounded-[1.65rem] border border-[#d9c7a6]/70 bg-white/82 p-4 shadow-[0_20px_64px_rgba(47,37,23,0.09)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] sm:p-5',
                className,
            )}
        >
            {title || description || actions ? (
                <div className="mb-5 grid gap-4 border-b border-[#d9c7a6]/60 pb-4 dark:border-white/10 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9d7b3d] dark:text-[#f1d89b]">
                            {eyebrow}
                        </p>

                        {title ? (
                            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#21180d] dark:text-white">
                                {title}
                            </h2>
                        ) : null}

                        {description ? (
                            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6e604c] dark:text-white/58">
                                {description}
                            </p>
                        ) : null}
                    </div>

                    {actions ? <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
                </div>
            ) : null}

            {children}
        </section>
    );
}
