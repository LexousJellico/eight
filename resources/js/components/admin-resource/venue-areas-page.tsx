import { ResourcePageShell } from '@/components/admin-resource/resource-page-shell';
import {
  compactDate,
  extractCollection,
  extractLinks,
  textValue,
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
import { Link, router, useForm, usePage } from '@inertiajs/react';
import {
  Building2,
  Edit3,
  Layers3,
  Loader2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type VenueArea = {
  id: number | string;
  name?: string | null;
  description?: string | null;
  created_at?: string | null;
  services_count?: number | string | null;
  services?: unknown[];
};

type PageProps = {
  workspaceRole?: string;
  serviceTypes?: unknown;
  venueAreas?: unknown;
  filters?: {
    q?: string;
  };
};

const recommendedAreas = ['FULL HALL', 'MAIN HALL', 'LED WALL', 'VIP LOUNGE', 'BOARD ROOM'];

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="backend-admin-label">{label}</span>
      {children}
      {error ? <p className="text-xs font-bold text-red-500">{error}</p> : null}
    </label>
  );
}

export function VenueAreasPage() {
  const { props } = usePage() as unknown as { props: PageProps };

  const areas = useMemo(
    () => extractCollection<VenueArea>(props.venueAreas ?? props.serviceTypes),
    [props.venueAreas, props.serviceTypes],
  );

  const pageLinks = extractLinks(props.venueAreas ?? props.serviceTypes);
  const [editing, setEditing] = useState<VenueArea | null>(null);
  const [q, setQ] = useState(String(props.filters?.q ?? ''));

  const { data, setData, post, put, reset, processing, errors } = useForm({
    name: '',
    description: '',
  });

  function startCreate() {
    setEditing(null);
    reset();
  }

  function startEdit(area: VenueArea) {
    setEditing(area);
    setData({
      name: textValue(area.name),
      description: textValue(area.description),
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();

    if (editing) {
      put(`/admin/venue-areas/${editing.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setEditing(null);
          reset();
        },
      });

      return;
    }

    post('/admin/venue-areas', {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  }

  function destroy(area: VenueArea) {
    if (!window.confirm(`Delete "${area.name}"? Rental options connected to this area may be affected.`)) {
      return;
    }

    router.delete(`/admin/venue-areas/${area.id}`, {
      preserveScroll: true,
    });
  }

  function search(event: FormEvent) {
    event.preventDefault();

    router.get(
      '/admin/venue-areas',
      { q: q || undefined },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      },
    );
  }

  return (
    <ResourcePageShell
      role={props.workspaceRole}
      current="Venue Areas"
      eyebrow="Venue Configuration"
      title="Venue Areas"
      description="Maintain rentable BCCC spaces used by booking forms, calendar availability, and reservation workflows."
      actions={
        <Button type="button" onClick={startCreate} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          New Venue Area
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="backend-admin-card h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="backend-admin-icon">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <Badge variant="outline">
                  {editing ? 'Edit Area' : 'Create Area'}
                </Badge>

                <CardTitle className="mt-2 text-xl font-black">
                  {editing ? editing.name : 'Area Details'}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={submit} className="grid gap-4">
              <Field label="Area Name" error={errors.name}>
                <input
                  value={data.name}
                  onChange={(event) => setData('name', event.target.value)}
                  className="backend-admin-input"
                  placeholder="FULL HALL, MAIN HALL, VIP LOUNGE..."
                />
              </Field>

              <Field label="Description" error={errors.description}>
                <textarea
                  value={data.description}
                  onChange={(event) => setData('description', event.target.value)}
                  rows={5}
                  className="backend-admin-input min-h-[130px] py-3"
                  placeholder="Short internal description or public context..."
                />
              </Field>

              <div className="rounded-2xl border bg-muted/35 p-4">
                <p className="backend-admin-label">Recommended booking categories</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {recommendedAreas.map((area) => (
                    <Badge key={area} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={processing} className="flex-1 rounded-full">
                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editing ? 'Update Area' : 'Save Area'}
                </Button>

                {editing ? (
                  <Button type="button" variant="outline" onClick={startCreate} className="rounded-full">
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="backend-admin-card overflow-hidden">
          <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl font-black tracking-[-0.04em]">
                {areas.length} area{areas.length === 1 ? '' : 's'}
              </CardTitle>

              <CardDescription>
                These areas appear in reservation and availability workflows.
              </CardDescription>
            </div>

            <form onSubmit={search} className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                className="backend-admin-input pl-11"
                placeholder="Search areas..."
              />
            </form>
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            {areas.length > 0 ? (
              <div className="divide-y">
                {areas.map((area) => (
                  <div
                    key={area.id}
                    className="grid gap-4 p-5 transition hover:bg-muted/35 md:grid-cols-[1fr_auto]"
                  >
                    <div className="min-w-0">
                      <p className="text-lg font-black">
                        {area.name}
                      </p>

                      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {area.description || 'No description provided.'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="gap-1.5">
                          <Layers3 className="h-3.5 w-3.5" />
                          {Number(area.services_count ?? area.services?.length ?? 0)} rental option(s)
                        </Badge>
                        <Badge variant="outline">
                          Created {compactDate(area.created_at)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 md:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(area)}
                        className="rounded-full"
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => destroy(area)}
                        className="rounded-full border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-200"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground/45" />
                <h3 className="mt-4 text-xl font-black">No venue areas yet</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Add rentable areas such as FULL HALL, MAIN HALL, LED WALL, VIP LOUNGE, and BOARD ROOM.
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
      </div>
    </ResourcePageShell>
  );
}
