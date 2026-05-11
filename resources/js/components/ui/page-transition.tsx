import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type PageTransitionProps = {
    children: ReactNode;
    pageKey?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function PageTransition({ children, pageKey = 'page' }: PageTransitionProps) {
    const reduceMotion = useReducedMotion();

    if (reduceMotion) {
        return <>{children}</>;
    }

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pageKey}
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                transition={{ duration: 0.24, ease }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
