/**
 * BillingPanel — /admin/billing.
 *
 * Three-tab wrapper consolidating Invoices, Payment Approvals, and Wallets
 * into a single page. Active tab is synced with the URL hash:
 *   #invoices  (default)
 *   #payments
 *   #wallets
 *
 * Pending payment count is shown as a badge on the Payments tab, sourced
 * from the same probe used by AdminShell's sidebar badge.
 *
 * Tab keyboard navigation: ArrowLeft / ArrowRight moves focus between tabs.
 *
 * Pattern mirrors all other admin page components: outer export renders
 * AdminShell (which mounts AuthGuard + AuthContext.Provider), inner
 * component calls useAuth() safely inside that tree.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from './AdminShell';
import { InvoicesInner } from './DataTables/InvoicesTable';
import { PaymentsInner } from './PaymentsQueue';
import { WalletsInner } from './WalletsTable';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { hasPaymentSubmissions } from '../../lib/admin/schemaProbe';
import { useAuth } from '../auth/AuthContext';
import { cn } from '../../lib/cn';

type Locale = 'en' | 'tr';
type TabId = 'invoices' | 'payments' | 'wallets';

const TAB_IDS: TabId[] = ['invoices', 'payments', 'wallets'];

function getHashTab(): TabId {
    if (typeof window === 'undefined') return 'invoices';
    const hash = window.location.hash.replace('#', '') as TabId;
    return TAB_IDS.includes(hash) ? hash : 'invoices';
}

/** Outer component — renders AdminShell (provides AuthGuard + AuthContext). */
export default function BillingPanel({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('admin');
    return (
        <AdminShell
            locale={locale}
            activeKey="billing"
            title={t('billing.title')}
            subtitle={t('billing.subtitle')}
        >
            <BillingInner locale={locale} />
        </AdminShell>
    );
}

/** Inner component — safe to call useAuth() here, AuthContext is mounted above. */
function BillingInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>(getHashTab);
    const [pendingCount, setPendingCount] = useState(0);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    // Sync tab from hash on back/forward navigation
    useEffect(() => {
        function onHashChange() {
            setActiveTab(getHashTab());
        }
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    // Poll pending payment count every 30 s (same source as sidebar badge)
    const loadPending = useCallback(async () => {
        const tableExists = await hasPaymentSubmissions(supabase);
        if (!tableExists) return;
        const { count } = await supabase
            .from('payment_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending_review');
        setPendingCount(count ?? 0);
    }, [supabase]);

    useEffect(() => {
        void loadPending();
        const handle = window.setInterval(() => { void loadPending(); }, 30_000);
        return () => window.clearInterval(handle);
    }, [loadPending]);

    function switchTab(id: TabId) {
        setActiveTab(id);
        window.history.replaceState(null, '', `#${id}`);
    }

    function handleTabKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const next = (index + 1) % TAB_IDS.length;
            tabRefs.current[next]?.focus();
            switchTab(TAB_IDS[next]);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = (index - 1 + TAB_IDS.length) % TAB_IDS.length;
            tabRefs.current[prev]?.focus();
            switchTab(TAB_IDS[prev]);
        }
    }

    return (
        <>
            {/* Tab bar */}
            <div
                role="tablist"
                aria-label={t('billing.title')}
                className="mb-6 inline-flex rounded-md border border-line overflow-hidden bg-white"
            >
                {TAB_IDS.map((id, index) => {
                    const isActive = activeTab === id;
                    const badge = id === 'payments' ? pendingCount : 0;
                    return (
                        <button
                            key={id}
                            ref={(el) => { tabRefs.current[index] = el; }}
                            type="button"
                            role="tab"
                            id={`billing-tab-${id}`}
                            aria-selected={isActive}
                            aria-controls={`billing-panel-${id}`}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => switchTab(id)}
                            onKeyDown={(e) => handleTabKeyDown(e, index)}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-ink text-white'
                                    : 'bg-white text-ink-muted hover:text-ink',
                            )}
                        >
                            {t(`billing.tabs.${id}`)}
                            {badge > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-brand text-white text-2xs font-bold tabular-nums">
                                    {badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab panels */}
            <div
                role="tabpanel"
                id="billing-panel-invoices"
                aria-labelledby="billing-tab-invoices"
                hidden={activeTab !== 'invoices'}
            >
                {activeTab === 'invoices' && <InvoicesInner locale={locale} />}
            </div>
            <div
                role="tabpanel"
                id="billing-panel-payments"
                aria-labelledby="billing-tab-payments"
                hidden={activeTab !== 'payments'}
            >
                {activeTab === 'payments' && <PaymentsInner locale={locale} />}
            </div>
            <div
                role="tabpanel"
                id="billing-panel-wallets"
                aria-labelledby="billing-tab-wallets"
                hidden={activeTab !== 'wallets'}
            >
                {activeTab === 'wallets' && <WalletsInner locale={locale} />}
            </div>
        </>
    );
}
