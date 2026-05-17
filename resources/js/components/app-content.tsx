import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

export function AppContent({ children, className = '', ...props }: AppContentProps) {
    return (
        <main
            {...props}
            className={cx(
                'backend-app-content relative z-10 min-h-[calc(100dvh-4rem)] w-full px-3 pb-5 pt-[5.25rem] sm:px-4 lg:px-5 xl:px-6',
                'motion-safe:animate-[boneyardContentIn_0.32s_cubic-bezier(0.22,1,0.36,1)_both]',
                className,
            )}
        >
            <style>
                {`
                    @keyframes boneyardContentIn {
                        from {
                            opacity: 0;
                            transform: translateY(10px) scale(0.995);
                            filter: blur(8px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                            filter: blur(0);
                        }
                    }
                `}
            </style>

            <div className="mx-auto grid w-full max-w-[1820px] gap-4">{children}</div>
        </main>
    );
}
