import { ResourcePageShell } from '@/components/admin-resource/resource-page-shell';
import {
  compactDateTime,
  extractCollection,
  extractLinks,
  statusBadgeTone,
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
  Eye,
  Mail,
  MessageSquare,
  Search,
  Trash2,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type Inquiry = {
  id: number | string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type PageProps = {
  workspaceRole?: string;
  inquiries?: unknown;
  messages?: unknown;
  filters?: {
    q?: string;
  };
};

export function InquiriesPage() {
  const { props } = usePage() as unknown as { props: PageProps };
  const inquiries = useMemo(
    () => extractCollection<Inquiry>(props.inquiries ?? props.messages),
    [props.inquiries, props.messages],
  );
  const pageLinks = extractLinks(props.inquiries ?? props.messages);
  const [q, setQ] = useState(String(props.filters?.q ?? ''));

  function search(event: FormEvent) {
    event.preventDefault();

    router.get(
      '/admin/inquiries',
      { q: q || undefined },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      },
    );
  }

  function destroy(inquiry: Inquiry) {
    if (!window.confirm(`Delete inquiry "${inquiry.subject || inquiry.id}"?`)) return;

    router.delete(`/admin/inquiries/${inquiry.id}`, {
      preserveScroll: true,
    });
  }

  return (
    <ResourcePageShell
      role={props.workspaceRole}
      current="Inquiries"
      eyebrow="Client Communication"
      title="Inquiries"
      description="Review public inquiries and client messages using the same backend workspace style."
    >
      <Card className="backend-admin-card overflow-hidden">
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-black tracking-[-0.04em]">
              {inquiries.length} inquiry{inquiries.length === 1 ? '' : 'ies'}
            </CardTitle>

            <CardDescription>
              Public contact messages, booking questions, and client follow-ups.
            </CardDescription>
          </div>

          <form onSubmit={search} className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="backend-admin-input pl-11"
              placeholder="Search inquiries..."
            />
          </form>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          {inquiries.length > 0 ? (
            <div className="divide-y">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="grid gap-4 p-5 transition hover:bg-muted/35 md:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="backend-admin-icon">
                        <MessageSquare className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-lg font-black">
                          {inquiry.subject || `Inquiry #${inquiry.id}`}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {inquiry.name || 'Unknown sender'} · {inquiry.email || 'No email'}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 max-w-4xl text-sm leading-6 text-muted-foreground">
                      {inquiry.message || 'No message content.'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className={statusBadgeTone(inquiry.status)}>
                        {inquiry.status || 'New'}
                      </Badge>
                      <Badge variant="outline">
                        {compactDateTime(inquiry.created_at)}
                      </Badge>
                      {inquiry.phone ? (
                        <Badge variant="outline">{inquiry.phone}</Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 md:justify-end">
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link href={`/admin/inquiries/${inquiry.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>

                    {inquiry.email ? (
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <a href={`mailto:${inquiry.email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Reply
                        </a>
                      </Button>
                    ) : null}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => destroy(inquiry)}
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
              <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/45" />
              <h3 className="mt-4 text-xl font-black">No inquiries found</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Public contact messages and client inquiries will appear here.
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
