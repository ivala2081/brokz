import { Link } from 'react-router-dom';
import AnimateIn from './AnimateIn';

interface CTABannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  label?: string;
}

export default function CTABanner({ title, description, buttonText, buttonLink, label = 'Start Here' }: CTABannerProps) {
  return (
    <section className="section-padding bg-surface-inverse text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-grid-dark bg-[length:64px_64px]" />
      <div className="absolute inset-0 bg-brand-radial pointer-events-none" />

      <div className="relative section-container">
        <AnimateIn>
          <div className="max-w-4xl">
            <p className="section-label-light">{label}</p>
            <h2 className="heading-hero-sm text-white mb-8 max-w-[20ch]">{title}</h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed mb-10">
              {description}
            </p>
            <Link to={buttonLink} className="btn-primary">
              {buttonText}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
