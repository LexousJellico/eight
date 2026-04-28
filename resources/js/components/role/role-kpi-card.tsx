import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

type RoleKpiCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  tone?: 'admin' | 'manager' | 'staff' | 'user' | 'neutral';
};

function trendLabel(tone?: RoleKpiCardProps['tone']): string {
  if (tone === 'admin') return 'Executive';
  if (tone === 'manager') return 'Review';
  if (tone === 'staff') return 'Ops';
  if (tone === 'user') return 'Client';

  return 'Workspace';
}

export function RoleKpiCard({
  title,
  value,
  description,
  icon: Icon,
  tone = 'neutral',
}: RoleKpiCardProps) {
  return (
    <Card className="backend-kpi-card group overflow-hidden">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#c9a96a]/10 blur-2xl transition duration-500 group-hover:scale-125" />

      <CardHeader className="relative flex flex-row items-start justify-between space-y-0 p-5 pb-2">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#c9a96a]/20 bg-[#c9a96a]/10 text-[#8a6b2e] dark:text-[#e8d8b5]">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent className="relative p-5 pt-0">
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-black tracking-[-0.05em] text-foreground sm:text-4xl">
            {value}
          </p>

          <Badge
            variant="outline"
            className="border-[#c9a96a]/25 bg-[#c9a96a]/10 text-[10px] font-black uppercase tracking-[0.14em] text-[#8a6b2e] dark:text-[#e8d8b5]"
          >
            {trendLabel(tone)}
          </Badge>
        </div>

        {description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
