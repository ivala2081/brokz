import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Brand identity reveal — plays the kinetic shatter → "brokz" wordmark
 * animation once when the section scrolls into view. No copy, no eyebrow,
 * no caption — the brand stands on its own visual statement (Apple/Linear
 * tarzı). Replay control is exposed for keyboard + pointer users.
 *
 * Performance: poster JPG is the only network cost above the fold; video
 * sources use preload="metadata" so bytes ship only when the user reaches
 * this section. Browser source-selection (WebM > MP4) handles codec routing.
 *
 * Accessibility: muted + playsInline (no surprise audio); IntersectionObserver
 * autoplay is suppressed under prefers-reduced-motion. Replay button is
 * keyboard-focusable and labeled via i18n.
 */
export default function BrandIntroSection() {
  const { t } = useTranslation('common');
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasPlayed) {
            void video.play().catch(() => {
              // Autoplay blocked by browser policy — replay button is the fallback.
            });
            setHasPlayed(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [hasPlayed]);

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-surface-inverse"
      aria-label={t('a11y.brandIntro')}
    >
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
          poster="/brand/brokz-intro-poster.jpg"
          aria-label={t('a11y.brandIntro')}
        >
          <source src="/brand/brokz-intro.webm" type="video/webm" />
          <source src="/brand/brokz-intro.mp4" type="video/mp4" />
        </video>

        <button
          type="button"
          onClick={handleReplay}
          aria-label={t('a11y.replayBrandIntro')}
          className="absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur transition-colors duration-base hover:bg-black/50 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-inverse"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>
    </section>
  );
}
