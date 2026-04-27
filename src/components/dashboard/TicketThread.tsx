/**
 * TicketThread — /dashboard/tickets/view?id=.
 *
 * Customer perspective: read-only ticket header (status, priority),
 * message list, and reply composer (customer CAN reply on open tickets).
 *
 * Reuses TicketMessage and TicketComposer from admin/ — they are
 * parametric on `ticketId` and `useAuth()`, so they work fine under
 * the customer RLS context without modification.
 *
 * Admin-only controls (assign, change status/priority selects) are NOT
 * rendered here.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardShell from './DashboardShell';
import StatusBadge from '../admin/StatusBadge';
import TicketMessage from '../admin/TicketMessage';
import TicketComposer from '../admin/TicketComposer';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';

type Locale = 'en' | 'tr';

interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
}

interface Message {
    id: string;
    body: string;
    created_at: string;
    author_profile: {
        id: string;
        email: string | null;
        full_name: string | null;
        role: string;
    } | null;
}

export default function TicketThread({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const [id, setId] = useState<string | null>(null);
    useEffect(() => {
        const qid = new URLSearchParams(window.location.search).get('id');
        if (qid) setId(qid);
    }, []);

    return (
        <DashboardShell
            locale={locale}
            activeKey="tickets"
            title="—"
            breadcrumbs={[{ label: 'Tickets', href: '/dashboard/tickets' }]}
        >
            {id ? <TicketThreadInner ticketId={id} locale={locale} /> : null}
        </DashboardShell>
    );
}

function TicketThreadInner({ ticketId, locale }: { ticketId: string; locale: Locale }) {
    const { t } = useTranslation('dashboard');
    const { supabase } = useAuth();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const [{ data: ticketData }, { data: msgData }] = await Promise.all([
            supabase
                .from('tickets')
                .select('id, subject, status, priority, created_at')
                .eq('id', ticketId)
                .maybeSingle(),
            supabase
                .from('ticket_messages')
                .select('id, body, created_at, author_profile:profiles!ticket_messages_author_fkey(id, email, full_name, role)')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true }),
        ]);
        setTicket((ticketData as Ticket | null) ?? null);
        setMessages((msgData as unknown as Message[]) ?? []);
        setLoading(false);
    }, [supabase, ticketId]);

    useEffect(() => {
        void load();
    }, [load]);

    if (loading) {
        return (
            <div className="rounded-lg border border-line bg-white p-10 text-center text-sm text-ink-muted">
                {t('common.loading')}
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="rounded-lg border border-line bg-white p-10 text-center">
                <p className="text-sm text-ink-muted">{t('tickets.thread.notFound')}</p>
                <a href="/dashboard/tickets" className="text-sm text-brand hover:text-brand-hover mt-3 inline-block">
                    ← {t('tickets.thread.back')}
                </a>
            </div>
        );
    }

    const canReply = ticket.status !== 'closed';

    return (
        <div className="space-y-6">
            <header className="rounded-lg border border-line bg-white p-6">
                <a href="/dashboard/tickets" className="text-xs text-ink-muted hover:text-ink">
                    ← {t('tickets.thread.back')}
                </a>
                <div className="mt-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-ink">{ticket.subject}</h2>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <StatusBadge status={ticket.status} />
                    <StatusBadge status={ticket.priority} />
                </div>
            </header>

            <div className="space-y-3">
                {messages.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-line p-10 text-center text-sm text-ink-muted">
                        —
                    </div>
                ) : (
                    messages.map((m) => (
                        <TicketMessage
                            key={m.id}
                            body={m.body}
                            createdAt={m.created_at}
                            authorEmail={m.author_profile?.email ?? m.author_profile?.full_name ?? null}
                            isAdmin={m.author_profile?.role === 'admin'}
                            locale={locale}
                        />
                    ))
                )}
            </div>

            {canReply && (
                <TicketComposer ticketId={ticket.id} onSent={() => void load()} />
            )}
        </div>
    );
}
