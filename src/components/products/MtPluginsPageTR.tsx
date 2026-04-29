import { useState } from 'react';

const ArrowIcon = (
  <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PLUGIN_TYPES = [
  { title: 'Risk & Exposure', body: 'Gerçek zamanlı exposure plug-in’i, A-book / B-book router, dinamik margin, pre-trade kontrol, kill-switch.' },
  { title: 'Likidite Köprüleri', body: 'LP, ECN, prime broker’lara FIX köprüleri. Sembol, spread veya venue sağlığına göre smart routing.' },
  { title: 'Raporlama & BI', body: 'Manager içinde özel raporlar, BI aracınıza push, regülasyon export (MiFID II, EMIR).' },
  { title: 'Bonus & Promosyon', body: 'Deposit bonus, lot rebate, yarışma motorları — tam yapılandırılabilir, tam audit.' },
  { title: 'IB & Affiliate', body: 'Çok kademeli IB hiyerarşisi, komisyon kuralları, affiliate takibi, CRM hand-off.' },
  { title: 'Özel EA & Indicator', body: 'Özel MQL4 / MQL5 geliştirme — proprietary indicator, sinyal servisi veya execution algo.' },
];

const STEPS = [
  { step: '01', title: 'Audit', body: 'Mevcut MT4/MT5 kurulumunuzu çıkarıyoruz — server build, mevcut plug-in’ler, kırık entegrasyonlar.' },
  { step: '02', title: 'Spec & Build', body: 'Plug-in veya extension için sabit fiyat spec. Staging server’da test, MT5 binary teslim.' },
  { step: '03', title: 'Deploy & Destek', body: 'Rollback planlı production deploy. Bakım ve broker upgrade için opsiyonel retainer.' },
];

const FAQS = [
  { q: 'Hem MT4 hem MT5 için geliştiriyor musunuz?', a: 'Evet. MT4 server-side plug-in, MT5 server gateway ve client-side EA / indicator (MQL4 ve MQL5) destekliyoruz.' },
  { q: 'Mevcut plug-in’imizi düzeltebilir misiniz?', a: 'Çoğu zaman evet — önceki vendor’ın plug-in’lerini audit edebilir ve patch’leyebiliriz, kaynak kodu artık elinizde olmasa bile (yasal incelemeye tabi).' },
  { q: 'MetaQuotes server upgrade’leriyle çalışır mı?', a: 'Evet. MetaQuotes server build’lerini takip ediyoruz; breaking-change pencereleri için bakım retainer’ı sunuyoruz.' },
  { q: 'Özel likidite köprüsü kurabilir misiniz?', a: 'Evet. LP, ECN veya prime broker’lara FIX 4.4 / 5.0 köprüleri. Smart routing, A/B-book, latency monitoring dahil.' },
  { q: 'Sadece MQL4 / MQL5 mi yapıyorsunuz?', a: 'Hayır. Server-side plug-in genellikle C++. Client-side EA ve indicator MQL4 / MQL5. İkisini de teslim ediyoruz.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button type="button" onClick={() => setOpen(prev => !prev)} className="w-full flex items-center justify-between py-5 text-left gap-4 group" aria-expanded={open}>
        <span className="heading-4 text-ink group-hover:text-brand transition-colors duration-base">{q}</span>
        <span className="flex-shrink-0 w-6 h-6 rounded-full border border-line flex items-center justify-center text-ink-muted group-hover:border-brand group-hover:text-brand transition-colors duration-base">
          {open ? (
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6H10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          ) : (
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          )}
        </span>
      </button>
      {open && <p className="body pb-5 max-w-3xl">{a}</p>}
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute -inset-6 rounded-[24px] blur-2xl opacity-40" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.10) 60%, transparent 100%)' }} />
      <div className="relative rounded-[14px] overflow-hidden border border-white/10 bg-neutral-950 shadow-2xl ring-1 ring-white/5">
        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900 border-b border-white/10">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[11px] text-neutral-400 truncate font-mono">MT5 Server Manager · Plug-in’ler</span>
        </div>
        <div className="p-5 space-y-2.5">
          {[
            { name: 'BrokzRiskGateway.dll', ver: 'v2.4.1', status: 'Çalışıyor', tone: 'emerald' },
            { name: 'BrokzLPBridge.dll', ver: 'v3.1.0', status: 'Çalışıyor', tone: 'emerald' },
            { name: 'BrokzReporter.dll', ver: 'v1.8.2', status: 'Çalışıyor', tone: 'emerald' },
            { name: 'BrokzBonusEngine.dll', ver: 'v1.2.0', status: 'Çalışıyor', tone: 'emerald' },
            { name: 'LegacyVendor.dll', ver: 'v0.9.4', status: 'Devre dışı', tone: 'neutral' },
          ].map(p => (
            <div key={p.name} className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-neutral-900 border border-white/5">
              <div className="w-8 h-8 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(16,185,129)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-mono text-white truncate">{p.name}</div>
                <div className="text-[10px] text-neutral-500">{p.ver}</div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.tone === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-neutral-700/50 text-neutral-400'}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:flex absolute -bottom-4 -left-4 items-center gap-2 px-3 py-2 rounded-full bg-white text-neutral-900 shadow-lg ring-1 ring-black/5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold">MT4 · MT5 · MQL5</span>
      </div>
    </div>
  );
}

export default function MtPluginsPageTR() {
  return (
    <>
      <section className="relative overflow-hidden bg-surface-inverse text-ink-inverse section-padding">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ background: 'radial-gradient(60% 50% at 15% 20%, rgba(16,185,129,0.18) 0%, transparent 60%), radial-gradient(50% 40% at 85% 80%, rgba(16,185,129,0.10) 0%, transparent 60%)' }} />
        <div className="relative section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <p className="section-label-light">MT4 / MT5 Plug-in ve Eklentileri</p>
              <h1 className="heading-hero-sm text-white mt-4 mb-6 max-w-[22ch]">
                Brokerlar İçin Özel MT4 & MT5 Plug-in’leri
              </h1>
              <p className="body-lg text-neutral-300 max-w-xl mb-10">
                Server-side plug-in, likidite köprüleri, özel EA ve broker eklentileri.
                MT5’i genişletiyor olun ya da legacy MT4’ü kurtarıyor — production
                binary teslim ediyoruz.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/tr/iletisim" className="btn-primary">Fiyat Teklifi Al</a>
                <a href="https://brokztrader.com/" target="_blank" rel="noopener noreferrer" className="btn btn-lg border border-line-inverse text-white hover:border-brand-accent hover:text-brand-accent transition-colors duration-base">Ücretsiz Demo</a>
              </div>
            </div>
            <div className="lg:col-span-6"><HeroMockup /></div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Ne Yapıyoruz</p>
              <h2 className="heading-2 text-ink mb-6">Risk Gateway’den Özel EA’ya</h2>
              <p className="body mb-4">
                MetaTrader, retail brokerların büyük kısmının hâlâ üzerinde koştuğu
                raydır. Platform çalışıyor — ama her broker’ın farkı, üzerine eklenen
                plug-in katmanında yaşar.
              </p>
              <p className="body">
                Biz o katmanı yapıyoruz. Server-side C++ plug-in, FIX köprüleri, MQL4
                / MQL5 EA ve indicator, broker extension. Sıfırdan ya da önceki
                vendor’ın bıraktığını düzelterek.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: 'MT4 + MT5', label: 'Server ve client tarafı' },
                { stat: 'C++ / MQL', label: 'Native plug-in geliştirme' },
                { stat: 'FIX köprüleri', label: 'LP, ECN, prime' },
                { stat: 'Audit-ready', label: 'Compliance-aware kod' },
              ].map(({ stat, label }) => (
                <div key={label} className="p-6 rounded-card border border-line bg-surface-muted flex flex-col gap-2">
                  <span className="text-2xl font-bold tracking-tight text-ink">{stat}</span>
                  <span className="text-sm text-ink-muted leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Plug-in Türleri</p>
          <h2 className="heading-2 text-ink mb-10">Neler Teslim Ediyoruz</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLUGIN_TYPES.map(({ title, body }) => (
              <div key={title} className="p-7 rounded-card border border-line bg-surface flex flex-col gap-3">
                <div className="w-2 h-2 rounded-full bg-brand" />
                <h3 className="heading-4 text-ink">{title}</h3>
                <p className="body-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">Süreç</p>
          <h2 className="heading-2 text-ink mb-4">Audit → Build → Deploy</h2>
          <p className="body mb-12 max-w-2xl">Kırık plug-in’den veya yeni gereksinimden production deploy’a üç adım.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-4">
                <span className="text-5xl font-extrabold tracking-tighter text-line-strong select-none">{step}</span>
                <h3 className="heading-3 text-ink">{title}</h3>
                <p className="body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Fiyat</p>
          <h2 className="heading-2 text-ink mb-4">Plug-in Bazlı veya Retainer</h2>
          <p className="body mb-10 max-w-2xl">Sabit fiyatla tek plug-in teslimi veya kalıcı MT4/MT5 mühendislik bench’ine ihtiyacı olan brokerlar için retainer.</p>
          <p className="body text-ink-secondary">
            <a href="/tr/iletisim" className="inline-flex items-center gap-1.5 text-brand hover:text-brand-hover font-semibold transition-colors duration-base">
              Detaylı teklif alın {ArrowIcon}
            </a>
          </p>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">SSS</p>
          <h2 className="heading-2 text-ink mb-10">Sıkça Sorulan Sorular</h2>
          <div className="max-w-3xl">{FAQS.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}</div>
        </div>
      </section>

      <section className="section-padding bg-surface-inverse">
        <div className="section-container text-center">
          <p className="section-label-light mb-4">Başlayın</p>
          <h2 className="heading-2 text-white mb-5">Plug-in mi geliştirilsin — yoksa düzeltilsin?</h2>
          <p className="body-lg text-neutral-300 max-w-xl mx-auto mb-10">MT4/MT5 server build’inizi ve neye ihtiyacınız olduğunu anlatın. Bir iş günü içinde dönüyoruz.</p>
          <a href="/tr/iletisim" className="btn-primary">Konuşmaya Başla</a>
        </div>
      </section>
    </>
  );
}
