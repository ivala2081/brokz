import { useState } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────

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

const CrossIcon = (
  <svg
    aria-hidden="true"
    className="w-4 h-4 text-ink-muted flex-shrink-0 mt-0.5"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4L12 12M12 4L4 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { label: 'Marka sahipliği',         custom: true,  mt: false, saas: false },
  { label: 'Dağıtım modeli',          custom: 'Kendi altyapınız', mt: 'MetaQuotes sunucuları', saas: 'Sağlayıcı bulutu' },
  { label: 'Varlık esnekliği',        custom: 'Tam',  mt: 'Sınırlı', saas: 'Sınırlı' },
  { label: 'Özellik genişletilebilirliği', custom: true, mt: false, saas: false },
  { label: 'Lisanslama maliyet modeli', custom: 'Tek seferlik veya retainer', mt: 'Sürekli MetaQuotes ücretleri', saas: 'Aylık kullanıcı başı' },
  { label: 'Müşteri deneyimi',        custom: 'Web tabanlı, kurulumsuz', mt: 'Masaüstü istemci gerekir', saas: 'Genel UI' },
];

const VALUE_CARDS = [
  {
    title: 'Tam Kod Tabanı Sahipliği',
    body: 'Sizin fikri mülkiyetiniz olarak teslim edilir. Sürekli sağlayıcı ücreti yok. Brokz\'un faaliyetine bağımlılık yok.',
  },
  {
    title: 'Gerçek Zamanlı Execution Engine',
    body: 'WebSocket tabanlı feed, 100ms altı emir onayı. Kurumsal tick hızı için tasarlandı.',
  },
  {
    title: 'Kurumsal UX Standartları',
    body: 'Hacimde işlem yapan profesyonel traderlar için tasarlandı. Yeniden paketlenmiş bir retail arayüzü değil.',
  },
  {
    title: 'Çoklu Broker Mimarisi',
    body: 'Aynı anda birden fazla likidite sağlayıcısına bağlanın. Varlık sınıfı, spread veya kurala göre yönlendirin.',
  },
  {
    title: 'Regülasyona Hazır',
    body: 'Audit log, rol tabanlı erişim ve uyumluluk raporlaması çekirdeğe gömülü. Sonradan eklenmedi.',
  },
  {
    title: 'Launch Sonrası Destek',
    body: 'Her proje launch sonrası destek penceresi içerir. Sürekli platform evrimi için isteğe bağlı retainer.',
  },
];

const FEATURES = [
  {
    title: 'Gerçek Zamanlı Emir Execution',
    body: 'WebSocket tabanlı feed, 100ms altı onay, tek tıkla ve algoritmik emir giriş modları.',
  },
  {
    title: 'Çoklu Varlık Desteği',
    body: 'FX, hisse, türev, emtia, kripto ve CFD tek terminalde. Varlık sınıfları her dağıtıma göre yapılandırılabilir.',
  },
  {
    title: 'Yapılandırılabilir UI',
    body: 'Sürükle-bırak widget\'lar, grafik araçları, özel watchlistler ve düzenler. Markanıza ve iş akışınıza uyarlanır.',
  },
  {
    title: 'Çoklu Hesap Yönetimi',
    body: 'Alt hesaplar, ekip hiyerarşileri, kullanıcı başı rol tabanlı erişim. Yönetilen hesap yapıları için inşa edildi.',
  },
  {
    title: 'Risk ve Uyumluluk Katmanı',
    body: 'Gerçek zamanlı maruziyet izleme, ön-işlem kontrolleri, audit kalitesinde loglar. Uyumluluk raporlaması hazır.',
  },
  {
    title: 'White-Label Dağıtım',
    body: 'Tam marka uygulaması. Özel domain. Kendi kod tabanınız. Kendi altyapınız. Brokz atfı yok.',
  },
];

const TECH_SPECS = [
  { label: 'Frontend', value: 'React + TypeScript, WebSocket-native gerçek zamanlı katman' },
  { label: 'Backend', value: 'REST + WebSocket API, yatay ölçeklenebilir mikroservisler' },
  { label: 'Veritabanı', value: 'Tick verisi için time-series, hesap/emir state için ilişkisel' },
  { label: 'Altyapı', value: 'Cloud-native, container, AWS / GCP / Azure / on-prem dağıtım' },
  { label: 'Güvenlik', value: 'TLS uçtan uca, rol tabanlı auth, oturum yönetimi, penetrasyon testli' },
  { label: 'Entegrasyonlar', value: 'FIX protokolü, REST köprüleri, MT4/MT5 köprü uyumluluğu' },
];

const FAQS = [
  {
    q: 'Özel webtrader nedir?',
    a: 'Özel webtrader, brokeriniz için sıfırdan inşa edilen tarayıcı tabanlı bir işlem terminalidir. MT4/MT5 gibi hazır platformların aksine, tamamen markalanır, mimari olarak size aittir ve işinizin gerektirdiği herhangi bir özellikle genişletilebilir.',
  },
  {
    q: 'Webtrader platformunu nasıl satın alabilirim?',
    a: 'Brokz ile gereksinimlerinizi paylaşın — varlık sınıfları, beklenen kullanıcı hacmi, gereken entegrasyonlar ve markalaşma şartları. Projeyi kapsamlandırıyor, sabit fiyatlı veya milestone bazlı sözleşme yapıyor ve genellikle 10–16 hafta içinde üretime hazır platformu teslim ediyoruz.',
  },
  {
    q: 'Özel webtrader maliyeti ne kadar?',
    a: 'Webtrader fiyatı kapsama bağlıdır: desteklenen varlık sınıfları, eşzamanlı kullanıcı sayısı, entegrasyonlar (likidite, risk, back-office) ve white-label gereksinimleri. Detaylı teklif için bizimle iletişime geçin. Tek seferlik lisans satın alma ve devamlı SaaS modeli sunuyoruz.',
  },
  {
    q: 'Webtrader, MT4 veya MT5\'ten daha mı iyidir?',
    a: 'Tam marka kontrolü, web öncelikli deneyim ve özel özellikler ekleme yeteneği isteyen brokerlar için özel webtrader, MT4/MT5\'i geride bırakır. MT4/MT5\'in katı UI kısıtlamaları, lisans maliyetleri vardır ve white-label seçeneği yoktur. Özel webtrader herhangi bir tarayıcıda istemci kurulumu olmadan çalışır.',
  },
  {
    q: 'Webtrader white-label olarak teslim edilebilir mi?',
    a: 'Evet. Brokz platformu tam white-label koşullarla teslim eder — kod tabanına sahip olursunuz, tüm UI öğelerini markalarsınız ve kendi altyapınızda veya bulutunuzda dağıtırsınız. Müşterilerinizin göreceği hiçbir Brokz filigranı veya üçüncü taraf atıfı yoktur.',
  },
  {
    q: 'Webtrader geliştirme ne kadar sürer?',
    a: 'Standart kurumsal webtrader dağıtımı, imzalı anlaşmadan üretime kadar 10–16 hafta sürer. Karmaşık çoklu varlık, çoklu broker kurulumları 20–24 hafta sürebilir. Birinci haftadan itibaren üretim benzeri ortama karşı haftalık demo veriyoruz.',
  },
  {
    q: 'Kendi fiyat sağlayıcımı kullanabilir miyim?',
    a: 'Evet. Kendi fiyat sağlayıcınızı kullanabilirsiniz — API bilgilerini bizle paylaşmanız yeterli, entegrasyonu platforma biz yapıyoruz.',
  },
  {
    q: 'Fiyat sağlayıcım yoksa fiyat sağlıyor musunuz?',
    a: 'Evet. Standart olarak ekstra ücret olmadan biz fiyat sağlıyoruz. Ancak emir iletmiyoruz — execution tarafı size bağlı.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <td className="py-4 px-5 text-center">
        <span className="inline-flex justify-center">{CheckIcon}</span>
      </td>
    );
  }
  if (value === false) {
    return (
      <td className="py-4 px-5 text-center">
        <span className="inline-flex justify-center">{CrossIcon}</span>
      </td>
    );
  }
  return (
    <td className="py-4 px-5 text-sm text-ink-secondary text-center">{value}</td>
  );
}

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
      {open && (
        <p className="body pb-5 max-w-3xl">{a}</p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WebTraderPageTR() {
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
              <p className="section-label-light">Özel WebTrader Platformu</p>
              <h1 className="heading-hero-sm text-white mt-4 mb-6 max-w-[22ch]">
                Kurumsal Brokerlar için Özel WebTrader Platformu
              </h1>
              <p className="body-lg text-neutral-300 max-w-xl mb-10">
                Tarayıcı tabanlı, gerçek zamanlı ve tamamen white-label. Bir sağlayıcının
                kısıtlamaları etrafında değil, sizin altyapınız etrafında tasarlanmış işlem terminali.
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
                        app.brokerinizin-domaini.com / webtrader
                      </span>
                    </div>
                  </div>
                  <img
                    src="/2.png"
                    alt="Brokz özel webtrader terminali — canlı grafik, emir defteri ve izleme listesi"
                    width={1600}
                    height={900}
                    loading="eager"
                    className="block w-full h-auto"
                  />
                </div>
                <div className="hidden md:flex absolute -bottom-4 -left-4 items-center gap-2 px-3 py-2 rounded-full bg-white text-neutral-900 shadow-lg ring-1 ring-black/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold">Canlı · Sub-100ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Nedir ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Nedir</p>
              <h2 className="heading-2 text-ink mb-6">Özel WebTrader Nedir?</h2>
              <p className="body mb-4">
                Özel webtrader, belirli bir brokerin altyapısı, markası ve müşteri kitlesi için
                inşa edilmiş tarayıcı tabanlı kurumsal işlem terminalidir. Tamamen tarayıcıda
                çalışır — masaüstü istemci yok, MetaTrader bağımlılığı yok, zincirde üçüncü taraf
                sağlayıcı yok.
              </p>
              <p className="body">
                MT4 veya MT5\'in aksine, özel webtrader mimari olarak size aittir. Kod tabanı
                sizindir. Marka sizindir. Özellik yol haritası sizindir. Birinin platformuna
                erişim kiralamıyorsunuz — brokerinizin ebediyen sahip olduğu özel bir işlem
                terminali inşa ediyorsunuz.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: '10–16 hafta', label: 'Tipik teslim süresi' },
                { stat: '%100', label: 'White-label' },
                { stat: 'Çoklu Varlık', label: 'FX, hisse, kripto, CFD' },
                { stat: 'Lock-in Yok', label: 'Tam kod tabanı sahipliği' },
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

      {/* ── 3. Karşılaştırma ────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Platform Karşılaştırması</p>
          <h2 className="heading-2 text-ink mb-4">
            Neden MT4/MT5 yerine Özel WebTrader Almalı?
          </h2>
          <p className="body mb-10 max-w-2xl">
            MT4 ve MT5, MetaQuotes altyapısında çalışan retail brokerlar için tasarlandı. Marka
            kontrolü, mimari özgürlük ve web öncelikli müşteri deneyimi gerektiren kurumsal
            brokerlar için yanlış araç.
          </p>
          <div className="overflow-x-auto rounded-card border border-line">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="py-4 px-5 text-left font-semibold text-ink-secondary w-[34%]">
                    Kriter
                  </th>
                  <th className="py-4 px-5 text-center font-semibold text-brand">
                    Özel WebTrader
                  </th>
                  <th className="py-4 px-5 text-center font-semibold text-ink-secondary">
                    MT4 / MT5
                  </th>
                  <th className="py-4 px-5 text-center font-semibold text-ink-secondary">
                    SaaS Platformlar
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b border-line last:border-0 ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-muted'}`}
                  >
                    <td className="py-4 px-5 font-medium text-ink">{row.label}</td>
                    <ComparisonCell value={row.custom} />
                    <ComparisonCell value={row.mt} />
                    <ComparisonCell value={row.saas} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 4. Nasıl Alınır ─────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">Süreç</p>
          <h2 className="heading-2 text-ink mb-4">
            Brokeriniz için WebTrader Nasıl Alınır?
          </h2>
          <p className="body mb-12 max-w-2xl">
            İlk görüşmeden üretim launch\'ına üç adım.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Keşif Görüşmesi',
                body: 'Gereksinimlerinizi paylaşın: varlık sınıfları, beklenen kullanıcı hacmi, entegrasyonlar (likidite, risk, back-office) ve marka rehberi. Kapsamı belirleriz.',
              },
              {
                step: '02',
                title: 'Sabit Fiyat Teklifi',
                body: '5 iş günü içinde kapsamlı, milestone bazlı, sabit fiyatlı sözleşme alırsınız. Belirsiz saatlik faturalama yok. Kapsam sürpriz yok.',
              },
              {
                step: '03',
                title: 'Geliştirme ve Launch',
                body: 'Birinci haftadan itibaren üretim benzeri ortama karşı haftalık demo. 10–16 hafta içinde teslim. Kendi altyapınızda kendi markanızla canlıya geçersiniz.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-4">
                <span className="text-5xl font-extrabold tracking-tighter text-line-strong select-none">
                  {step}
                </span>
                <h3 className="heading-3 text-ink">{title}</h3>
                <p className="body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Neden Brokz ──────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Neden Brokz</p>
          <h2 className="heading-2 text-ink mb-4">
            Kurumsal Brokerlar için Neden Brokz En İyi WebTrader Sağlayıcısı?
          </h2>
          <p className="body mb-10 max-w-2xl">
            Sadece kurumsal brokerlar için inşa ediyoruz. Her karar — mimari, UX, teslim modeli —
            bu kısıtla alınıyor.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUE_CARDS.map(({ title, body }) => (
              <div
                key={title}
                className="p-7 rounded-card border border-line bg-surface flex flex-col gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-brand" />
                <h3 className="heading-4 text-ink">{title}</h3>
                <p className="body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. White-Label ──────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Marka Sahipliği</p>
              <h2 className="heading-2 text-ink mb-6">
                White-Label WebTrader — Tam Marka Sahipliği
              </h2>
              <p className="body">
                Her piksel, sizin markanız. Platformu logonuz, renk sisteminiz, domain\'iniz ve
                tasarım dilinizle teslim ediyoruz. Brokz atfı yok. Üçüncü taraf filigranı yok.
                Platform birinci günden itibaren kendi altyapınıza dağıtılır ve size aittir.
              </p>
            </div>
            <ul className="flex flex-col gap-4 pt-2 lg:pt-14">
              {[
                'Özel domain dağıtımı',
                'Tam renk/tipografi sistemi uygulaması',
                'Logonuz her yerde',
                'Üçüncü taraf markalama yok',
                'Kod tabanı kendi repository\'nize teslim',
                'İsteğe bağlı white-label destek sözleşmesi',
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

      {/* ── 7. Fiyatlandırma ────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Fiyatlandırma</p>
          <h2 className="heading-2 text-ink mb-4">
            WebTrader Fiyatlandırması ve Lisanslama
          </h2>
          <p className="body mb-10 max-w-2xl">
            İki çalışma modeli. Her ikisi de üretim sınıfı platform sunar. Fiyatlandırma kapsama
            göre değişir — detaylı teklif için iletişime geçin.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Card A */}
            <div className="p-8 rounded-card border-2 border-brand bg-surface flex flex-col gap-5">
              <div>
                <span className="badge-brand mb-3">Tek Seferlik Lisans</span>
                <h3 className="heading-3 text-ink mt-2">Sabit fiyatlı teslim</h3>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  'Tam kod tabanı sahipliği, sürekli ücret yok',
                  'Milestone bazlı sözleşme, sabit toplam fiyat',
                  'Tamamlanınca repository\'nize teslim',
                  'İsteğe bağlı launch sonrası destek retainer\'ı',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    {CheckIcon}
                    <span className="body-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Card B */}
            <div className="p-8 rounded-card border border-line bg-surface flex flex-col gap-5">
              <div>
                <span className="badge-brand mb-3">Sürekli Retainer</span>
                <h3 className="heading-3 text-ink mt-2">Devamlı geliştirme</h3>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  'Aylık özellik sprintleri, öncelikli destek',
                  'Altyapı izleme dahil',
                  'Platformu işinizle birlikte evrimleştirin',
                  'Adanmış mühendislik kapasitesi',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    {CheckIcon}
                    <span className="body-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="body text-ink-secondary">
            Fiyatlar listelenmiyor — kapsam varlık sınıfları, kullanıcı hacmi ve gereken
            entegrasyonlara göre önemli ölçüde değişir.{' '}
            <a
              href="/tr/iletisim"
              className="inline-flex items-center gap-1.5 text-brand hover:text-brand-hover font-semibold transition-colors duration-base"
            >
              Detaylı teklif iste {ArrowIcon}
            </a>
          </p>
        </div>
      </section>

      {/* ── 8. Özellikler ───────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">Özellikler</p>
          <h2 className="heading-2 text-ink mb-10">Temel Özellikler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ title, body }) => (
              <div
                key={title}
                className="p-6 rounded-card border border-line bg-surface-muted flex flex-col gap-3"
              >
                <h3 className="heading-4 text-ink">{title}</h3>
                <p className="body-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8b. Mobil İşlem ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden section-padding bg-surface-inverse text-ink-inverse">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(50% 60% at 80% 30%, rgba(16,185,129,0.18) 0%, transparent 60%), radial-gradient(40% 40% at 10% 80%, rgba(16,185,129,0.10) 0%, transparent 60%)',
          }}
        />
        <div className="relative section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-8 rounded-[60px] blur-3xl opacity-50"
                  style={{
                    background:
                      'radial-gradient(closest-side, rgba(16,185,129,0.45), transparent 70%)',
                  }}
                />
                <div
                  className="relative w-[290px] sm:w-[310px] rounded-[48px] p-[3px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]"
                  style={{
                    background:
                      'linear-gradient(145deg, #2a2a2c 0%, #050505 30%, #1a1a1c 55%, #050505 80%, #2a2a2c 100%)',
                  }}
                >
                  <span className="absolute -left-[2px] top-[110px] w-[3px] h-8 rounded-l bg-neutral-700" />
                  <span className="absolute -left-[2px] top-[160px] w-[3px] h-14 rounded-l bg-neutral-700" />
                  <span className="absolute -left-[2px] top-[225px] w-[3px] h-14 rounded-l bg-neutral-700" />
                  <span className="absolute -right-[2px] top-[140px] w-[3px] h-20 rounded-r bg-neutral-700" />

                  <div className="relative w-full rounded-[45px] bg-black p-[6px]">
                    <div className="relative w-full rounded-[40px] overflow-hidden bg-white">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
                      <img
                        src="/mobile1.png"
                        alt="Brokz mobil webtrader — EUR/USD canlı grafik ve emir ekranı"
                        loading="lazy"
                        className="block w-full h-auto bg-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex absolute -right-4 top-10 items-center gap-2 px-3 py-2 rounded-full bg-white text-neutral-900 shadow-lg ring-1 ring-black/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold">iOS · Android · PWA</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <p className="section-label-light">Mobil İşlem</p>
              <h2 className="heading-2 text-white mt-4 mb-6 max-w-[20ch]">
                Aynı Platform, Şimdi Müşterinizin Cebinde
              </h2>
              <p className="body-lg text-neutral-300 max-w-2xl mb-8">
                Masaüstü terminalle aynı gerçek zamanlı motor üzerine kurulu, dokunmaya
                optimize edilmiş duyarlı bir mobil deneyim. Tek kod tabanı. Tek marka. Her
                emir, pozisyon ve tick için tek doğruluk kaynağı.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                {[
                  'SL & TP ile tek dokunuşla Al / Sat',
                  'Gerçek zamanlı grafik, watchlist, pozisyon',
                  'Emir ve uyarılar için push bildirimi',
                  'Biyometrik giriş ve güvenli oturum yönetimi',
                  'PWA olarak kurulabilir — app store gerekmez',
                  'Tüm uygulamada tam white-label marka',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-neutral-200">
                    <span className="mt-1 w-4 h-4 flex-shrink-0 text-brand-accent">
                      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M3 8.5L6.5 12L13 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Teknik Mimari ────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Mimari</p>
              <h2 className="heading-2 text-ink mb-6">Teknik Mimari</h2>
              <p className="body">
                Her bileşen kurumsal sınıf güvenilirlik, yatay ölçeklenebilirlik ve regülasyon
                denetlenebilirliği için seçildi. Stack cloud-agnostic ve seçtiğiniz altyapıya
                dağıtılabilir.
              </p>
            </div>
            <ol className="flex flex-col gap-5">
              {TECH_SPECS.map(({ label, value }, i) => (
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

      {/* ── 10. SSS ─────────────────────────────────────────────────────── */}
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

      {/* ── 11. CTA ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-inverse">
        <div className="section-container text-center">
          <p className="section-label-light mb-4">Başlayın</p>
          <h2 className="heading-2 text-white mb-5">
            Özel webtrader\'ınızı inşa etmeye hazır mısınız?
          </h2>
          <p className="body-lg text-neutral-300 max-w-xl mx-auto mb-10">
            Gereksinimlerinizle iletişime geçin. Bir iş günü içinde kapsamlı teklifle dönüş
            yaparız.
          </p>
          <a href="/tr/iletisim" className="btn-primary">
            Görüşme Başlat
          </a>
        </div>
      </section>
    </>
  );
}
