/**
 * TicketMessage — one message bubble in a ticket thread.
 *
 * Admin messages align right with subtle brand tint. Customer messages
 * align left, neutral surface. No avatars (no fake/initials).
 */

import { cn } from '../../lib/cn';
import { formatDateTime } from '../../lib/admin/format';

export interface TicketMessageProps {
    body: string;
    createdAt: string;
    authorEmail: string | null;
    isAdmin: boolean;
    locale?: 'en' | 'tr';
}

export default function TicketMessage({
    body,
    createdAt,
    authorEmail,
    isAdmin,
    locale = 'en',
}: TicketMessageProps) {
    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';
    return (
        <div className={cn('flex w-full', isAdmin ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-xl rounded-lg px-4 py-3 border',
                    isAdmin ? 'bg-brand-subtle border-brand/20 text-ink' : 'bg-white border-line text-ink',
                )}
            >
                <div className="flex items-center gap-2 text-2xs uppercase tracking-wider text-ink-muted mb-1.5">
                    <span className="truncate max-w-[14rem]">{authorEmail ?? '—'}</span>
                    <span>·</span>
                    <time dateTime={createdAt}>{formatDateTime(createdAt, localeTag)}</time>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
            </div>
        </div>
    );
}
