/**
 * InviteCustomerDialog — opens an invite/add form, calls `admin-invite-user`
 * Edge Function (invite mode) OR inserts directly into organizations
 * (manual mode), fires toast, triggers parent refresh via onSuccess.
 *
 * Modes:
 *   invite-new      → create new org + send invite email
 *   invite-existing → attach user to existing org + send invite email
 *   manual          → just create org row (no email, no auth user)
 *                     useful when SMTP is not yet configured.
 *
 * Called Edge Function shape:
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

type Mode = 'invite-new' | 'invite-existing' | 'manual';

export default function InviteCustomerDialog({
    open,
    onClose,
    onSuccess,
    prefillEmail,
    prefillOrgName,
}: InviteCustomerDialogProps) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();

    const [mode, setMode] = useState<Mode>('invite-new');
    const [email, setEmail] = useState('');
    const [orgName, setOrgName] = useState('');
    const [country, setCountry] = useState('');
    const [website, setWebsite] = useState('');
    const [contactEmail, setContactEmail] = useState('');
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
        setContactEmail('');
        setRole('customer');
        setOrgId('');
        setMode('invite-new');

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

        if (mode === 'manual') {
            // Direct insert into organizations — no auth user, no invite email.
            const { error } = await supabase
                .from('organizations')
                .insert({
                    name: orgName,
                    country: country || null,
                    website: website || null,
                    contact_email: contactEmail || null,
                });
            setSubmitting(false);
            if (error) {
                toast.error(`${t('customers.inviteDialog.error')}: ${error.message}`);
                return;
            }
            toast.success(t('customers.inviteDialog.manualSuccess'));
            onSuccess?.();
            onClose();
            return;
        }

        // Invite flow — calls admin-invite-user Edge Function
        const body: Record<string, unknown> = { email, role };
        if (mode === 'invite-existing' && orgId) {
            body.organization_id = orgId;
        } else {
            body.organization_name = orgName;
            if (country) body.country = country;
            if (website) body.website = website;
        }

        const { error } = await callEdgeFunction(supabase, 'admin-invite-user', body);
        setSubmitting(false);

        if (error) {
            // eslint-disable-next-line no-console
            console.error('[admin-invite-user] failed', error);
            const detail = error.message || error.code || `HTTP ${error.status}`;
            toast.error(`${t('customers.inviteDialog.error')}: ${detail}`);
            return;
        }
        toast.success(t('customers.inviteDialog.success'));
        onSuccess?.();
        onClose();
    }

    const isManual = mode === 'manual';
    const isInviteNew = mode === 'invite-new';
    const isInviteExisting = mode === 'invite-existing';
    const showOrgFields = isInviteNew || isManual;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={isManual ? t('customers.inviteDialog.manualTitle') : t('customers.inviteDialog.title')}
            description={isManual ? t('customers.inviteDialog.manualDescription') : t('customers.inviteDialog.description')}
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
                        {isManual ? t('customers.inviteDialog.manualSubmit') : t('customers.inviteDialog.submit')}
                    </Button>
                </>
            }
        >
            <form id="invite-customer-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs">
                    <button
                        type="button"
                        onClick={() => setMode('invite-new')}
                        className={`rounded-md px-2.5 py-1 border ${isInviteNew ? 'border-brand bg-brand-subtle text-green-700' : 'border-line text-ink-secondary hover:border-ink/30'}`}
                    >
                        {t('customers.inviteDialog.modeInviteNew')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('invite-existing')}
                        className={`rounded-md px-2.5 py-1 border ${isInviteExisting ? 'border-brand bg-brand-subtle text-green-700' : 'border-line text-ink-secondary hover:border-ink/30'}`}
                    >
                        {t('customers.inviteDialog.modeInviteExisting')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('manual')}
                        className={`rounded-md px-2.5 py-1 border ${isManual ? 'border-brand bg-brand-subtle text-green-700' : 'border-line text-ink-secondary hover:border-ink/30'}`}
                    >
                        {t('customers.inviteDialog.modeManual')}
                    </button>
                </div>

                {showOrgFields ? (
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

                {isManual ? (
                    <Field label={t('customers.inviteDialog.contactEmail')}>
                        <Input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder={t('customers.inviteDialog.contactEmailPlaceholder')}
                            autoComplete="email"
                        />
                    </Field>
                ) : (
                    <>
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
                    </>
                )}
            </form>
        </Dialog>
    );
}
