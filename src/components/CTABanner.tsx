import { Link } from 'react-router-dom';
import AnimateIn from './AnimateIn';

interface CTABannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export default function CTABanner({ title, description, buttonText, buttonLink }: CTABannerProps) {
  return (
    <section className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="section-container">
        <AnimateIn>
          <div className="bg-brand-dark rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 max-w-lg leading-tight">
                {title}
              </h2>
              <p className="text-gray-400 max-w-md leading-relaxed text-sm">
                {description}
              </p>
            </div>
            <Link
              to={buttonLink}
              className="btn-primary flex-shrink-0"
            >
              {buttonText}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
