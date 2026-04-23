/**
 * AuditViewer — /admin/audit island.
 *
 * Lists rows from public.audit_log joined with the actor's profile.email /
 * full_name so admins can see WHO did what. Filters: actor search, action,
 * entity_type, and a fixed date range (last 30 / 90 / 365 days / all).
 *
 * `diff` is a JSONB blob; we render it lazily inside an expandable row.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from './AdminShell';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';
import DataTable, { type DataTableColumn } from '../ui/DataTable';
import Select from '../ui/Select';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { formatDateTime } from '../../lib/admin/format';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    diff: Record<string, unknown> | null;
    created_at: string;
    actor: { id: string; email: string | null; full_name: string | null } | null;
}

const RANGE_OPTIONS = ['30d', '90d', '365d', 'all'] as const;
type RangeKey = (typeof RANGE_OPTIONS)[number];

function rangeToTimestamp(range: RangeKey): string | null {
    if (range === 'all') return null;
    const days = parseInt(range.replace('d', ''), 10);
    return new Date(Date.now() - days * 86400_000).toISOString();
}

export default function AuditViewer({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    return (
        <AdminShell
            locale={locale}
            activeKey="audit"
            title={useTitle(locale)}
            subtitle={useSubtitle(locale)}
        >
            <AuditInner locale={locale} />
        </AdminShell>
    );
}

function useTitle(_locale: Locale) {
    const { t } = useTranslation('admin');
    return t('audit.title');
}
function useSubtitle(_locale: Locale) {
    const { t } = useTranslation('admin');
    return t('audit.subtitle');
}

function AuditInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();

    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<RangeKey>('30d');
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const load = useCallback(async () => {
        setLoading(true);
        let q = supabase
            .from('audit_log')
            .select('id, action, entity_type, entity_id, diff, created_at, actor:profiles(id, email, full_name)')
            .order('created_at', { ascending: false })
            .limit(500);
        const since = rangeToTimestamp(range);
        if (since) q = q.gte('created_at', since);
        if (actionFilter) q = q.eq('action', actionFilter);
        if (entityFilter) q = q.eq('entity_type', entityFilter);
        const { data } = await q;
        setRows(((data ?? []) as unknown as Row[]));
        setLoading(false);
    }, [supabase, range, actionFilter, entityFilter]);

    useEffect(() => {
        void load();
    }, [load]);

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const actionOptions = useMemo(() => {
        const set = new Set<string>();
        for (const r of rows) set.add(r.action);
        return Array.from(set).sort();
    }, [rows]);

    const entityOptions = useMemo(() => {
        const set = new Set<string>();
        for (const r of rows) set.add(r.entity_type);
        return Array.from(set).sort();
    }, [rows]);

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'created_at',
            header: t('audit.columns.createdAt'),
            cell: (r) => (
                <span className="text-xs text-ink-muted tabular-nums whitespace-nowrap">
                    {formatDateTime(r.created_at, localeTag)}
                </span>
            ),
            sortable: true,
            searchAccessor: (r) => r.created_at,
        },
        {
            key: 'actor',
            header: t('audit.columns.actor'),
            cell: (r) => (
                <div className="flex flex-col">
                    <span className="text-sm text-ink">{r.actor?.full_name ?? '—'}</span>
                    <span className="text-xs text-ink-muted">{r.actor?.email ?? '—'}</span>
                </div>
            ),
            searchAccessor: (r) => `${r.actor?.email ?? ''} ${r.actor?.full_name ?? ''}`,
        },
        {
            key: 'action',
            header: t('audit.columns.action'),
            cell: (r) => (
                <span className="text-sm font-mono text-brand">{r.action}</span>
            ),
            sortable: true,
            searchAccessor: (r) => r.action,
        },
        {
            key: 'entity',
            header: t('audit.columns.entityType'),
            cell: (r) => (
                <span className="text-sm text-ink-secondary">{r.entity_type}</span>
            ),
            sortable: true,
            searchAccessor: (r) => r.entity_type,
        },
        {
            key: 'diff',
            header: t('audit.columns.diff'),
            cell: (r) => {
                const has = r.diff && Object.keys(r.diff).length > 0;
                if (!has) return <span className="text-ink-muted text-xs">—</span>;
                const isOpen = !!expanded[r.id];
                return (
                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={() => setExpanded((e) => ({ ...e, [r.id]: !e[r.id] }))}
                            className="text-xs text-brand hover:text-brand-hover self-start"
                        >
                            {isOpen ? t('audit.hideDiff') : t('audit.viewDiff')}
                        </button>
                        {isOpen && (
                            <pre className="text-2xs bg-surface-muted rounded p-2 font-mono whitespace-pre-wrap break-all max-w-md max-h-40 overflow-auto">
                                {JSON.stringify(r.diff, null, 2)}
                            </pre>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <DataTable<Row>
            data={rows}
            columns={columns}
            loading={loading}
            getRowId={(r) => r.id}
            searchPlaceholder={t('audit.filters.actor')}
            labels={{
                search: t('common.search'),
                previous: t('common.previous'),
                next: t('common.next'),
                rowCount: (n) => `${n}`,
                pageOf: (c, tot) => `${c} / ${tot}`,
                noResults: t('common.none'),
            }}
            toolbar={
                <div className="flex items-center gap-2">
                    <Select value={range} onChange={(e) => setRange(e.target.value as RangeKey)} className="w-auto">
                        <option value="30d">30d</option>
                        <option value="90d">90d</option>
                        <option value="365d">365d</option>
                        <option value="all">all</option>
                    </Select>
                    <Select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="w-auto"
                    >
                        <option value="">{t('audit.filters.allActions')}</option>
                        {actionOptions.map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </Select>
                    <Select
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value)}
                        className="w-auto"
                    >
                        <option value="">{t('audit.filters.allEntities')}</option>
                        {entityOptions.map((e) => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </Select>
                    <Button variant="ghost" onClick={() => void load()}>
                        {t('common.refresh')}
                    </Button>
                </div>
            }
            emptyState={
                <EmptyState
                    title={t('audit.empty.title')}
                    description={t('audit.empty.description')}
                />
            }
        />
    );
}
