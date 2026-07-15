import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import nortyxLogo from "@/assets/nortyx-logo.png.asset.json";
import { supabase } from "@/lib/supabase-client";

/* ════════════════════════════════════════════════════════════════
   ⚠️  SENHA DO MODO DE EDIÇÃO — EDITE AQUI SE QUISER TROCAR  ⚠️
   ════════════════════════════════════════════════════════════════ */
const EDIT_PASSWORD = "147896325";

type BannerContent = {
  eyebrow: string;
  titleLines: string[];
  titleLastPrefix: string;
  titleLastEm: string;
  desc: string;
};

type SiteContent = {
  banner1: BannerContent;
  banner2: BannerContent;
  banner3: BannerContent;
};

const DEFAULT_CONTENT: SiteContent = {
  banner1: {
    eyebrow: "Consultoria Financeira",
    titleLines: ["Organização", "financeira para", "quem trabalha"],
    titleLastPrefix: "por ",
    titleLastEm: "conta própria.",
    desc: "Fluxo de caixa, DRE, planejamento e controle de inadimplência. Tudo o que o seu negócio precisa para crescer com previsibilidade — sem surpresas no fim do mês.",
  },
  banner2: {
    eyebrow: "Diagnóstico gratuito · 5 minutos",
    titleLines: ["Descubra a saúde", "financeira do seu"],
    titleLastPrefix: "",
    titleLastEm: "negócio agora.",
    desc: "Responda 20 perguntas rápidas e receba na hora seu score financeiro de 0 a 100, com análise de controle, inadimplência, planejamento e crescimento.",
  },
  banner3: {
    eyebrow: "App Nortyx · Gestão financeira",
    titleLines: ["Todo o seu financeiro"],
    titleLastPrefix: "em um único ",
    titleLastEm: "aplicativo.",
    desc: "Fluxo de caixa, DRE automático, contas a pagar e receber, cobranças e metas — direto do celular ou computador. Adquira somente o app, com implantação inclusa.",
  },
};

const WHATSAPP_BASE = "https://wa.me/5516991776593";
const WHATSAPP_HERO = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, quero uma consultoria financeira!")}`;
const WHATSAPP_NAV = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, vim pelo site da Nortyx!")}`;
const WHATSAPP_SEG = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, quero saber se a Nortyx atende meu setor!")}`;
const WHATSAPP_CUSTOM = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, tenho interesse em um App Personalizado!")}`;
const WHATSAPP_CTA = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, quero organizar as finanças do meu negócio!")}`;
const WHATSAPP_OK = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, acabei de preencher o formulário da Nortyx!")}`;

/* ════════════════════════════════════════════════════════════════
   ⚠️  VALORES EDITÁVEIS — PLANO "APP NORTYX"  ⚠️
   Edite apenas os valores entre aspas abaixo.
   ════════════════════════════════════════════════════════════════ */
const APP_PLAN = {
  setup: "R$ 1.500",   // ← Setup inicial (pagamento único) — EDITE AQUI
  mensal: "R$ 250",    // ← Mensalidade — EDITE AQUI
};
/* ════════════════════════════════════════════════════════════════ */

const DIAGNOSTICO_URL = "https://nortyxdiagnostico.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nortyx — Consultoria Financeira" },
      { name: "description", content: "Fluxo de caixa, DRE, planejamento e controle de inadimplência para profissionais autônomos e pequenas empresas." },
      { property: "og:title", content: "Nortyx — Consultoria Financeira" },
      { property: "og:description", content: "Organização financeira para quem trabalha por conta própria. Fluxo de caixa, DRE, planejamento e controle de inadimplência." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Nortyx",
          description: "Consultoria financeira para profissionais autônomos e pequenas empresas.",
          email: "Nortyx.group@gmail.com",
          telephone: "+5516991776593",
          founder: { "@type": "Person", name: "Estevão Defendi" },
        }),
      },
    ],
  }),
  component: LandingPage,
});

type ModalState = { open: boolean; planName: string; planPrice: string };

function LandingPage() {
  const [annual, setAnnual] = useState(false);
  const [navShadow, setNavShadow] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>({ open: false, planName: "Profissional", planPrice: "R$ 1.290/mês" });
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const editModeRef = useRef(false);
  useEffect(() => { editModeRef.current = editMode; }, [editMode]);
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // ── Carrossel do hero (3 banners) ──
  const [hcSlide, setHcSlide] = useState(0);
  const [hcPaused, setHcPaused] = useState(false);
  const HC_TOTAL = 3;
  const HC_INTERVALO_MS = 8000; // ← Tempo de cada banner (8s) — EDITE AQUI se quiser mais rápido/lento

  useEffect(() => {
    if (hcPaused) return;
    const t = setInterval(() => setHcSlide((s) => (s + 1) % HC_TOTAL), HC_INTERVALO_MS);
    return () => clearInterval(t);
  }, [hcPaused]);

  // ── Mini-diagnóstico interativo (banner 2) ──
  const [diagVal, setDiagVal] = useState(5);
  const diagFeedback =
    diagVal <= 3
      ? { icon: "🔴", txt: "Sinal de alerta: sem controle, o lucro escapa sem você perceber." }
      : diagVal <= 7
        ? { icon: "🟡", txt: "Você tem noção do caixa, mas ainda decide no escuro em parte do mês." }
        : { icon: "🟢", txt: "Ótimo ponto de partida! O diagnóstico mostra como ir além." };

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  function scrollToAppPlan() {
    document.getElementById("plano-app")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Scroll-reveal + nav shadow
  useEffect(() => {
    const onScroll = () => setNavShadow(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    const els = document.querySelectorAll(".rv");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("in"), i * 55);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    els.forEach((el) => obs.observe(el));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.ctrlKey && e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        if (editModeRef.current) {
          setEditMode(false);
        } else {
          tryEnableEditMode();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      obs.disconnect();
    };
  }, []);

  // Lock scroll while modal open
  useEffect(() => {
    document.body.style.overflow = modal.open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal.open]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", "homepage")
        .maybeSingle();
      if (!cancelled && !error && data?.content) {
        const saved = data.content as Partial<SiteContent>;
        setContent({
          banner1: { ...DEFAULT_CONTENT.banner1, ...saved.banner1 },
          banner2: { ...DEFAULT_CONTENT.banner2, ...saved.banner2 },
          banner3: { ...DEFAULT_CONTENT.banner3, ...saved.banner3 },
        });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function updateBannerField(banner: keyof SiteContent, field: keyof BannerContent, value: string | string[]) {
    setContent((c) => ({ ...c, [banner]: { ...c[banner], [field]: value } }));
  }

  async function saveContent() {
    setSaveStatus("saving");
    const { error } = await supabase
      .from("site_content")
      .upsert({ id: "homepage", content, updated_at: new Date().toISOString() });
    setSaveStatus(error ? "error" : "saved");
    if (!error) setTimeout(() => setSaveStatus("idle"), 2500);
  }

  function tryEnableEditMode() {
    const pwd = window.prompt("Senha para editar o site:");
    if (pwd === null) return;
    if (pwd === EDIT_PASSWORD) {
      setEditMode(true);
    } else {
      window.alert("Senha incorreta.");
    }
  }
  function openModal(planName: string, planPrice: string) {
    setSubmitted(false);
    setModal({ open: true, planName, planPrice });
  }
  function closeModal() {
    setModal((m) => ({ ...m, open: false }));
  }
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  function renderBannerHeader(key: keyof SiteContent) {
    const b = content[key];
    const editableStyle = editMode ? { outline: "1.5px dashed rgba(26,36,84,.35)", outlineOffset: 2, borderRadius: 3 } : undefined;
    return (
      <>
        <div
          className="hero-eyebrow"
          contentEditable={editMode}
          suppressContentEditableWarning
          style={editableStyle}
          onBlur={(e) => updateBannerField(key, "eyebrow", e.currentTarget.textContent || "")}
        >
          {b.eyebrow}
        </div>
        <h1>
          {b.titleLines.map((line, i) => (
            <span key={i}>
              <span
                contentEditable={editMode}
                suppressContentEditableWarning
                style={editableStyle}
                onBlur={(e) => {
                  const lines = [...b.titleLines];
                  lines[i] = e.currentTarget.textContent || "";
                  updateBannerField(key, "titleLines", lines);
                }}
              >
                {line}
              </span>
              <br />
            </span>
          ))}
          <span
            contentEditable={editMode}
            suppressContentEditableWarning
            style={editableStyle}
            onBlur={(e) => updateBannerField(key, "titleLastPrefix", e.currentTarget.textContent || "")}
          >
            {b.titleLastPrefix}
          </span>
          <em
            contentEditable={editMode}
            suppressContentEditableWarning
            style={editableStyle}
            onBlur={(e) => updateBannerField(key, "titleLastEm", e.currentTarget.textContent || "")}
          >
            {b.titleLastEm}
          </em>
        </h1>
        <p
          className="hero-desc"
          contentEditable={editMode}
          suppressContentEditableWarning
          style={editableStyle}
          onBlur={(e) => updateBannerField(key, "desc", e.currentTarget.textContent || "")}
        >
          {b.desc}
        </p>
      </>
    );
  }

  const plans = {
    essencial: { m: "R$ 790", a: "R$ 632" },
    pro: { m: "R$ 1.290", a: "R$ 1.032" },
  } as const;

  return (
    <div>
      {editMode && (
        <div style={{ position: "fixed", top: 12, right: 12, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, background: "#1a2454", color: "#fff", padding: "8px 10px 8px 16px", borderRadius: 999, fontSize: 13, fontFamily: "system-ui, sans-serif", boxShadow: "0 6px 20px rgba(0,0,0,.2)" }}>
          <span>✏️ Editando os 3 banners — Ctrl+Shift+E para sair</span>
          <button
            type="button"
            onClick={saveContent}
            disabled={saveStatus === "saving"}
            style={{
              background: saveStatus === "saved" ? "#16a34a" : "#fff",
              color: saveStatus === "saved" ? "#fff" : "#1a2454",
              border: "none", borderRadius: 999, padding: "6px 16px",
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {saveStatus === "saving" ? "Salvando…" : saveStatus === "saved" ? "Salvo ✓" : saveStatus === "error" ? "Erro, tentar de novo" : "Salvar"}
          </button>
        </div>
      )}
      {/* NAV */}
      <nav id="nav" style={{ boxShadow: navShadow ? "0 4px 20px rgba(10,10,10,.07)" : "none" }}>

        <div className="nav-brand">
          <a href="#" className="logo" aria-label="Nortyx">
            <img src={nortyxLogo.url} alt="Nortyx" style={{ height: 80, width: "auto", display: "block", objectFit: "contain" }} />
          </a>
          <ul className="nav-links">
            <li><a href="#servicos">Serviços</a></li>
            <li><a href="#paraquem">Para quem</a></li>
            <li><a href="#processo">Como funciona</a></li>
            <li><a href="#planos">Planos</a></li>
            <li><a href="#depoimentos">Clientes</a></li>
            <li><a href="#diagnostico">Diagnóstico</a></li>
          </ul>
        </div>
        <div className="nav-right">
          <a href="#planos" className="nav-ghost">Ver planos</a>
          <a href={WHATSAPP_NAV} target="_blank" rel="noreferrer" className="nav-solid">💬 Falar agora</a>
          <button
            type="button"
            className={`nav-burger ${mobileMenuOpen ? "open" : ""}`}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* MENU MOBILE */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <ul className="mobile-menu-links">
          <li><a href="#servicos" onClick={() => setMobileMenuOpen(false)}>Serviços</a></li>
          <li><a href="#paraquem" onClick={() => setMobileMenuOpen(false)}>Para quem</a></li>
          <li><a href="#processo" onClick={() => setMobileMenuOpen(false)}>Como funciona</a></li>
          <li><a href="#planos" onClick={() => setMobileMenuOpen(false)}>Planos</a></li>
          <li><a href="#depoimentos" onClick={() => setMobileMenuOpen(false)}>Clientes</a></li>
          <li><a href="#diagnostico" onClick={() => setMobileMenuOpen(false)}>Diagnóstico</a></li>
        </ul>
        <div className="mobile-menu-ctas">
          <a href="#planos" className="btn-secondary" onClick={() => setMobileMenuOpen(false)}>Ver planos →</a>
          <a href={WHATSAPP_NAV} target="_blank" rel="noreferrer" className="btn-primary" onClick={() => setMobileMenuOpen(false)}>💬 Falar agora</a>
        </div>
      </div>
      {mobileMenuOpen && <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} />}

      {/* HERO — CARROSSEL COM 3 BANNERS */}
      <div
        className="hero-carousel"
        onMouseEnter={() => setHcPaused(true)}
        onMouseLeave={() => setHcPaused(false)}
      >
        <div className="hc-track">

        {/* ── BANNER 1 · Consultoria (original, sem alterações) ── */}
        <section className={`hero hc-slide ${hcSlide === 0 ? "hc-active" : ""}`}>
        <div className="hero-left">
          {renderBannerHeader("banner1")}
          <div className="hero-ctas">
            <a href={WHATSAPP_HERO} target="_blank" rel="noreferrer" className="btn-primary">💬 Falar pelo WhatsApp</a>
            <a href="#planos" className="btn-secondary">Ver planos →</a>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <div className="trust-num">10+</div>
              <div className="trust-text">setores<br />atendidos</div>
            </div>
            <div style={{ width: 1, height: 36, background: "var(--lp-border)" }} />
            <div className="trust-item">
              <div className="trust-num">–60%</div>
              <div className="trust-text">redução de<br />inadimplência</div>
            </div>
            <div style={{ width: 1, height: 36, background: "var(--lp-border)" }} />
            <div className="trust-item">
              <div className="trust-num">30d</div>
              <div className="trust-text">resultado<br />visível</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div style={{ position: "relative" }}>
            <div className="float-chip fc1">
              <div className="fc-icon">📈</div>
              <div className="fc-label">Receita mensal</div>
              <div className="fc-val">+34% este mês</div>
            </div>
            <div className="float-chip fc2">
              <div className="fc-icon">✅</div>
              <div className="fc-label">Cobranças em dia</div>
              <div className="fc-val">87% dos clientes</div>
            </div>
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Painel Financeiro</span>
                <span className="panel-live">Ao vivo</span>
              </div>
              <div className="panel-metrics">
                <div className="metric-box">
                  <div className="metric-lbl">Receita</div>
                  <div className="metric-val">R$48k</div>
                  <div className="metric-sub">▲ 12% vs mês ant.</div>
                </div>
                <div className="metric-box">
                  <div className="metric-lbl">Inadimplência</div>
                  <div className="metric-val">3,2%</div>
                  <div className="metric-sub">▼ reduzida</div>
                </div>
              </div>
              <div className="panel-divider" />
              <div className="panel-rows">
                <div className="panel-row">
                  <div className="row-icon">📊</div>
                  <div className="row-label">DRE do mês</div>
                  <div className="row-val" style={{ color: "var(--green)" }}>Gerado</div>
                </div>
                <div className="panel-row">
                  <div className="row-icon">🎯</div>
                  <div className="row-label">Meta mensal</div>
                  <div className="row-val">94%</div>
                </div>
                <div className="panel-row">
                  <div className="row-icon">📅</div>
                  <div className="row-label">Próxima reunião</div>
                  <div className="row-val">Sex, 14h</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* ── BANNER 2 · Diagnóstico interativo ── */}
        <section className={`hero hero-diag hc-slide ${hcSlide === 1 ? "hc-active" : ""}`}>
          <div className="hero-left">
            {renderBannerHeader("banner2")}
            <div className="hero-ctas">
              <a href={DIAGNOSTICO_URL} target="_blank" rel="noreferrer" className="btn-primary">📊 Fazer diagnóstico gratuito</a>
              <a href="#diagnostico" className="btn-secondary">Saber mais →</a>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <div className="trust-num">20</div>
                <div className="trust-text">perguntas<br />rápidas</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--lp-border)" }} />
              <div className="trust-item">
                <div className="trust-num">5min</div>
                <div className="trust-text">resultado<br />imediato</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--lp-border)" }} />
              <div className="trust-item">
                <div className="trust-num">R$0</div>
                <div className="trust-text">100% gratuito<br />e confidencial</div>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="panel diag-mini">
              <div className="panel-header">
                <span className="panel-title">Teste rápido</span>
                <span className="panel-live">Interativo</span>
              </div>
              <div className="dm-q">
                De 0 a 10, quanto <strong>controle</strong> você tem hoje sobre o caixa do seu negócio?
              </div>
              <div className="dm-score-row">
                <div className="dm-score">{diagVal}</div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={diagVal}
                  onChange={(e) => setDiagVal(Number(e.target.value))}
                  className="dm-range"
                  aria-label="Nível de controle do caixa"
                />
              </div>
              <div className="dm-msg">
                <span>{diagFeedback.icon}</span> {diagFeedback.txt}
              </div>
              <a href={DIAGNOSTICO_URL} target="_blank" rel="noreferrer" className="diag-cta">
                Fazer o diagnóstico completo →
              </a>
              <div className="diag-note">Score financeiro completo · Sem cadastro de cartão</div>
            </div>
          </div>
        </section>

        {/* ── BANNER 3 · App Nortyx ── */}
        <section className={`hero hero-app hc-slide ${hcSlide === 2 ? "hc-active" : ""}`}>
          <div className="hero-left">
            {renderBannerHeader("banner3")}
            <div className="hero-ctas">
              <button type="button" onClick={scrollToAppPlan} className="btn-primary">
                💻 Quero o App Nortyx →
              </button>
              <a href="#planos" className="btn-secondary">Ver todos os planos</a>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <div className="trust-num">{APP_PLAN.mensal}</div>
                <div className="trust-text">por mês<br />+ setup inicial</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--lp-border)" }} />
              <div className="trust-item">
                <div className="trust-num">PWA</div>
                <div className="trust-text">instale no<br />seu celular</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--lp-border)" }} />
              <div className="trust-item">
                <div className="trust-num">24h</div>
                <div className="trust-text">seus dados<br />sempre à mão</div>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div style={{ position: "relative" }}>
              <div className="float-chip fc1">
                <div className="fc-icon">🔔</div>
                <div className="fc-label">Cobrança automática</div>
                <div className="fc-val">3 boletos enviados</div>
              </div>
              <div className="float-chip fc2">
                <div className="fc-icon">📱</div>
                <div className="fc-label">Disponível em</div>
                <div className="fc-val">Celular e computador</div>
              </div>
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">App Nortyx</span>
                  <span className="panel-live">Ao vivo</span>
                </div>
                <div className="panel-metrics">
                  <div className="metric-box">
                    <div className="metric-lbl">Saldo em caixa</div>
                    <div className="metric-val">R$32k</div>
                    <div className="metric-sub">▲ atualizado agora</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-lbl">A receber</div>
                    <div className="metric-val">R$18k</div>
                    <div className="metric-sub">▲ 12 clientes</div>
                  </div>
                </div>
                <div className="panel-divider" />
                <div className="panel-rows">
                  <div className="panel-row">
                    <div className="row-icon">📊</div>
                    <div className="row-label">DRE automático</div>
                    <div className="row-val" style={{ color: "var(--green)" }}>Gerado</div>
                  </div>
                  <div className="panel-row">
                    <div className="row-icon">💳</div>
                    <div className="row-label">Contas a pagar</div>
                    <div className="row-val">Em dia</div>
                  </div>
                  <div className="panel-row">
                    <div className="row-icon">🎯</div>
                    <div className="row-label">Meta do mês</div>
                    <div className="row-val">88%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        </div>

        {/* Controles do carrossel */}
        <button
          type="button"
          className="hc-arrow hc-prev"
          aria-label="Banner anterior"
          onClick={() => setHcSlide((s) => (s - 1 + HC_TOTAL) % HC_TOTAL)}
        >
          ‹
        </button>
        <button
          type="button"
          className="hc-arrow hc-next"
          aria-label="Próximo banner"
          onClick={() => setHcSlide((s) => (s + 1) % HC_TOTAL)}
        >
          ›
        </button>
        <div className="hc-dots">
          {["Consultoria", "Diagnóstico", "App Nortyx"].map((label, i) => (
            <button
              key={label}
              type="button"
              className={`hc-dot ${hcSlide === i ? "on" : ""}`}
              aria-label={`Ir para banner: ${label}`}
              onClick={() => setHcSlide(i)}
            >
              <span className="hc-dot-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* NÚMEROS */}
      <div className="numbers">
        <div className="numbers-inner">
          <div className="num-item rv"><div className="num-val">10<em>+</em></div><div className="num-label">Setores<br />atendidos</div></div>
          <div className="num-item rv"><div className="num-val">–60<em>%</em></div><div className="num-label">Redução de<br />inadimplência</div></div>
          <div className="num-item rv"><div className="num-val">30<em>d</em></div><div className="num-label">Primeiros<br />resultados</div></div>
          <div className="num-item rv"><div className="num-val">100<em>%</em></div><div className="num-label">Sob medida para<br />o seu negócio</div></div>
        </div>
      </div>

      {/* SERVIÇOS */}
      <section id="servicos" className="svc-bg">
        <div className="section-inner">
          <div className="svc-layout">
            <div>
              <div className="s-tag rv">O que entregamos</div>
              <h2 className="s-title rv">Consultoria<br />financeira<br /><em>completa.</em></h2>
              <p className="s-sub rv" style={{ marginTop: 0 }}>
                Cada entrega é pensada para dar a você clareza total sobre o dinheiro do seu negócio — e um caminho concreto para crescer.
              </p>
            </div>
            <div className="svc-grid">
              {[
                { n: "01", name: "Diagnóstico Financeiro", desc: "Análise completa da situação atual: onde entra, onde sai, o que sobra. Identificamos os gargalos que estão travando o crescimento do seu negócio.", tags: ["Diagnóstico", "Análise"] },
                { n: "02", name: "Fluxo de Caixa", desc: "Controle detalhado de todas as entradas e saídas. Você passa a saber exatamente quanto vai sobrar — antes do mês acabar.", tags: ["Fluxo de caixa", "Projeções"] },
                { n: "03", name: "DRE Simplificado", desc: "Demonstrativo de resultados mensal em linguagem clara — sem jargão contábil. Você entende o que lucrou e por quê.", tags: ["DRE", "Relatórios"] },
                { n: "04", name: "Planejamento Financeiro", desc: "Metas claras, orçamento estruturado e plano de ação para os próximos meses. Crescimento com previsibilidade e propósito.", tags: ["Metas", "Orçamento"] },
                { n: "05", name: "Controle de Inadimplência", desc: "Mapeamento de clientes em atraso, estratégias de cobrança e processos para reduzir a inadimplência e aumentar a previsibilidade da receita.", tags: ["Recebíveis", "Cobrança"] },
                { n: "06", name: "Reuniões Mensais", desc: "Acompanhamento dedicado com Estevão: revisão dos resultados, ajuste de metas e alinhamento estratégico para o próximo período.", tags: ["Mentoria", "Acompanhamento"] },
              ].map((s) => (
                <div key={s.n} className="svc-card rv">
                  <div className="svc-num">{s.n}</div>
                  <div className="svc-name">{s.name}</div>
                  <div className="svc-desc">{s.desc}</div>
                  <div className="svc-tags">
                    {s.tags.map((t) => <span key={t} className="svc-tag">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PARA QUEM */}
      <section id="paraquem" className="paraquem-bg">
        <div className="section-inner">
          <div className="paraquem-layout">
            <div>
              <div className="s-tag rv">Para quem é</div>
              <h2 className="s-title rv">Para quem trabalha<br />duro e merece<br /><em>ver resultado.</em></h2>
            </div>
            <p className="s-sub rv">
              Se você fatura bem mas o dinheiro some no fim do mês — a Nortyx é para você. Atendemos profissionais autônomos, PJs e pequenas empresas de qualquer setor.
            </p>
          </div>
          <div className="paraquem-grid">
            <div className="pq-card featured rv">
              <span className="pq-icon">⚖️</span>
              <div className="pq-name">Advogados</div>
              <div className="pq-desc">Controle de honorários, gestão de recebíveis e planejamento financeiro para escritórios de qualquer porte.</div>
              <div className="pq-features">
                <div className="pq-feat">Controle de honorários</div>
                <div className="pq-feat">Redução de inadimplência</div>
                <div className="pq-feat">DRE mensal</div>
              </div>
            </div>
            <div className="pq-card featured rv">
              <span className="pq-icon">🩺</span>
              <div className="pq-name">Médicos e Clínicas</div>
              <div className="pq-desc">Equilibrio financeiro, controle de recebíveis e visibilidade total do caixa para profissionais de saúde.</div>
              <div className="pq-features">
                <div className="pq-feat">Fluxo de caixa</div>
                <div className="pq-feat">Controle de pacientes</div>
                <div className="pq-feat">Planejamento de expansão</div>
              </div>
            </div>
            <div className="pq-card featured rv">
              <span className="pq-icon">📣</span>
              <div className="pq-name">Agências</div>
              <div className="pq-desc">Gestão financeira da agência, controle por cliente e previsibilidade para escalar com saúde.</div>
              <div className="pq-features">
                <div className="pq-feat">Receita por cliente</div>
                <div className="pq-feat">Fluxo de caixa</div>
                <div className="pq-feat">Metas de crescimento</div>
              </div>
            </div>
            {[
              { icon: "🦷", name: "Dentistas", desc: "Controle de parcelas de tratamentos e gestão financeira para clínicas odontológicas." },
              { icon: "🔧", name: "Prestadores de Serviço", desc: "Contadores, arquitetos, consultores e qualquer PJ que quer clareza financeira." },
              { icon: "🏋️", name: "Academias e Estúdios", desc: "Controle de mensalidades, custos e planejamento para negócios do setor fitness." },
              { icon: "🏫", name: "Escolas e Cursos", desc: "Gestão de mensalidades, inadimplência e fluxo de caixa para o setor educacional." },
              { icon: "💆", name: "Estética e Bem-estar", desc: "Controle financeiro para clínicas de estética, salões e profissionais de bem-estar." },
            ].map((c) => (
              <div key={c.name} className="pq-card rv">
                <span className="pq-icon">{c.icon}</span>
                <div className="pq-name">{c.name}</div>
                <div className="pq-desc">{c.desc}</div>
              </div>
            ))}
            <div className="pq-more rv">
              <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>+</div>
              <div className="pq-more-text">Qualquer PJ ou<br />pequena empresa</div>
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: ".82rem", color: "var(--lp-muted)", marginTop: 24 }} className="rv">
            Não encontrou o seu segmento?{" "}
            <a href={WHATSAPP_SEG} target="_blank" rel="noreferrer" style={{ color: "var(--navy)", fontWeight: 500 }}>
              Fale com Estevão.
            </a>
          </p>
        </div>
      </section>

      {/* PROCESSO */}
      <section id="processo" className="processo-bg">
        <div className="section-inner">
          <div className="processo-layout">
            <div>
              <div className="s-tag rv">Como funciona</div>
              <h2 className="s-title rv">Do diagnóstico<br />ao resultado<br /><em>em 4 etapas.</em></h2>
            </div>
            <p className="s-sub rv">
              Processo claro, sem burocracia. Você sabe exatamente o que acontece em cada etapa e quando vai ver os primeiros resultados.
            </p>
          </div>
          <div className="steps">
            {[
              { n: "01", name: "Diagnóstico", desc: "Reunião inicial para mapear a situação financeira atual, identificar gargalos e entender os objetivos do negócio." },
              { n: "02", name: "Plano", desc: "Apresentação do plano de ação personalizado com prioridades, metas e o que será feito em cada mês." },
              { n: "03", name: "Execução", desc: "Implementação do controle financeiro, organização do fluxo de caixa e entrega dos relatórios mensais." },
              { n: "04", name: "Acompanhamento", desc: "Reunião mensal para revisar resultados, ajustar metas e garantir que o negócio está no caminho certo." },
            ].map((s) => (
              <div key={s.n} className="step rv">
                <div className="step-num">{s.n}</div>
                <div className="step-name">{s.name}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="planos-bg">
        <div className="section-inner">
          <div className="plans-head">
            <div>
              <div className="s-tag rv">Planos e preços</div>
              <h2 className="s-title rv">Invista na saúde<br />financeira do<br /><em>seu negócio.</em></h2>
            </div>
            <div>
              <p className="s-sub rv">
                Sem contratos longos, sem surpresas. Escolha o plano, preencha o formulário e entraremos em contato em até 24h.
              </p>
              <div className="billing-toggle rv">
                <span className={`tgl-lbl ${!annual ? "on" : ""}`}>Mensal</span>
                <label className="tgl">
                  <input type="checkbox" checked={annual} onChange={(e) => setAnnual(e.target.checked)} />
                  <div className="tgl-track" />
                  <div className="tgl-thumb" />
                </label>
                <span className={`tgl-lbl ${annual ? "on" : ""}`}>
                  Anual <span className="annual-badge">–20%</span>
                </span>
              </div>
            </div>
          </div>
          <div className="plans-grid">
            {/* Essencial */}
            <div className="plan rv">
              <div className="plan-name">Essencial</div>
              <div className="plan-tagline">Para organizar o financeiro e ter clareza do caixa.</div>
              <div className="plan-price">{annual ? plans.essencial.a : plans.essencial.m}</div>
              <div className="plan-period">{annual ? "/mês · cobrado anualmente" : "/mês · sem fidelidade"}</div>
              {annual && <div className="plan-annual" style={{ display: "block" }}>Equivale a R$ 7.584/ano · economia de R$ 1.896</div>}
              <div className="plan-sep" />
              <div className="plan-feats">
                <div className="plan-feat"><span className="feat-ok">✓</span>Diagnóstico financeiro inicial</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Controle de fluxo de caixa</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>DRE mensal simplificado</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Relatório mensal em PDF</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>1 reunião mensal (60 min)</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Suporte via WhatsApp</div>
                <div className="plan-feat"><span className="feat-no">✗</span><span style={{ color: "var(--lp-muted)" }}>Planejamento anual</span></div>
                <div className="plan-feat"><span className="feat-no">✗</span><span style={{ color: "var(--lp-muted)" }}>Análise de precificação</span></div>
              </div>
              <button
                type="button"
                className="plan-btn plan-btn-out"
                onClick={() => openModal("Essencial", `${annual ? plans.essencial.a : plans.essencial.m}/mês`)}
              >
                Contratar agora
              </button>
            </div>

            {/* Profissional */}
            <div className="plan hot rv">
              <div className="plan-badge">MAIS POPULAR</div>
              <div className="plan-name">Profissional</div>
              <div className="plan-tagline">Para crescer com estratégia e controle real.</div>
              <div className="plan-price">{annual ? plans.pro.a : plans.pro.m}</div>
              <div className="plan-period">{annual ? "/mês · cobrado anualmente" : "/mês · sem fidelidade"}</div>
              {annual && (
                <div className="plan-annual" style={{ display: "block", color: "rgba(34,197,94,.8)" }}>
                  Equivale a R$ 12.384/ano · economia de R$ 3.096
                </div>
              )}
              <div className="plan-sep" />
              <div className="plan-feats">
                <div className="plan-feat"><span className="feat-ok">✓</span>Tudo do Essencial</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Planejamento financeiro anual</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Análise de precificação</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Controle de inadimplência</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>2 reuniões mensais (60 min cada)</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Metas e OKRs financeiros</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Suporte prioritário</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Dashboard financeiro compartilhado</div>
              </div>
              <button
                type="button"
                className="plan-btn plan-btn-fill"
                onClick={() => openModal("Profissional", `${annual ? plans.pro.a : plans.pro.m}/mês`)}
              >
                Contratar agora
              </button>
            </div>

            {/* App Nortyx */}
            <div className="plan app-plan rv" id="plano-app">
              <div className="plan-badge app-plan-badge">SOMENTE O APP</div>
              <div className="plan-name">App Nortyx</div>
              <div className="plan-tagline">O aplicativo de gestão financeira da Nortyx — sem consultoria.</div>
              <div className="plan-price">{APP_PLAN.mensal}</div>
              <div className="plan-period">/mês · + setup inicial de {APP_PLAN.setup}</div>
              <div className="plan-sep" />
              <div className="plan-feats">
                <div className="plan-feat"><span className="feat-ok">✓</span>Fluxo de caixa completo</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>DRE automático</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Contas a pagar e receber</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Controle de inadimplência e cobranças</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Metas e relatórios gerenciais</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Acesso no celular e no computador (PWA)</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Implantação e treinamento inclusos no setup</div>
              </div>
              <button
                type="button"
                className="plan-btn plan-btn-fill app-plan-btn"
                onClick={() => openModal("App Nortyx", `${APP_PLAN.setup} de setup + ${APP_PLAN.mensal}/mês`)}
              >
                Adquirir o App →
              </button>
            </div>

            {/* App Personalizado */}
            <div className="plan rv">
              <div className="plan-name">App Personalizado</div>
              <div className="plan-tagline">Um aplicativo próprio, feito sob medida para a sua operação.</div>
              <div className="plan-price">Consulta</div>
              <div className="plan-period">Fale com Estevão para um orçamento</div>
              <div className="plan-sep" />
              <div className="plan-feats">
                <div className="plan-feat"><span className="feat-ok">✓</span>Levantamento completo do seu processo</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Desenvolvimento 100% sob medida</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Telas e fluxos exclusivos para o seu negócio</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Integração com sistemas que você já usa</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Treinamento da sua equipe</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Suporte e manutenção contínua</div>
                <div className="plan-feat"><span className="feat-ok">✓</span>Evolui junto com o seu negócio</div>
              </div>
              <a href={WHATSAPP_CUSTOM} target="_blank" rel="noreferrer" className="plan-btn plan-btn-out">
                Falar com Estevão
              </a>
            </div>
          </div>
          <p className="plans-note rv">💳 PIX · Boleto · Cartão em até 12x &nbsp;·&nbsp; Sem fidelidade &nbsp;·&nbsp; Cancele quando quiser</p>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="dep-bg">
        <div className="section-inner">
          <div className="dep-layout">
            <div>
              <div className="s-tag rv">Clientes</div>
              <h2 className="s-title rv">Resultados que<br /><em>falam por si.</em></h2>
            </div>
            <p className="s-sub rv">
              Profissionais e pequenas empresas que transformaram suas finanças com a Nortyx.
            </p>
          </div>
          <div className="dep-grid">
            {[
              { initials: "DR", name: "Dr. Rafael M.", role: "Advogado — SP", text: "Eu faturava bem mas nunca sobrava dinheiro. A Nortyx organizou todo o meu fluxo de caixa e em 2 meses eu já tinha clareza total sobre o que acontecia com o meu dinheiro." },
              { initials: "DM", name: "Dra. Marina S.", role: "Médica — Clínica Particular", text: "A consultoria mensal com o Estevão mudou como eu vejo o financeiro da clínica. Hoje tenho DRE, fluxo de caixa e metas claras. Nunca tive tanto controle assim." },
              { initials: "CA", name: "Carlos A.", role: "CEO — Agência de Marketing", text: "Minha agência crescia mas eu não sabia se estava lucrando de verdade. O Estevão montou o planejamento financeiro e hoje tomo decisões com base em números reais." },
            ].map((d) => (
              <div key={d.initials} className="dep rv">
                <div className="dep-quote">"</div>
                <p className="dep-text">{d.text}</p>
                <div className="dep-author">
                  <div className="dep-avatar">{d.initials}</div>
                  <div>
                    <div className="dep-stars">★★★★★</div>
                    <div className="dep-name">{d.name}</div>
                    <div className="dep-role">{d.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIAGNÓSTICO */}
      <section id="diagnostico" className="diag-bg" style={{ padding: 0 }}>
        <div className="diag-inner">
          <div className="diag-left">
            <div className="s-tag rv">Diagnóstico gratuito</div>
            <h2 className="s-title rv">Descubra a saúde<br />financeira do seu<br /><em>negócio agora.</em></h2>
            <p className="s-sub rv">
              Responda 20 perguntas em menos de 5 minutos e receba um diagnóstico personalizado com seu score financeiro e o plano ideal para você.
            </p>
            <div className="diag-steps rv">
              <div className="diag-step">
                <div className="diag-step-num">01</div>
                <div className="diag-step-text"><strong>Responda o questionário</strong>20 perguntas sobre finanças, controle e planejamento do seu negócio.</div>
              </div>
              <div className="diag-step">
                <div className="diag-step-num">02</div>
                <div className="diag-step-text"><strong>Receba seu score</strong>Resultado imediato com análise das 4 áreas financeiras do seu negócio.</div>
              </div>
              <div className="diag-step">
                <div className="diag-step-num">03</div>
                <div className="diag-step-text"><strong>Plano recomendado</strong>Com base no seu score, a Nortyx indica o melhor caminho para você.</div>
              </div>
            </div>
          </div>
          <div className="rv">
            <div className="diag-card">
              <div className="diag-card-tag">📊 Diagnóstico Financeiro — Nortyx</div>
              <div className="diag-card-title">Teste gratuito<br />em 5 minutos</div>
              <div className="diag-card-desc">
                Descubra onde estão os gargalos financeiros do seu negócio e o que fazer para resolvê-los.
              </div>
              <div className="diag-features">
                <div className="diag-feature"><div className="diag-feature-icon">✓</div>Score financeiro de 0 a 100</div>
                <div className="diag-feature"><div className="diag-feature-icon">✓</div>Análise em 4 áreas: controle, inadimplência, planejamento e crescimento</div>
                <div className="diag-feature"><div className="diag-feature-icon">✓</div>Recomendações personalizadas para o seu negócio</div>
                <div className="diag-feature"><div className="diag-feature-icon">✓</div>100% gratuito e confidencial</div>
              </div>
              <a href="https://nortyxdiagnostico.lovable.app" target="_blank" rel="noreferrer" className="diag-cta">
                Fazer diagnóstico gratuito →
              </a>
              <div className="diag-note">Leva menos de 5 minutos · Resultado imediato</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <div className="cta-final">
        <h2 className="s-title rv">Chega de não saber<br />o que sobra no<br /><em>fim do mês.</em></h2>
        <p className="s-sub rv">
          Agende uma conversa gratuita com Estevão e descubra como a Nortyx pode organizar as finanças do seu negócio.
        </p>
        <div className="cta-btns rv">
          <a href={WHATSAPP_CTA} target="_blank" rel="noreferrer" className="cta-white">💬 Falar pelo WhatsApp</a>
          <a href="mailto:Nortyx.group@gmail.com" className="cta-ghost-w">✉️ Enviar e-mail</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <a href="#" className="footer-logo">nortyx<span>.</span></a>
              <p className="footer-tagline">
                Consultoria financeira para profissionais autônomos e pequenas empresas.
              </p>
            </div>
            <div>
              <div className="footer-col-title">Navegação</div>
              <div className="footer-links">
                <a href="#servicos">Serviços</a>
                <a href="#paraquem">Para quem</a>
                <a href="#processo">Como funciona</a>
                <a href="#planos">Planos</a>
                <a href="#depoimentos">Clientes</a>
                <a href="#diagnostico">Diagnóstico</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Planos</div>
              <div className="footer-links">
                <a href="#planos" onClick={(e) => { e.preventDefault(); openModal("Essencial", `${annual ? plans.essencial.a : plans.essencial.m}/mês`); }}>Essencial</a>
                <a href="#planos" onClick={(e) => { e.preventDefault(); openModal("Profissional", `${annual ? plans.pro.a : plans.pro.m}/mês`); }}>Profissional</a>
                <a href="#plano-app" onClick={(e) => { e.preventDefault(); openModal("App Nortyx", `${APP_PLAN.setup} de setup + ${APP_PLAN.mensal}/mês`); }}>App Nortyx</a>
                <a href={WHATSAPP_CUSTOM} target="_blank" rel="noreferrer">App Personalizado</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Contato</div>
              <div className="footer-contact">
                <a href="mailto:Nortyx.group@gmail.com">Nortyx.group@gmail.com</a>
                <a href="tel:+5516991776593">(16) 99177-6593</a>
                <a href={WHATSAPP_BASE} target="_blank" rel="noreferrer" className="footer-wa">💬 WhatsApp direto</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2025 Nortyx. Todos os direitos reservados.</div>
            <div className="footer-by">by Estevão Defendi</div>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      <div
        className={`modal-ov ${modal.open ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal-box">
          <button className="modal-x" type="button" onClick={closeModal} aria-label="Fechar">×</button>
          {!submitted ? (
            <div>
              <div className="modal-h">Contratar consultoria</div>
              <div className="modal-sub">
                Preencha seus dados e o Estevão entrará em contato em até 24h.
              </div>
              <div className="modal-plan-badge">
                <span>{modal.planName}</span>
                <span>·</span>
                <span>{modal.planPrice}</span>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="fr2">
                  <div className="fg">
                    <label className="fl">Nome completo</label>
                    <input className="fi" type="text" placeholder="Seu nome" required />
                  </div>
                  <div className="fg">
                    <label className="fl">WhatsApp</label>
                    <input className="fi" type="tel" placeholder="(16) 99999-9999" required />
                  </div>
                </div>
                <div className="fg">
                  <label className="fl">E-mail</label>
                  <input className="fi" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="fr2">
                  <div className="fg">
                    <label className="fl">Setor / profissão</label>
                    <select className="fs" required defaultValue="">
                      <option value="" disabled>Selecione...</option>
                      <option>Advogado / Escritório</option>
                      <option>Médico / Clínica</option>
                      <option>Dentista</option>
                      <option>Agência de Marketing</option>
                      <option>Academia / Estúdio</option>
                      <option>Escola / Curso</option>
                      <option>Estética / Bem-estar</option>
                      <option>Prestador de Serviços</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label className="fl">Faturamento mensal</label>
                    <select className="fs" defaultValue="">
                      <option value="" disabled>Selecione...</option>
                      <option>Até R$ 10k</option>
                      <option>R$ 10k – R$ 30k</option>
                      <option>R$ 30k – R$ 80k</option>
                      <option>Acima de R$ 80k</option>
                    </select>
                  </div>
                </div>
                <div className="fg">
                  <label className="fl">Qual é o seu maior desafio financeiro hoje?</label>
                  <input className="fi" type="text" placeholder="Ex: não sei quanto sobra no fim do mês" />
                </div>
                <button type="submit" className="fsub">Quero organizar minhas finanças →</button>
                <p className="fnote">🔒 Seus dados são confidenciais. Sem spam.</p>
              </form>
            </div>
          ) : (
            <div className="modal-ok" style={{ display: "block" }}>
              <div className="modal-ok-ico">🎉</div>
              <div className="modal-ok-h">Recebemos seu pedido!</div>
              <p className="modal-ok-p">
                Estevão vai entrar em contato pelo WhatsApp em até 24h para dar início à sua consultoria financeira.
              </p>
              <a href={WHATSAPP_OK} target="_blank" rel="noreferrer" className="modal-ok-btn">
                💬 Falar agora no WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
