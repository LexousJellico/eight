import { ResourcePageShell } from '@/components/admin-resource/resource-page-shell';
import {
  cleanLabel,
  compactDate,
  currentWorkspaceRole,
  extractCollection,
  extractLinks,
  normalizeAdminResourceRole,
  yesNo,
  booleanBadgeTone,
} from '@/lib/admin-resource-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link, router, usePage } from '@inertiajs/react';
import {
  Download,
  Edit3,
  FileBarChart,
  Plus,
  Printer,
  Search,
  Trash2,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type MiceRecord = {
  id: number | string;
  establishment_name?: string | null;
  business_type?: string | null;
  classification?: string | null;
  enterprise_group?: string | null;
  city_municipality?: string | null;
  province_huc?: string | null;
  region?: string | null;
  year_recorded?: number | string | null;
  month_added?: string | null;
  total_employees?: number | string | null;
  permit_to_engage?: boolean | number | string | null;
  dot_accredited?: boolean | number | string | null;
  active_member?: boolean | number | string | null;
  created_at?: string | null;
};

type PageProps = {
  workspaceRole?: string;
  records?: unknown;
  rows?: unknown;
  miceRecords?: unknown;
  registry?: unknown;
  filters?: {
    q?: string;
  };
};

function basePath(role: string) {
  if (role === 'manager') return '/manager/reports/mice-registry';

  return '/admin/reports/mice-registry';
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card className="backend-admin-card">
      <CardContent className="p-5">
        <p className="backend-admin-label">{label}</p>
        <p className="mt-3 text-3xl font-black tracking-[-0.04em]">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export function MiceRegistryPage() {
  const { props } = usePage() as unknown as { props: PageProps };
  const role = normalizeAdminResourceRole(props.workspaceRole ?? currentWorkspaceRole());

  const records = useMemo(
    () => extractCollection<MiceRecord>(props.records ?? props.rows ?? props.miceRecords ?? props.registry),
    [props.records, props.rows, props.miceRecords, props.registry],
  );

  const pageLinks = extractLinks(props.records ?? props.rows ?? props.miceRecords ?? props.registry);
  const [q, setQ] = useState(String(props.filters?.q ?? ''));
  const path = basePath(role);
  const canMutate = role === 'admin';

  function search(event: FormEvent) {
    event.preventDefault();

    router.get(
      path,
      { q: q || undefined },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      },
    );
  }

  function destroy(record: MiceRecord) {
    if (!window.confirm(`Delete MICE registry record "${record.establishment_name || record.id}"?`)) {
      return;
    }

    router.delete(`${path}/${record.id}`, {
      preserveScroll: true,
    });
  }

  return (
    <ResourcePageShell
      role={props.workspaceRole}
      current="MICE Registry"
      eyebrow="MICE Report"
      title="MICE Registry"
      description="Review tourism and convention registry records using the same backend workspace style."
      actions={
        <div className="flex flex-wrap gap-2">
          {canMutate ? (
            <Button asChild className="rounded-full">
              <Link href={`${path}/create`}>
                <Plus className="mr-2 h-4 w-4" />
                New Record
              </Link>
            </Button>
          ) : null}

          <Button asChild variant="outline" className="rounded-full">
            <Link href={`${path}/print`}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Link>
          </Button>

          <Button asChild variant="outline" className="rounded-full">
            <Link href={`${path}/export`}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Link>
          </Button>
        </div>
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Records" value={records.length} />
        <SummaryCard
          label="DOT Accredited"
          value={records.filter((record) => yesNo(record.dot_accredited) === 'Yes').length}
        />
        <SummaryCard
          label="Active Members"
          value={records.filter((record) => yesNo(record.active_member) === 'Yes').length}
        />
        <SummaryCard
          label="Employees"
          value={records.reduce((sum, record) => sum + Number(record.total_employees ?? 0), 0)}
        />
      </section>

      <Card className="backend-admin-card overflow-hidden">
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-black tracking-[-0.04em]">
              MICE report table
            </CardTitle>

            <CardDescription>
              Registry data for convention, tourism, and MICE reporting.
            </CardDescription>
          </div>

          <form onSubmit={search} className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="backend-admin-input pl-11"
              placeholder="Search registry..."
            />
          </form>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          {records.length > 0 ? (
            <div className="divide-y">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="grid gap-4 p-5 transition hover:bg-muted/35 md:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="backend-admin-icon">
                        <FileBarChart className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-lg font-black">
                          {record.establishment_name || `Record #${record.id}`}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {record.business_type || 'No business type'} · {record.city_municipality || 'No city'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">{cleanLabel(record.classification)}</Badge>
                      <Badge variant="outline">{record.year_recorded || 'No year'}</Badge>
                      <Badge variant="outline">Employees {record.total_employees ?? 0}</Badge>
                      <Badge variant="outline" className={booleanBadgeTone(record.dot_accredited)}>
                        DOT {yesNo(record.dot_accredited)}
                      </Badge>
                      <Badge variant="outline">Created {compactDate(record.created_at)}</Badge>
                    </div>
                  </div>

                  {canMutate ? (
                    <div className="flex items-start gap-2 md:justify-end">
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href={`${path}/${record.id}/edit`}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => destroy(record)}
                        className="rounded-full border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-200"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <FileBarChart className="mx-auto h-10 w-10 text-muted-foreground/45" />
              <h3 className="mt-4 text-xl font-black">No MICE records found</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Registry entries will appear here after records are created or imported.
              </p>
            </div>
          )}

          {pageLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-t p-5">
              {pageLinks.map((link, index) =>
                link.url ? (
                  <Link
                    key={`${link.label}-${index}`}
                    href={link.url}
                    preserveScroll
                    className={`rounded-full border px-3 py-2 text-xs font-bold ${
                      link.active
                        ? 'border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#7a5c21] dark:text-[#e8d8b5]'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label ?? '' }}
                  />
                ) : (
                  <span
                    key={`${link.label}-${index}`}
                    className="rounded-full border bg-muted/40 px-3 py-2 text-xs font-bold text-muted-foreground/50"
                    dangerouslySetInnerHTML={{ __html: link.label ?? '' }}
                  />
                ),
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </ResourcePageShell>
  );
}
