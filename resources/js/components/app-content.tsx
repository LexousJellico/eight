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
                'relative z-10 min-h-[calc(100vh-4.75rem)] w-full px-3 pb-8 pt-3 sm:px-4 lg:px-6 xl:px-7',
                'motion-safe:animate-[bcccBackendContentIn_0.28s_ease-out_both]',
                className,
            )}
        >
            <style>
                {`
                    @keyframes bcccBackendContentIn {
                        from {
                            opacity: 0;
                            transform: translateY(8px);
                            filter: blur(4px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                            filter: blur(0);
                        }
                    }
                `}
            </style>

            <div className="mx-auto w-full max-w-[1920px]">
                {children}
            </div>
        </main>
    );
}
