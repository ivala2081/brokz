/**
 * InviteCustomerDialog — opens an invite form, calls `admin-invite-user`
 * Edge Function, fires toast, triggers parent refresh via onSuccess.
 *
 * Modes:
 *   invite-new      → create new org + onboard user (invite email or admin-set password)
 *   invite-existing → attach user to existing org + onboard
 *
 * Onboarding paths within both modes:
 *   - default: Supabase invite email (user clicks link to set password)
 *   - "Set password manually" checkbox: admin sets password, no email sent.
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

type Mode = 'invite-new' | 'invite-existing';

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
    const [setPasswordMode, setSetPasswordMode] = useState(false);
    const [password, setPassword] = useState('');

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
        setSetPasswordMode(false);
        setPassword('');

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

        // Invite flow — calls admin-invite-user Edge Function
        const body: Record<string, unknown> = { email, role };
        if (mode === 'invite-existing' && orgId) {
            body.organization_id = orgId;
        } else {
            body.organization_name = orgName;
            if (country) body.country = country;
            if (website) body.website = website;
        }
        if (setPasswordMode && password) {
            body.password = password;
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

    const isInviteNew = mode === 'invite-new';
    const isInviteExisting = mode === 'invite-existing';
    const showOrgFields = isInviteNew;

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

                        <div className="rounded-lg border border-line bg-surface-muted/40 p-3">
                            <label className="flex cursor-pointer items-start gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand"
                                    checked={setPasswordMode}
                                    onChange={(e) => setSetPasswordMode(e.target.checked)}
                                />
                                <span>
                                    <span className="font-medium text-ink">
                                        {t('customers.inviteDialog.setPassword')}
                                    </span>
                                    <span className="block text-xs text-ink-secondary">
                                        {t('customers.inviteDialog.setPasswordHint')}
                                    </span>
                                </span>
                            </label>
                            {setPasswordMode && (
                                <div className="mt-3">
                                    <Field
                                        label={t('customers.inviteDialog.passwordLabel')}
                                        required
                                    >
                                        <Input
                                            type="text"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            minLength={8}
                                            maxLength={72}
                                            required
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                        />
                                    </Field>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </form>
        </Dialog>
    );
}
