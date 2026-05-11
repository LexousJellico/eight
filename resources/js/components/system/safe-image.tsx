import { ImageOff } from 'lucide-react';
import { type ImgHTMLAttributes, useMemo, useState } from 'react';

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src?: string | null;
    fallbackSrc?: string;
    fallbackLabel?: string;
    wrapperClassName?: string;
};

const DEFAULT_FALLBACK = '/marketing/images/facilities/darkvip.jpg';

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

export default function SafeImage({
    src,
    fallbackSrc = DEFAULT_FALLBACK,
    fallbackLabel = 'Image unavailable',
    wrapperClassName,
    className,
    alt = '',
    ...props
}: SafeImageProps) {
    const resolvedInitialSrc = useMemo(() => {
        const candidate = typeof src === 'string' ? src.trim() : '';

        return candidate || fallbackSrc;
    }, [src, fallbackSrc]);

    const [currentSrc, setCurrentSrc] = useState(resolvedInitialSrc);
    const [failed, setFailed] = useState(false);

    const handleError = () => {
        if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setFailed(false);
            return;
        }

        setFailed(true);
    };

    if (failed) {
        return (
            <div
                className={cx(
                    'grid min-h-[12rem] place-items-center rounded-[1.25rem] border border-dashed border-black/15 bg-slate-100 text-center text-slate-500 dark:border-white/15 dark:bg-white/7 dark:text-white/50',
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
