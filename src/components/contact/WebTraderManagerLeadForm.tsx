import { useTranslation } from 'react-i18next';
import LeadFormShell from './LeadFormShell';
import '../../i18n';

interface WebTraderManagerLeadFormProps {
    onBack: () => void;
}

export default function WebTraderManagerLeadForm({ onBack }: WebTraderManagerLeadFormProps) {
    const { t } = useTranslation('contact');

    return (
        <LeadFormShell
            title={t('leadForms.webtrader.title')}
            subtitle={t('leadForms.webtrader.subtitle')}
            inquiryType="webtrader_manager"
            onBack={onBack}
        />
    );
}
