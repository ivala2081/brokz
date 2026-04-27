/**
 * TicketComposer — admin reply textarea + send button.
 *
 * Inserts into `ticket_messages` directly via Supabase (admin RLS).
 * Attachments are Phase 3.
 */

import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../ui/Toast';

export interface TicketComposerProps {
    ticketId: string;
    onSent?: () => void;
}

export default function TicketComposer({ ticketId, onSent }: TicketComposerProps) {
    const { t } = useTranslation('admin');
    const { supabase, user } = useAuth();
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const trimmed = body.trim();
        if (!trimmed) return;
        setSubmitting(true);
        const { error } = await supabase.from('ticket_messages').insert({
            ticket_id: ticketId,
            author: user.id,
            body: trimmed,
        });
        setSubmitting(false);
        if (error) {
            toast.error(t('tickets.thread.composer.error'));
            return;
        }
        toast.success(t('tickets.thread.composer.success'));
        setBody('');
        onSent?.();
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-white p-4 space-y-3">
            <label className="block">
                <span className="block text-xs font-medium text-ink mb-1.5">
                    {t('tickets.thread.composer.label')}
                </span>
                <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={t('tickets.thread.composer.placeholder')}
                    rows={4}
                    required
                />
            </label>
            <div className="flex items-center justify-between">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled
                    title={t('tickets.thread.composer.attachDisabled')}
                >
                    {t('tickets.thread.composer.attach')}
                </Button>
                <Button
                    type="submit"
                    disabled={!body.trim()}
                    loading={submitting}
                >
                    {submitting ? t('tickets.thread.composer.sending') : t('tickets.thread.composer.send')}
                </Button>
            </div>
        </form>
    );
}
