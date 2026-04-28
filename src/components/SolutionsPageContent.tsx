import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Stagger, StaggerItem } from './AnimateIn';
import '../i18n';

type SolutionItem = {
  key: string;
  title: string;
  description: string;
  capabilities: string[];
};

export default function SolutionsPageContent() {
  const { t } = useTranslation('solutions');
  const items = t('items', { returnObjects: true }) as SolutionItem[];

  return (
    <>
      {/* Solutions — massive typography, alternating layout */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <Stagger className="flex flex-col divide-y divide-line">
            {items.map((sol, i) => (
              <StaggerItem key={sol.key}>
                <motion.div
                  className="py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 group"
                  whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.4)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="lg:col-span-5">
                    <div className="flex items-baseline gap-5 mb-5">
                      <span className="font-mono tabular text-lg md:text-xl font-semibold text-brand">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px flex-1 bg-line" />
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ink tracking-tight leading-[1.1]">
                      {sol.title}
                    </h2>
                  </div>
                  <div className="lg:col-span-7">
                    <p className="body mb-8 max-w-2xl">{sol.description}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {sol.capabilities.map((cap, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-ink-secondary leading-relaxed">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
