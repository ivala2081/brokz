/**
 * TicketThread — /admin/tickets/view?id=.
 *
 * Shows the ticket header (subject, org, priority, status, assignee),
 * message list, and reply composer.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from './AdminShell';
import { resolveAdminLocale } from '../../lib/admin/locale';
import StatusBadge from './StatusBadge';
import TicketMessage from './TicketMessage';
import TicketComposer from './TicketComposer';
import Select from '../ui/Select';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../ui/Toast';

type Locale = 'en' | 'tr';

interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    organization: { id: string; name: string } | null;
    assigned_to: string | null;
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

interface Admin {
    id: string;
    email: string | null;
    full_name: string | null;
}

export default function TicketThread({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const [id, setId] = useState<string | null>(null);
    useEffect(() => {
        const qid = new URLSearchParams(window.location.search).get('id');
        if (qid) setId(qid);
    }, []);

    return (
        <AdminShell
            locale={locale}
            activeKey="tickets"
            title="—"
            breadcrumbs={[{ label: 'Tickets', href: '/admin/tickets' }]}
        >
            {id ? <TicketThreadInner ticketId={id} locale={locale} /> : null}
        </AdminShell>
    );
}

function TicketThreadInner({ ticketId, locale }: { ticketId: string; locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const [{ data: ticketData }, { data: msgData }, { data: adminData }] = await Promise.all([
            supabase
                .from('tickets')
                .select('id, subject, status, priority, created_at, assigned_to, organization:organizations(id, name)')
                .eq('id', ticketId)
                .maybeSingle(),
            supabase
                .from('ticket_messages')
                .select('id, body, created_at, author_profile:profiles!ticket_messages_author_fkey(id, email, full_name, role)')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true }),
            supabase
                .from('profiles')
                .select('id, email, full_name')
                .eq('role', 'admin')
                .order('email'),
        ]);
        setTicket((ticketData as Ticket | null) ?? null);
        setMessages((msgData as unknown as Message[]) ?? []);
        setAdmins((adminData as Admin[]) ?? []);
        setLoading(false);
    }, [supabase, ticketId]);

    useEffect(() => {
        void load();
    }, [load]);

    async function updateField(field: 'status' | 'priority' | 'assigned_to', value: string | null) {
        const { error } = await supabase
            .from('tickets')
            .update({ [field]: value })
            .eq('id', ticketId);
        if (error) {
            toast.error(t('common.errorGeneric'));
            return;
        }
        void load();
    }

    if (loading) {
        return <div className="rounded-lg border border-line bg-white p-10 text-center text-sm text-ink-muted">{t('common.loading')}</div>;
    }

    if (!ticket) {
        return (
            <div className="rounded-lg border border-line bg-white p-10 text-center">
                <p className="text-sm text-ink-muted">{t('tickets.thread.notFound')}</p>
                <a href="/admin/tickets" className="text-sm text-brand hover:text-brand-hover mt-3 inline-block">
                    ← {t('tickets.thread.back')}
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="rounded-lg border border-line bg-white p-6">
                <a href="/admin/tickets" className="text-xs text-ink-muted hover:text-ink">
                    ← {t('tickets.thread.back')}
                </a>
                <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-2xl font-semibold tracking-tight text-ink">{ticket.subject}</h2>
                        <p className="mt-1 text-sm text-ink-muted">
                            {ticket.organization?.name ?? '—'}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-2xs uppercase tracking-wider text-ink-muted mb-1">
                                {t('tickets.thread.changeStatus')}
                            </label>
                            <Select
                                value={ticket.status}
                                onChange={(e) => void updateField('status', e.target.value)}
                            >
                                <option value="open">{t('status.open')}</option>
                                <option value="pending">{t('status.pending')}</option>
                                <option value="closed">{t('status.closed')}</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-2xs uppercase tracking-wider text-ink-muted mb-1">
                                {t('tickets.thread.changePriority')}
                            </label>
                            <Select
                                value={ticket.priority}
                                onChange={(e) => void updateField('priority', e.target.value)}
                            >
                                <option value="low">{t('status.low')}</option>
                                <option value="med">{t('status.med')}</option>
                                <option value="high">{t('status.high')}</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-2xs uppercase tracking-wider text-ink-muted mb-1">
                                {t('tickets.thread.assign')}
                            </label>
                            <Select
                                value={ticket.assigned_to ?? ''}
                                onChange={(e) => void updateField('assigned_to', e.target.value || null)}
                            >
                                <option value="">{t('tickets.thread.unassigned')}</option>
                                {admins.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.full_name ?? a.email ?? a.id}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
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

            <TicketComposer ticketId={ticket.id} onSent={() => void load()} />
        </div>
    );
}
