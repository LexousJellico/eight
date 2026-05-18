import { ImageOff } from 'lucide-react';
import { type ImgHTMLAttributes, useEffect, useMemo, useState } from 'react';

export const DEFAULT_PUBLIC_IMAGE = '/marketing/images/events/default.png';

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src?: string | null;
    fallbackSrc?: string;
    fallbackLabel?: string;
    wrapperClassName?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

export function normalizeImageSrc(value?: string | null, fallback = DEFAULT_PUBLIC_IMAGE) {
    const raw = String(value || '').trim();

    if (!raw) {
        return fallback;
    }

    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) {
        return raw;
    }

    const clean = raw
        .replace(/\\/g, '/')
        .replace(/^public\//, '')
        .replace(/^\/public\//, '/')
        .replace(/^storage\/app\/public\//, 'storage/')
        .replace(/^app\/public\//, 'storage/');

    if (clean.startsWith('/')) {
        return clean;
    }

    if (clean.startsWith('marketing/') || clean.startsWith('images/')) {
        return `/${clean}`;
    }

    if (clean.startsWith('storage/')) {
        return `/${clean}`;
    }

    return `/storage/${clean}`;
}

export default function SafeImage({
    src,
    fallbackSrc = DEFAULT_PUBLIC_IMAGE,
    fallbackLabel = 'Image unavailable',
    wrapperClassName,
    className,
    alt = '',
    ...props
}: SafeImageProps) {
    const resolvedInitialSrc = useMemo(() => normalizeImageSrc(src, fallbackSrc), [src, fallbackSrc]);
    const resolvedFallback = useMemo(() => normalizeImageSrc(fallbackSrc, DEFAULT_PUBLIC_IMAGE), [fallbackSrc]);
    const [currentSrc, setCurrentSrc] = useState(resolvedInitialSrc);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setCurrentSrc(resolvedInitialSrc);
        setFailed(false);
    }, [resolvedInitialSrc]);

    const handleError = () => {
        if (currentSrc !== resolvedFallback) {
            setCurrentSrc(resolvedFallback);
            setFailed(false);
            return;
        }

        setFailed(true);
    };

    if (failed) {
        return (
            <div
                className={cx(
                    'grid min-h-[12rem] place-items-center rounded-[1rem] border border-dashed border-black/15 bg-slate-100 text-center text-slate-500 dark:border-white/15 dark:bg-white/7 dark:text-white/50',
                    wrapperClassName,
                )}
            >
                <div>
                    <ImageOff className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]">
                        {fallbackLabel}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <img
            {...props}
            src={currentSrc}
            alt={alt}
            className={className}
            onError={handleError}
            draggable={props.draggable ?? false}
        />
    );
}
