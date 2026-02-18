import AnimateIn, { Stagger, StaggerItem } from './AnimateIn';

interface Stat {
  value: string;
  label: string;
}

interface StatBlockProps {
  stats: Stat[];
  dark?: boolean;
}

export default function StatBlock({ stats, dark = false }: StatBlockProps) {
  return (
    <div className={`${dark ? 'border-y border-gray-800' : 'border-y border-gray-100'}`}>
      <div className="section-container py-12 md:py-16">
        <AnimateIn>
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <StaggerItem key={i}>
                <div className="text-center">
                  <p className={`text-3xl md:text-4xl font-bold mb-2 ${
                    dark ? 'text-brand-accent' : 'text-brand'
                  }`}>
                    {stat.value}
                  </p>
                  <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </AnimateIn>
      </div>
    </div>
  );
}
