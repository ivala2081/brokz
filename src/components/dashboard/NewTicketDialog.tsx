/**
 * NewTicketDialog — form to open a new support ticket.
 *
 * React Hook Form + Zod. Inserts into `tickets` + first `ticket_messages`
 * directly via Supabase (RLS allows customer to create own tickets).
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import Dialog from '../ui/Dialog';
import Field from '../ui/Field';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../ui/Toast';

const schema = z.object({
    subject: z.string().min(3),
    priority: z.enum(['low', 'med', 'high']),
    message: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

export interface NewTicketDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewTicketDialog({ open, onClose, onSuccess }: NewTicketDialogProps) {
    const { t } = useTranslation('dashboard');
    const { supabase, user, profile } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { priority: 'med', subject: '', message: '' },
    });

    function handleClose() {
        reset();
        onClose();
    }

    async function onSubmit(values: FormValues) {
        setSubmitting(true);
        // Insert the ticket
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .insert({
                subject: values.subject,
                priority: values.priority,
                status: 'open',
                organization_id: profile.organization_id,
                opened_by: user.id,
            })
            .select('id')
            .single();

        if (ticketError || !ticket) {
            toast.error(t('tickets.newDialog.error'));
            setSubmitting(false);
            return;
        }

        // Insert the first message
        const { error: msgError } = await supabase.from('ticket_messages').insert({
            ticket_id: (ticket as { id: string }).id,
            author: user.id,
            body: values.message,
        });

        setSubmitting(false);

        if (msgError) {
            toast.error(t('tickets.newDialog.error'));
            return;
        }

        toast.success(t('tickets.newDialog.success'));
        reset();
        onSuccess();
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            title={t('tickets.newDialog.title')}
            size="md"
            footer={
                <div className="flex gap-2 justify-end w-full">
                    <Button variant="secondary" onClick={handleClose} disabled={submitting}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        form="new-ticket-form"
                        loading={submitting}
                        disabled={submitting}
                    >
                        {submitting ? t('common.submitting') : t('tickets.newDialog.submit')}
                    </Button>
                </div>
            }
        >
            <form id="new-ticket-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Field
                    label={t('tickets.newDialog.subject')}
                    htmlFor="ticket-subject"
                    required
                    error={errors.subject?.message}
                >
                    <Input
                        id="ticket-subject"
                        placeholder={t('tickets.newDialog.subjectPlaceholder')}
                        {...register('subject')}
                    />
                </Field>

                <Field
                    label={t('tickets.newDialog.priority')}
                    htmlFor="ticket-priority"
                    required
                    error={errors.priority?.message}
                >
                    <Select id="ticket-priority" {...register('priority')}>
                        <option value="low">{t('status.low')}</option>
                        <option value="med">{t('status.med')}</option>
                        <option value="high">{t('status.high')}</option>
                    </Select>
                </Field>

                <Field
                    label={t('tickets.newDialog.message')}
                    htmlFor="ticket-message"
                    required
                    error={errors.message?.message}
                >
                    <Textarea
                        id="ticket-message"
                        placeholder={t('tickets.newDialog.messagePlaceholder')}
                        rows={5}
                        {...register('message')}
                    />
                </Field>
            </form>
        </Dialog>
    );
}
