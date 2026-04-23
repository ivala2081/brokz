/**
 * StatusBadge — maps DB enum values to Badge variants + i18n labels.
 *
 * One place to change if we rebrand our status colors. Every admin table
 * that shows a status must use this rather than Badge directly.
 */

import { useTranslation } from 'react-i18next';
import Badge, { type BadgeVariant } from '../ui/Badge';

export type KnownStatus =
    // order
    | 'pending'
    | 'active'
    | 'cancelled'
    | 'expired'
    // license
    | 'revoked'
    // invoice
    | 'draft'
    | 'sent'
    | 'paid'
    | 'overdue'
    // ticket
    | 'open'
    | 'closed'
    // lead
    | 'new'
    | 'qualified'
    | 'rejected'
    // blog
    | 'published'
    // org
    | 'suspended'
    // priority
    | 'low'
    | 'med'
    | 'high';

const VARIANT: Record<KnownStatus, BadgeVariant> = {
    pending: 'amber',
    active: 'brand',
    cancelled: 'neutral',
    expired: 'danger',
    revoked: 'danger',
    draft: 'neutral',
    sent: 'info',
    paid: 'brand',
    overdue: 'danger',
    open: 'amber',
    closed: 'neutral',
    new: 'info',
    qualified: 'brand',
    rejected: 'neutral',
    published: 'brand',
    suspended: 'danger',
    low: 'neutral',
    med: 'amber',
    high: 'danger',
};

export interface StatusBadgeProps {
    status: KnownStatus | string | null | undefined;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const { t } = useTranslation('admin');
    if (!status) return <Badge variant="neutral">—</Badge>;
    const variant = (VARIANT as Record<string, BadgeVariant>)[status] ?? 'neutral';
    return <Badge variant={variant}>{t(`status.${status}`, status)}</Badge>;
}
