import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type RoleActionCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone?: 'admin' | 'manager' | 'staff' | 'user' | 'neutral';
  cta?: string;
};

export function RoleActionCard({
  title,
  description,
  href,
  icon: Icon,
  cta = 'Open',
}: RoleActionCardProps) {
  return (
    <Card className="backend-action-card group overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#c9a96a]/10 blur-2xl transition duration-500 group-hover:scale-125" />

      <CardContent className="relative flex h-full flex-col p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#c9a96a]/20 bg-[#c9a96a]/10 text-[#8a6b2e] dark:text-[#e8d8b5]">
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-black tracking-[-0.025em] text-foreground">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-5">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full border-[#c9a96a]/25 bg-[#c9a96a]/10 font-black text-[#7a5c21] hover:bg-[#c9a96a]/15 dark:text-[#e8d8b5]"
          >
            <Link href={href}>
              {cta}
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
