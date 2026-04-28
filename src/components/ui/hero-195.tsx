import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BorderBeam } from './border-beam';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { GLSLHills } from './glsl-hills';
import '../../i18n';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const SCREENSHOT_TABS = [
    {
        value: 'webtrader',
        tKey: 'hero.tabs.webtrader',
        url: 'app.brokztech.com/trade',
        img: '/2.png',
        alt: 'WebTrader platform — live EUR/USD chart with order panel',
    },
    {
        value: 'brokerManager',
        tKey: 'hero.tabs.brokerManager',
        url: 'app.brokztech.com/dashboard',
        img: '/3.png',
        alt: 'Broker Manager — AUM, equity, trader activity',
    },
    {
        value: 'brokerage',
        tKey: 'hero.tabs.brokerage',
        url: 'demo.brokztech.com',
        img: '/1.png',
        alt: 'White-label brokerage site',
    },
] as const;

function ScreenshotTab({ img, alt }: { img: string; alt: string }) {
    return (
        <div className="relative overflow-hidden rounded-lg bg-neutral-800">
            <img
                src={img}
                alt={alt}
                className="w-full h-auto block"
                loading="eager"
                draggable={false}
            />
            <div
                className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)' }}
                aria-hidden
            />
        </div>
    );
}

export function Hero195() {
    const { t } = useTranslation(['home', 'common']);

    return (
        <section className="relative bg-surface-inverse text-white overflow-hidden">
            <GLSLHills cameraZ={125} planeSize={256} speed={0.4} />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(5,10,6,0.3) 0%, transparent 50%, rgba(5,10,6,0.4) 100%)' }}
                aria-hidden
            />

            <div className="relative section-container py-20 md:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-16 lg:gap-14 items-center [&>*]:min-w-0">

                    {/* ── LEFT: copy ── */}
                    <div className="min-w-0 overflow-hidden">
                        <motion.h1
                            className="heading-hero-sm text-white mb-8"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
                        >
                            {t('home:hero.titleLead')}{' '}
                            <span className="text-brand-accent">{t('home:hero.titleAccent')}</span>{' '}
                            {t('home:hero.titleTail')}
                        </motion.h1>

                        <motion.p
                            className="text-lg text-gray-300 leading-relaxed mb-10 max-w-lg"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
                        >
                            {t('home:hero.body')}
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.34, ease: EASE }}
                        >
                            <a href="/contact" className="btn-primary btn-shimmer">
                                {t('common:cta.startProject')}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </a>
                            <a href="/solutions" className="btn-ghost">
                                {t('common:cta.exploreSolutions')}
                            </a>
                        </motion.div>

                        <motion.div
                            className="mt-12 flex items-center gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
                        >
                            <div className="flex -space-x-2">
                                {['#1e3a2f', '#14532d', '#166534', '#15803d'].map((bg, i) => (
                                    <span
                                        key={i}
                                        className="relative inline-block w-7 h-7 rounded-full border-2 border-neutral-900 cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:border-brand"
                                        style={{ background: bg, zIndex: i }}
                                        onMouseEnter={e => (e.currentTarget.style.zIndex = '20')}
                                        onMouseLeave={e => (e.currentTarget.style.zIndex = String(i))}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-gray-400">
                                {t('home:hero.trust')}
                            </p>
                        </motion.div>
                    </div>

                    {/* ── RIGHT: product demo card ── */}
                    <motion.div
                        className="relative lg:-mr-8 xl:-mr-16 2xl:-mr-24 lg:scale-[1.06] xl:scale-110 origin-left"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
                    >
                        <div
                            className="absolute -inset-4 rounded-2xl pointer-events-none"
                            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,192,51,0.10), transparent)' }}
                            aria-hidden
                        />

                        <div className="relative rounded-2xl border border-neutral-200/20 bg-white overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.35)]">
                            <BorderBeam size={300} duration={10} colorFrom="#00C033" colorTo="#5FDD82" />

                            <Tabs defaultValue="webtrader">
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                    </div>
                                    <TabsList className="flex-1 bg-neutral-100/80 border border-neutral-200 p-1 rounded-lg">
                                        {SCREENSHOT_TABS.map(tab => (
                                            <TabsTrigger
                                                key={tab.value}
                                                value={tab.value}
                                                className="flex-1 rounded-md text-xs font-medium transition-all
                                                    bg-transparent text-neutral-400 hover:text-neutral-600
                                                    data-[state=active]:bg-white data-[state=active]:text-neutral-900
                                                    data-[state=active]:shadow-sm data-[state=active]:border-0"
                                            >
                                                {t(`home:${tab.tKey}`)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <div className="p-3 bg-white">
                                    {SCREENSHOT_TABS.map(tab => (
                                        <TabsContent key={tab.value} value={tab.value}>
                                            <ScreenshotTab img={tab.img} alt={tab.alt} />
                                        </TabsContent>
                                    ))}
                                </div>
                            </Tabs>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
