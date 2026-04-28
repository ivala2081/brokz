import { useTranslation } from 'react-i18next';
import LeadFormShell from './LeadFormShell';
import '../../i18n';

interface InfoPricingLeadFormProps {
    onBack: () => void;
}

export default function InfoPricingLeadForm({ onBack }: InfoPricingLeadFormProps) {
    const { t } = useTranslation('contact');

    return (
        <LeadFormShell
            title={t('leadForms.info.title')}
            subtitle={t('leadForms.info.subtitle')}
            inquiryType="info_pricing"
            onBack={onBack}
        />
    );
}
