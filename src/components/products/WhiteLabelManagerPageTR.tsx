import { useState } from 'react';

const CheckIcon = (
  <svg
    aria-hidden="true"
    className="w-4 h-4 text-brand flex-shrink-0 mt-0.5"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 8.5L6.5 12L13 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowIcon = (
  <svg
    aria-hidden="true"
    className="w-4 h-4"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 8H13M9 4L13 8L9 12"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MODULES = [
  {
    title: 'Hesap Operasyonları',
    body: 'Trader onboarding, alt hesaplar, bakiye düzenleme, kredi limiti ve KYC inceleme — hepsi tek konsolda.',
  },
  {
    title: 'İşlem İzleme',
    body: 'Canlı pozisyon defteri, exposure, trader bazlı P&L. Pre-trade kontroller, kill-switch ve zorla kapatma.',
  },
  {
    title: 'Finansal Operasyonlar',
    body: 'Para yatırma / çekme onayı, PSP yönlendirme, iç transferler ve treasury ile mutabakat.',
  },
  {
    title: 'Risk & İzleme',
    body: 'Margin uyarıları, exposure haritaları, A-book / B-book yönlendirme kuralları ve trader bazlı risk skoru.',
  },
  {
    title: 'Analiz & Raporlama',
    body: 'Hacim, spread maliyeti, retention, deposit dönüşüm. Özel dashboard için Chart Studio. BI export.',
  },
  {
    title: 'IB & Kampanyalar',
    body: 'Çok kademeli IB hiyerarşisi, komisyon kuralları, pazarlama kampanyaları, bonus motoru ve audit log.',
  },
];

const ROLES = [
  {
    role: 'Operasyon',
    points: ['Para yatırma & çekme onayı', 'Bakiye ve kredi düzenleme', 'KYC ve destek talepleri'],
  },
  {
    role: 'Risk Masası',
    points: ['Canlı exposure izleme', 'A/B-book yönlendirme', 'Margin uyarısı & zorla kapatma'],
  },
  {
    role: 'Compliance',
    points: ['Tüm aksiyonların audit log\'u', 'Rol bazlı erişim kontrolü', 'KYC inceleme ve raporlama'],
  },
  {
    role: 'Yönetim',
    points: ['Gerçek zamanlı KPI ve AUM', 'Treasury ve P&L görünümü', 'Kampanya ve IB performansı'],
  },
];

const SPECS = [
  { label: 'Frontend', value: 'React + TypeScript admin SPA, role-aware UI' },
  { label: 'Backend', value: 'REST + WebSocket API, event-sourced audit trail' },
  { label: 'Auth', value: 'SSO (SAML / OIDC), 2FA, granüler rol bazlı erişim' },
  { label: 'Audit', value: 'Kullanıcı bazlı değiştirilemez aksiyon log\'u, SIEM\'e export' },
  { label: 'Dağıtım', value: 'Bulut veya on-prem, container, kendi altyapınız' },
  { label: 'Entegrasyon', value: 'WebTrader, likidite köprüleri, PSP, CRM, BI / data warehouse' },
];

const FAQS = [
  {
    q: 'WebTrader White Label Manager nedir?',
    a: 'WebTrader ile birlikte gelen kurum içi back-office ve risk konsoludur. Operasyon, risk, finans ve compliance ekipleriniz brokeraji günlük olarak buradan yönetir — trader onboarding, deposit onayı, exposure izleme, IB yapılandırma ve raporlama.',
  },
  {
    q: 'WebTrader\'dan ayrı satılıyor mu?',
    a: 'Hayır. Manager, WebTrader ile tek platform olarak teslim edilir. Aynı veri katmanını, audit trail\'i ve kimlik doğrulamayı paylaşırlar. WebTrader\'ı satın aldığınızda Manager dahildir.',
  },
  {
    q: 'Roller ve izinler özelleştirilebilir mi?',
    a: 'Evet. Manager kutudan çıktığı gibi rol bazlı erişim kontrolü ile gelir — Operasyon, Risk, Compliance, Yönetim ve özel roller. Her modül ve aksiyon role göre kısıtlanabilir, her aksiyon değiştirilemez audit log\'a kaydedilir.',
  },
  {
    q: 'Mevcut CRM ve PSP\'lerimizle entegre olur mu?',
    a: 'Hayır — üçüncü taraf CRM\'lere bağlanmıyoruz. Bunun yerine projenin parçası olarak iş akışlarınıza özel CRM geliştiriyoruz. PSP, KYC, BI ve data warehouse entegrasyonları REST ve webhook API\'leri ile teslim edilir.',
  },
  {
    q: 'Manager white-label olabilir mi?',
    a: 'Evet. Logo, renk sistemi, tipografi ve domain firmanızın markasına göre uygulanır. Manager, kendi altyapınızda çalışır ve personele görünür hiçbir Brokz atıfı yoktur.',
  },
  {
    q: 'Audit ve compliance nasıl ele alınıyor?',
    a: 'Her aksiyon — bakiye düzenleme, onay, rol değişikliği, yapılandırma değişikliği — aktör, zaman damgası ve önce/sonra durumu ile kaydedilir. Log\'lar değiştirilemez ve SIEM veya compliance arşivinize export edilebilir.',
  },
  {
    q: 'Kendi fiyat sağlayıcımı kullanabilir miyim?',
    a: 'Evet. Kendi fiyat sağlayıcınızı kullanabilirsiniz — API bilgilerini bizle paylaşmanız yeterli, entegrasyonu biz yapıyoruz.',
  },
  {
    q: 'Fiyat sağlayıcım yoksa fiyat sağlıyor musunuz?',
    a: 'Evet. Standart olarak ekstra ücret olmadan biz fiyat sağlıyoruz. Ancak emir iletmiyoruz — execution tarafı size bağlı.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="heading-4 text-ink group-hover:text-brand transition-colors duration-base">
          {q}
        </span>
        <span className="flex-shrink-0 w-6 h-6 rounded-full border border-line flex items-center justify-center text-ink-muted group-hover:border-brand group-hover:text-brand transition-colors duration-base">
          {open ? (
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6H10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </button>
      {open && <p className="body pb-5 max-w-3xl">{a}</p>}
    </div>
  );
}

export default function WhiteLabelManagerPageTR() {
  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-inverse text-ink-inverse section-padding">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(60% 50% at 15% 20%, rgba(16,185,129,0.18) 0%, transparent 60%), radial-gradient(50% 40% at 85% 80%, rgba(16,185,129,0.10) 0%, transparent 60%)',
          }}
        />
        <div className="relative section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <p className="section-label-light">WebTrader White Label Manager</p>
              <h1 className="heading-hero-sm text-white mt-4 mb-6 max-w-[22ch]">
                WebTrader’ınızın Arkasındaki Back-Office Konsolu
              </h1>
              <p className="body-lg text-neutral-300 max-w-xl mb-10">
                Operasyon, risk, finans ve compliance için tek konsol. Gerçek zamanlı
                exposure, onay akışları, audit-grade log’lar — tamamen white-label ve kendi
                altyapınızda.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/tr/iletisim" className="btn-primary">
                  Fiyat Teklifi Al
                </a>
                <a
                  href="https://brokztrader.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-lg border border-line-inverse text-white hover:border-brand-accent hover:text-brand-accent transition-colors duration-base"
                >
                  Ücretsiz Demo
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-6 rounded-[24px] blur-2xl opacity-40"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.10) 60%, transparent 100%)',
                  }}
                />
                <div className="relative rounded-[14px] overflow-hidden border border-black/10 bg-white shadow-2xl ring-1 ring-black/5">
                  <div className="flex items-center gap-2 px-4 py-3 bg-neutral-100 border-b border-black/10">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                    <div className="ml-3 flex-1 h-6 rounded-md bg-white border border-black/10 flex items-center px-3">
                      <span className="text-[11px] text-neutral-500 truncate">
                        manager.brokerinizin-domaini.com / dashboard
                      </span>
                    </div>
                  </div>
                  <img
                    src="/3.png"
                    alt="Brokz WebTrader White Label Manager — operasyon, risk ve compliance dashboard"
                    width={1600}
                    height={900}
                    loading="eager"
                    className="block w-full h-auto"
                  />
                </div>
                <div className="hidden md:flex absolute -bottom-4 -left-4 items-center gap-2 px-3 py-2 rounded-full bg-white text-neutral-900 shadow-lg ring-1 ring-black/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold">Canlı · Audit-grade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Nedir ────────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Nedir</p>
              <h2 className="heading-2 text-ink mb-6">
                Brokerajınızın İşletim Sistemi
              </h2>
              <p className="body mb-4">
                White Label Manager, WebTrader’ın kurum içi karşılığıdır. Operasyon
                ekibinizin deposit onayladığı, risk masanızın kaçan pozisyonu kapattığı,
                compliance görevlinizin audit trail çektiği yerdir.
              </p>
              <p className="body">
                WebTrader ile tek platform olarak teslim edilir — aynı veri katmanı, aynı
                marka, aynı kimlik sistemi. Kritik akışta spreadsheet, Telegram onayı veya
                üçüncü taraf CRM yok.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: '1 Konsol', label: 'Ops, risk, finans, compliance' },
                { stat: 'Gerçek zamanlı', label: 'Trader bazlı exposure & P&L' },
                { stat: 'RBAC', label: 'Granüler rol bazlı erişim' },
                { stat: 'Audit-grade', label: 'Değiştirilemez aksiyon log\'u' },
              ].map(({ stat, label }) => (
                <div
                  key={label}
                  className="p-6 rounded-card border border-line bg-surface-muted flex flex-col gap-2"
                >
                  <span className="text-2xl font-bold tracking-tight text-ink">{stat}</span>
                  <span className="text-sm text-ink-muted leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Modüller ─────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Modüller</p>
          <h2 className="heading-2 text-ink mb-4">
            Back-Office’in İhtiyacı Olan Her Şey, Tek Yerde
          </h2>
          <p className="body mb-10 max-w-2xl">
            Altı çekirdek modül, regüle bir brokerajın tüm operasyonel yüzeyini kapsar —
            trader onboarding’den risk yönlendirmeye, finansal mutabakata kadar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map(({ title, body }) => (
              <div
                key={title}
                className="p-7 rounded-card border border-line bg-surface flex flex-col gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-brand" />
                <h3 className="heading-4 text-ink">{title}</h3>
                <p className="body-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Her ekibe göre ───────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">Her Ekibe Göre</p>
          <h2 className="heading-2 text-ink mb-10">
            Tek Konsol, Dört Ekip, Sıfır Spreadsheet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map(({ role, points }) => (
              <div
                key={role}
                className="p-6 rounded-card border border-line bg-surface-muted flex flex-col gap-4"
              >
                <h3 className="heading-4 text-ink">{role}</h3>
                <ul className="flex flex-col gap-2.5">
                  {points.map(p => (
                    <li key={p} className="flex items-start gap-2 body-sm">
                      {CheckIcon}
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. White-Label ──────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Marka Sahipliği</p>
              <h2 className="heading-2 text-ink mb-6">
                Sizin Markanız. Sizin Domain’iniz. Sizin Altyapınız.
              </h2>
              <p className="body">
                Manager, kontrol ettiğiniz bir domain üzerinde, sizin renk sisteminiz ve
                logonuz uygulanmış halde çalışır. Personel sizin markanıza giriş yapar — Brokz
                değil. Kod tabanı sizin, veri sizin ve istediğiniz zaman alıp götürebilirsiniz.
              </p>
            </div>
            <ul className="flex flex-col gap-4 pt-2 lg:pt-14">
              {[
                'Özel domain (manager.brokerinizin-domaini.com)',
                'Tam renk ve tipografi sistemi',
                'Logo ve favicon her yerde',
                'Personele veya denetçilere Brokz atıfı yok',
                'Kod tabanı kendi repository\'nize teslim',
                'Bulut veya on-prem dağıtım',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  {CheckIcon}
                  <span className="body">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 6. Mimari ───────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Mimari</p>
              <h2 className="heading-2 text-ink mb-6">Teknik Mimari</h2>
              <p className="body">
                Manager, WebTrader ile aynı veri katmanı ve kimlik sistemini paylaşır. Tek
                doğruluk kaynağı, tek audit log, tek kimlik. İlk commit’ten itibaren regüle
                ortamlar için tasarlandı.
              </p>
            </div>
            <ol className="flex flex-col gap-5">
              {SPECS.map(({ label, value }, i) => (
                <li key={label} className="flex gap-5 items-start">
                  <span className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-ink text-sm">{label}: </span>
                    <span className="text-sm text-ink-secondary">{value}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── 7. Fiyat ────────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Fiyat</p>
          <h2 className="heading-2 text-ink mb-4">WebTrader ile Birlikte</h2>
          <p className="body mb-10 max-w-2xl">
            Manager, WebTrader projesinin parçası olarak teslim edilir. Fiyat kapsama bağlıdır
            — rol sayısı, entegrasyonlar ve özel modüller.
          </p>
          <p className="body text-ink-secondary">
            <a
              href="/tr/iletisim"
              className="inline-flex items-center gap-1.5 text-brand hover:text-brand-hover font-semibold transition-colors duration-base"
            >
              Detaylı teklif alın {ArrowIcon}
            </a>
          </p>
        </div>
      </section>

      {/* ── 8. SSS ──────────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">SSS</p>
          <h2 className="heading-2 text-ink mb-10">Sıkça Sorulan Sorular</h2>
          <div className="max-w-3xl">
            {FAQS.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CTA ──────────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-inverse">
        <div className="section-container text-center">
          <p className="section-label-light mb-4">Başlayın</p>
          <h2 className="heading-2 text-white mb-5">
            Brokerajınızı tek konsoldan yönetmeye hazır mısınız?
          </h2>
          <p className="body-lg text-neutral-300 max-w-xl mx-auto mb-10">
            Operasyon kurulumunuzu anlatın. Bir iş günü içinde kapsamlı teklif ile dönüyoruz.
          </p>
          <a href="/tr/iletisim" className="btn-primary">
            Konuşmaya Başla
          </a>
        </div>
      </section>
    </>
  );
}
