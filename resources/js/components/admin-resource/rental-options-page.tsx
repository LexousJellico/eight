import { ResourcePageShell } from '@/components/admin-resource/resource-page-shell';
import {
  compactDate,
  extractCollection,
  extractLinks,
  money,
  numberText,
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
  Banknote,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type RentalOption = {
  id: number | string;
  service_type_id?: number | string | null;
  service_type?: {
    id?: number | string;
    name?: string | null;
  } | null;
  name?: string | null;
  description?: string | null;
  uom?: string | null;
  price?: number | string | null;
  quantity?: number | string | null;
  min_guests?: number | string | null;
  max_guests?: number | string | null;
  capacity_note?: string | null;
  created_at?: string | null;
};

type VenueArea = {
  id: number | string;
  name?: string | null;
};

type PageProps = {
  workspaceRole?: string;
  services?: unknown;
  rentalOptions?: unknown;
  serviceTypes?: unknown;
  venueAreas?: unknown;
  filters?: {
    q?: string;
  };
};

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

export function RentalOptionsPage() {
  const { props } = usePage() as unknown as { props: PageProps };

  const options = useMemo(
    () => extractCollection<RentalOption>(props.rentalOptions ?? props.services),
    [props.rentalOptions, props.services],
  );

  const areas = useMemo(
    () => extractCollection<VenueArea>(props.venueAreas ?? props.serviceTypes),
    [props.venueAreas, props.serviceTypes],
  );

  const pageLinks = extractLinks(props.rentalOptions ?? props.services);
  const [editing, setEditing] = useState<RentalOption | null>(null);
  const [q, setQ] = useState(String(props.filters?.q ?? ''));

  const { data, setData, post, put, reset, processing, errors } = useForm({
    service_type_id: '',
    name: '',
    description: '',
    uom: 'event',
    price: '',
    quantity: '1',
    min_guests: '',
    max_guests: '',
    capacity_note: '',
    is_guest_restricted: false,
  });

  function startCreate() {
    setEditing(null);
    reset();
  }

  function startEdit(option: RentalOption) {
    setEditing(option);
    setData({
      service_type_id: textValue(option.service_type_id ?? option.service_type?.id),
      name: textValue(option.name),
      description: textValue(option.description),
      uom: textValue(option.uom || 'event'),
      price: numberText(option.price),
      quantity: numberText(option.quantity || 1),
      min_guests: numberText(option.min_guests),
      max_guests: numberText(option.max_guests),
      capacity_note: textValue(option.capacity_note),
      is_guest_restricted: Boolean(option.min_guests || option.max_guests),
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();

    if (editing) {
      put(`/admin/rental-options/${editing.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setEditing(null);
          reset();
        },
      });

      return;
    }

    post('/admin/rental-options', {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  }

  function destroy(option: RentalOption) {
    if (!window.confirm(`Delete "${option.name}"? Existing bookings may still keep historical records.`)) {
      return;
    }

    router.delete(`/admin/rental-options/${option.id}`, {
      preserveScroll: true,
    });
  }

  function search(event: FormEvent) {
    event.preventDefault();

    router.get(
      '/admin/rental-options',
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
      current="Rental Options"
      eyebrow="Rate Configuration"
      title="Rental Options"
      description="Configure rentable items, rates, quantity, units, and guest limits used by BCCC booking workflows."
      actions={
        <Button type="button" onClick={startCreate} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          New Rental Option
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
        <Card className="backend-admin-card h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="backend-admin-icon">
                <Banknote className="h-5 w-5" />
              </div>

              <div>
                <Badge variant="outline">
                  {editing ? 'Edit Option' : 'Create Option'}
                </Badge>

                <CardTitle className="mt-2 text-xl font-black">
                  {editing ? editing.name : 'Rental Details'}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={submit} className="grid gap-4">
              <Field label="Venue Area" error={errors.service_type_id}>
                <select
                  value={data.service_type_id}
                  onChange={(event) => setData('service_type_id', event.target.value)}
                  className="backend-admin-input"
                >
                  <option value="">Select venue area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Option Name" error={errors.name}>
                <input
                  value={data.name}
                  onChange={(event) => setData('name', event.target.value)}
                  className="backend-admin-input"
                  placeholder="FULL HALL, MAIN HALL, LED WALL..."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="UOM" error={errors.uom}>
                  <input
                    value={data.uom}
                    onChange={(event) => setData('uom', event.target.value)}
                    className="backend-admin-input"
                  />
                </Field>

                <Field label="Price" error={errors.price}>
                  <input
                    value={data.price}
                    onChange={(event) => setData('price', event.target.value)}
                    className="backend-admin-input"
                    inputMode="decimal"
                  />
                </Field>

                <Field label="Qty" error={errors.quantity}>
                  <input
                    value={data.quantity}
                    onChange={(event) => setData('quantity', event.target.value)}
                    className="backend-admin-input"
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Min Guests" error={errors.min_guests}>
                  <input
                    value={data.min_guests}
                    onChange={(event) => setData('min_guests', event.target.value)}
                    className="backend-admin-input"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Max Guests" error={errors.max_guests}>
                  <input
                    value={data.max_guests}
                    onChange={(event) => setData('max_guests', event.target.value)}
                    className="backend-admin-input"
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <Field label="Capacity Note" error={errors.capacity_note}>
                <input
                  value={data.capacity_note}
                  onChange={(event) => setData('capacity_note', event.target.value)}
                  className="backend-admin-input"
                  placeholder="Optional"
                />
              </Field>

              <Field label="Description" error={errors.description}>
                <textarea
                  value={data.description}
                  onChange={(event) => setData('description', event.target.value)}
                  rows={4}
                  className="backend-admin-input min-h-[120px] py-3"
                />
              </Field>

              <div className="flex gap-2">
                <Button type="submit" disabled={processing} className="flex-1 rounded-full">
                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editing ? 'Update Option' : 'Save Option'}
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
                {options.length} option{options.length === 1 ? '' : 's'}
              </CardTitle>

              <CardDescription>
                Rental options connect booking choices to prices and availability logic.
              </CardDescription>
            </div>

            <form onSubmit={search} className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                className="backend-admin-input pl-11"
                placeholder="Search options..."
              />
            </form>
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            {options.length > 0 ? (
              <div className="divide-y">
                {options.map((option) => (
                  <div
                    key={option.id}
                    className="grid gap-4 p-5 transition hover:bg-muted/35 md:grid-cols-[1fr_auto]"
                  >
                    <div className="min-w-0">
                      <p className="text-lg font-black">
                        {option.name}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {option.service_type?.name || 'No venue area assigned'} · {option.uom || 'unit'}
                      </p>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {option.description || 'No description provided.'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                        >
                          {money(option.price)}
                        </Badge>
                        <Badge variant="outline">
                          Qty {option.quantity ?? 1}
                        </Badge>
                        <Badge variant="outline">
                          Created {compactDate(option.created_at)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 md:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(option)}
                        className="rounded-full"
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => destroy(option)}
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
                <Banknote className="mx-auto h-10 w-10 text-muted-foreground/45" />
                <h3 className="mt-4 text-xl font-black">No rental options yet</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Add rental options for FULL HALL, MAIN HALL, LED WALL, VIP LOUNGE, and BOARD ROOM.
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
