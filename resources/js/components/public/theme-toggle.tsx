import { MoonStar, SunMedium } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

export default function ThemeToggle() {
  const { appearance, updateAppearance } = useAppearance();
  const [systemDark, setSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setSystemDark(mq.matches);

    sync();
    setMounted(true);

    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const isDark = useMemo(() => {
    if (appearance === 'dark') return true;
    if (appearance === 'light') return false;
    return systemDark;
  }, [appearance, systemDark]);

  const toggleTheme = () => {
    updateAppearance(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'}
      title={mounted ? (isDark ? 'Light mode' : 'Dark mode') : 'Toggle theme'}
      className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300/80 bg-white/92 text-slate-900 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-slate-950/78 dark:text-white dark:hover:bg-slate-900"
    >
      {mounted ? (
        isDark ? (
          <SunMedium className="h-5 w-5 transition duration-200 group-hover:rotate-12" />
        ) : (
          <MoonStar className="h-5 w-5 transition duration-200 group-hover:-rotate-12" />
        )
      ) : (
        <SunMedium className="h-5 w-5" />
      )}
    </button>
  );
}
