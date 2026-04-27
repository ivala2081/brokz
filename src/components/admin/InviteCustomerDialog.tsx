/**
 * InviteCustomerDialog — opens an invite form, calls `admin-invite-user`
 * Edge Function, fires toast, triggers parent refresh via onSuccess.
 *
 * Create-new-org mode (default) vs. add-to-existing-org mode. When
 * adding to existing, the org list is fetched from supabase on open.
 *
 * Called Edge Function shape (FROZEN per agent spec):
 *   POST /functions/v1/admin-invite-user
 *   body: { email, organization_id?, organization_name?, role }
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Field from '../ui/Field';
import { useAuth } from '../auth/AuthContext';
import { callEdgeFunction } from '../../lib/admin/edgeFunction';
import { toast } from '../ui/Toast';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { sortedCountries } from '../../lib/countries';

export interface InviteCustomerDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    /** Prefill email (e.g. when converting a lead). */
    prefillEmail?: string;
    /** Prefill organization name (e.g. when converting a lead). */
    prefillOrgName?: string;
}

interface OrgRow {
    id: string;
    name: string;
}

export default function InviteCustomerDialog({
    open,
    onClose,
    onSuccess,
    prefillEmail,
    prefillOrgName,
}: InviteCustomerDialogProps) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();

    const [mode, setMode] = useState<'new' | 'existing'>('new');
    const [email, setEmail] = useState('');
    const [orgName, setOrgName] = useState('');
    const [country, setCountry] = useState('');
    const [website, setWebsite] = useState('');
    const [role, setRole] = useState<'customer' | 'admin'>('customer');
    const [orgId, setOrgId] = useState<string>('');
    const [orgs, setOrgs] = useState<OrgRow[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setEmail(prefillEmail ?? '');
        setOrgName(prefillOrgName ?? '');
        setCountry('');
        setWebsite('');
        setRole('customer');
        setOrgId('');
        setMode(prefillOrgName ? 'new' : 'new');

        void (async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('id, name')
                .order('name', { ascending: true });
            if (!error && data) setOrgs(data as OrgRow[]);
        })();
    }, [open, supabase, prefillEmail, prefillOrgName]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);

        // If creating a new org, we send organization_name. If not, we include
        // the extra fields as metadata for the Edge Function to persist on
        // the new org row. The api-layer agent owns the final mapping.
        const body: Record<string, unknown> = { email, role };
        if (mode === 'existing' && orgId) {
            body.organization_id = orgId;
        } else {
            body.organization_name = orgName;
            if (country) body.country = country;
            if (website) body.website = website;
        }

        const { error } = await callEdgeFunction(supabase, 'admin-invite-user', body);
        setSubmitting(false);

        if (error) {
            toast.error(t('customers.inviteDialog.error'));
            return;
        }
        toast.success(t('customers.inviteDialog.success'));
        onSuccess?.();
        onClose();
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t('customers.inviteDialog.title')}
            description={t('customers.inviteDialog.description')}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        form="invite-customer-form"
                        loading={submitting}
                    >
                        {t('customers.inviteDialog.submit')}
                    </Button>
                </>
            }
        >
            <form id="invite-customer-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2 text-xs">
                    <button
                        type="button"
                        onClick={() => setMode('new')}
                        className={`rounded-md px-2.5 py-1 border ${mode === 'new' ? 'border-brand bg-brand-subtle text-green-700' : 'border-line text-ink-secondary hover:border-ink/30'}`}
                    >
                        {t('customers.inviteDialog.organizationName')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('existing')}
                        className={`rounded-md px-2.5 py-1 border ${mode === 'existing' ? 'border-brand bg-brand-subtle text-green-700' : 'border-line text-ink-secondary hover:border-ink/30'}`}
                    >
                        {t('customers.inviteDialog.useExisting')}
                    </button>
                </div>

                {mode === 'new' ? (
                    <>
                        <Field
                            label={t('customers.inviteDialog.organizationName')}
                            required
                        >
                            <Input
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                required
                                autoComplete="organization"
                            />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label={t('customers.inviteDialog.country')}>
                                <Select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    <option value="">—</option>
                                    {sortedCountries(resolveAdminLocale()).map((c) => (
                                        <option
                                            key={c.code}
                                            value={c.code === '--' ? '' : c.code}
                                            disabled={c.code === '--'}
                                        >
                                            {resolveAdminLocale() === 'en' ? c.en : c.tr}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label={t('customers.inviteDialog.website')}>
                                <Input
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://"
                                />
                            </Field>
                        </div>
                    </>
                ) : (
                    <Field label={t('customers.inviteDialog.selectOrg')} required>
                        <Select
                            value={orgId}
                            onChange={(e) => setOrgId(e.target.value)}
                            required
                        >
                            <option value="">—</option>
                            {orgs.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                )}

                <Field label={t('customers.inviteDialog.email')} required>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </Field>

                <Field label={t('customers.inviteDialog.role')} required>
                    <Select value={role} onChange={(e) => setRole(e.target.value as 'customer' | 'admin')}>
                        <option value="customer">{t('customers.inviteDialog.roleCustomer')}</option>
                        <option value="admin">{t('customers.inviteDialog.roleAdmin')}</option>
                    </Select>
                </Field>
            </form>
        </Dialog>
    );
}
