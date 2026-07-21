import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
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

type CardText = { name: string; desc: string };
type Testimonial = { text: string; name: string; role: string };
type DiagCard = { tag: string; titleLines: string[]; desc: string; note: string };
type PlanText = {
  name: string;
  tagline: string;
  features: string[];
  monthly?: string;
  annual?: string;
  setup?: string;
  priceText?: string;
  periodText?: string;
};

type SiteContent = {
  banner1: BannerContent;
  banner2: BannerContent;
  banner3: BannerContent;
  banner4: BannerContent;
  headings: {
    servicos: BannerContent;
    paraquem: BannerContent;
    processo: BannerContent;
    planos: BannerContent;
    depoimentos: BannerContent;
    diagnostico: BannerContent;
    ctaFinal: BannerContent;
  };
  services: CardText[];
  paraquemCards: CardText[];
  steps: CardText[];
  testimonials: Testimonial[];
  diagCard: DiagCard;
  plans: {
    essencial: PlanText;
    profissional: PlanText;
    appNortyx: PlanText;
    appPersonalizado: PlanText;
  };
  footerTagline: string;
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
  banner4: {
    eyebrow: "App Personalizado · Sob medida",
    titleLines: ["Um aplicativo feito", "só para o seu"],
    titleLastPrefix: "",
    titleLastEm: "negócio.",
    desc: "Nada de solução genérica. Desenvolvemos um app próprio, com telas e fluxos pensados exatamente para a forma como você trabalha.",
  },
  headings: {
    servicos: { eyebrow: "O que entregamos", titleLines: ["Consultoria", "financeira"], titleLastPrefix: "", titleLastEm: "completa.", desc: "Cada entrega é pensada para dar a você clareza total sobre o dinheiro do seu negócio — e um caminho concreto para crescer." },
    paraquem: { eyebrow: "Para quem é", titleLines: ["Para quem trabalha", "duro e merece"], titleLastPrefix: "", titleLastEm: "ver resultado.", desc: "Se você fatura bem mas o dinheiro some no fim do mês — a Nortyx é para você. Atendemos profissionais autônomos, PJs e pequenas empresas de qualquer setor." },
    processo: { eyebrow: "Como funciona", titleLines: ["Do diagnóstico", "ao resultado"], titleLastPrefix: "", titleLastEm: "em 4 etapas.", desc: "Processo claro, sem burocracia. Você sabe exatamente o que acontece em cada etapa e quando vai ver os primeiros resultados." },
    planos: { eyebrow: "Planos e preços", titleLines: ["Invista na saúde", "financeira do"], titleLastPrefix: "", titleLastEm: "seu negócio.", desc: "Sem contratos longos, sem surpresas. Escolha o plano, preencha o formulário e entraremos em contato em até 24h." },
    depoimentos: { eyebrow: "Clientes", titleLines: ["Resultados que"], titleLastPrefix: "", titleLastEm: "falam por si.", desc: "Profissionais e pequenas empresas que transformaram suas finanças com a Nortyx." },
    diagnostico: { eyebrow: "Diagnóstico gratuito", titleLines: ["Descubra a saúde", "financeira do seu"], titleLastPrefix: "", titleLastEm: "negócio agora.", desc: "Responda 20 perguntas em menos de 5 minutos e receba um diagnóstico personalizado com seu score financeiro e o plano ideal para você." },
    ctaFinal: { eyebrow: "", titleLines: ["Chega de não saber", "o que sobra no"], titleLastPrefix: "", titleLastEm: "fim do mês.", desc: "Agende uma conversa gratuita com Estevão e descubra como a Nortyx pode organizar as finanças do seu negócio." },
  },
  services: [
    { name: "Diagnóstico Financeiro", desc: "Análise completa da situação atual: onde entra, onde sai, o que sobra. Identificamos os gargalos que estão travando o crescimento do seu negócio." },
    { name: "Fluxo de Caixa", desc: "Controle detalhado de todas as entradas e saídas. Você passa a saber exatamente quanto vai sobrar — antes do mês acabar." },
    { name: "DRE Simplificado", desc: "Demonstrativo de resultados mensal em linguagem clara — sem jargão contábil. Você entende o que lucrou e por quê." },
    { name: "Planejamento Financeiro", desc: "Metas claras, orçamento estruturado e plano de ação para os próximos meses. Crescimento com previsibilidade e propósito." },
    { name: "Controle de Inadimplência", desc: "Mapeamento de clientes em atraso, estratégias de cobrança e processos para reduzir a inadimplência e aumentar a previsibilidade da receita." },
    { name: "Reuniões Mensais", desc: "Acompanhamento dedicado com Estevão: revisão dos resultados, ajuste de metas e alinhamento estratégico para o próximo período." },
  ],
  paraquemCards: [
    { name: "Advogados", desc: "Controle de honorários, gestão de recebíveis e planejamento financeiro para escritórios de qualquer porte." },
    { name: "Médicos e Clínicas", desc: "Equilibrio financeiro, controle de recebíveis e visibilidade total do caixa para profissionais de saúde." },
    { name: "Agências", desc: "Gestão financeira da agência, controle por cliente e previsibilidade para escalar com saúde." },
    { name: "Dentistas", desc: "Controle de parcelas de tratamentos e gestão financeira para clínicas odontológicas." },
    { name: "Prestadores de Serviço", desc: "Contadores, arquitetos, consultores e qualquer PJ que quer clareza financeira." },
    { name: "Academias e Estúdios", desc: "Controle de mensalidades, custos e planejamento para negócios do setor fitness." },
    { name: "Escolas e Cursos", desc: "Gestão de mensalidades, inadimplência e fluxo de caixa para o setor educacional." },
    { name: "Estética e Bem-estar", desc: "Controle financeiro para clínicas de estética, salões e profissionais de bem-estar." },
  ],
  steps: [
    { name: "Diagnóstico", desc: "Reunião inicial para mapear a situação financeira atual, identificar gargalos e entender os objetivos do negócio." },
    { name: "Plano", desc: "Apresentação do plano de ação personalizado com prioridades, metas e o que será feito em cada mês." },
    { name: "Execução", desc: "Implementação do controle financeiro, organização do fluxo de caixa e entrega dos relatórios mensais." },
    { name: "Acompanhamento", desc: "Reunião mensal para revisar resultados, ajustar metas e garantir que o negócio está no caminho certo." },
  ],
  testimonials: [
    { text: "Eu faturava bem mas nunca sobrava dinheiro. A Nortyx organizou todo o meu fluxo de caixa e em 2 meses eu já tinha clareza total sobre o que acontecia com o meu dinheiro.", name: "Dr. Rafael M.", role: "Advogado — SP" },
    { text: "A consultoria mensal com o Estevão mudou como eu vejo o financeiro da clínica. Hoje tenho DRE, fluxo de caixa e metas claras. Nunca tive tanto controle assim.", name: "Dra. Marina S.", role: "Médica — Clínica Particular" },
    { text: "Minha agência crescia mas eu não sabia se estava lucrando de verdade. O Estevão montou o planejamento financeiro e hoje tomo decisões com base em números reais.", name: "Carlos A.", role: "CEO — Agência de Marketing" },
  ],
  diagCard: {
    tag: "📊 Diagnóstico Financeiro — Nortyx",
    titleLines: ["Teste gratuito", "em 5 minutos"],
    desc: "Descubra onde estão os gargalos financeiros do seu negócio e o que fazer para resolvê-los.",
    note: "Leva menos de 5 minutos · Resultado imediato",
  },
  plans: {
    essencial: {
      name: "Essencial",
      tagline: "Para organizar o financeiro e ter clareza do caixa.",
      monthly: "R$ 790",
      annual: "R$ 632",
      features: ["Diagnóstico financeiro inicial", "Controle de fluxo de caixa", "DRE mensal simplificado", "Relatório mensal em PDF", "1 reunião mensal (60 min)", "Suporte via WhatsApp"],
    },
    profissional: {
      name: "Profissional",
      tagline: "Para crescer com estratégia e controle real.",
      monthly: "R$ 1.290",
      annual: "R$ 1.032",
      features: ["Tudo do Essencial", "Planejamento financeiro anual", "Análise de precificação", "Controle de inadimplência", "2 reuniões mensais (60 min cada)", "Metas e OKRs financeiros", "Suporte prioritário", "Dashboard financeiro compartilhado"],
    },
    appNortyx: {
      name: "App Nortyx",
      tagline: "O aplicativo de gestão financeira da Nortyx — sem consultoria.",
      monthly: "R$ 250",
      setup: "R$ 1.500",
      features: ["Fluxo de caixa completo", "DRE automático", "Contas a pagar e receber", "Controle de inadimplência e cobranças", "Metas e relatórios gerenciais", "Acesso no celular e no computador (PWA)", "Implantação e treinamento inclusos no setup"],
    },
    appPersonalizado: {
      name: "App Personalizado",
      tagline: "Um aplicativo próprio, feito sob medida para a sua operação.",
      priceText: "Consulta",
      periodText: "Fale com Estevão para um orçamento",
      features: ["Levantamento completo do seu processo", "Desenvolvimento 100% sob medida", "Telas e fluxos exclusivos para o seu negócio", "Integração com sistemas que você já usa", "Treinamento da sua equipe", "Suporte e manutenção contínua", "Evolui junto com o seu negócio"],
    },
  },
  footerTagline: "Consultoria financeira para profissionais autônomos e pequenas empresas.",
};

const WHATSAPP_BASE = "https://wa.me/5516991746034";
const WHATSAPP_HERO = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, quero uma consultoria financeira!")}`;
const WHATSAPP_NAV = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, vim pelo site da Nortyx!")}`;
const WHATSAPP_SEG = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, quero saber se a Nortyx atende meu setor!")}`;
const WHATSAPP_CUSTOM = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, tenho interesse em um App Personalizado!")}`;
const WHATSAPP_CTA = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, quero organizar as finanças do meu negócio!")}`;
const WHATSAPP_OK = `${WHATSAPP_BASE}?text=${encodeURIComponent("Olá Estevão, acabei de preencher o formulário da Nortyx!")}`;

const DIAGNOSTICO_URL = "https://nortyxdiagnostico.lovable.app";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nortyx — Consultoria Financeira" },
      { name: "description", content: "Fluxo de caixa, DRE, planejamento e controle de inadimplência para profissionais autônomos e pequenas empresas." },
      { property: "og:title", content: "Nortyx — Consultoria Financeira" },
      { property: "og:description", content: "Fluxo de caixa, DRE, planejamento e controle de inadimplência para profissionais autônomos e pequenas empresas." },
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
          telephone: "+5516991746034",
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
  const HC_TOTAL = 4;
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
        .from("nortyx_editable_content")
        .select("content")
        .eq("id", "homepage")
        .maybeSingle();
      if (!cancelled && !error && data?.content) {
        const saved = data.content as Partial<SiteContent>;
        setContent((c) => ({
          banner1: { ...c.banner1, ...saved.banner1 },
          banner2: { ...c.banner2, ...saved.banner2 },
          banner3: { ...c.banner3, ...saved.banner3 },
          banner4: { ...c.banner4, ...saved.banner4 },
          headings: {
            servicos: { ...c.headings.servicos, ...saved.headings?.servicos },
            paraquem: { ...c.headings.paraquem, ...saved.headings?.paraquem },
            processo: { ...c.headings.processo, ...saved.headings?.processo },
            planos: { ...c.headings.planos, ...saved.headings?.planos },
            depoimentos: { ...c.headings.depoimentos, ...saved.headings?.depoimentos },
            diagnostico: { ...c.headings.diagnostico, ...saved.headings?.diagnostico },
            ctaFinal: { ...c.headings.ctaFinal, ...saved.headings?.ctaFinal },
          },
          services: saved.services && saved.services.length === c.services.length ? saved.services : c.services,
          paraquemCards: saved.paraquemCards && saved.paraquemCards.length === c.paraquemCards.length ? saved.paraquemCards : c.paraquemCards,
          steps: saved.steps && saved.steps.length === c.steps.length ? saved.steps : c.steps,
          testimonials: saved.testimonials && saved.testimonials.length === c.testimonials.length ? saved.testimonials : c.testimonials,
          diagCard: { ...c.diagCard, ...saved.diagCard },
          plans: {
            essencial: { ...c.plans.essencial, ...saved.plans?.essencial, features: saved.plans?.essencial?.features?.length === c.plans.essencial.features.length ? saved.plans.essencial.features : c.plans.essencial.features },
            profissional: { ...c.plans.profissional, ...saved.plans?.profissional, features: saved.plans?.profissional?.features?.length === c.plans.profissional.features.length ? saved.plans.profissional.features : c.plans.profissional.features },
            appNortyx: { ...c.plans.appNortyx, ...saved.plans?.appNortyx, features: saved.plans?.appNortyx?.features?.length === c.plans.appNortyx.features.length ? saved.plans.appNortyx.features : c.plans.appNortyx.features },
            appPersonalizado: { ...c.plans.appPersonalizado, ...saved.plans?.appPersonalizado, features: saved.plans?.appPersonalizado?.features?.length === c.plans.appPersonalizado.features.length ? saved.plans.appPersonalizado.features : c.plans.appPersonalizado.features },
          },
          footerTagline: saved.footerTagline ?? c.footerTagline,
        }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function updateBannerField(banner: "banner1" | "banner2" | "banner3" | "banner4", field: keyof BannerContent, value: string | string[]) {
    setContent((c) => ({ ...c, [banner]: { ...c[banner], [field]: value } }));
  }

  function updateHeadingField(key: keyof SiteContent["headings"], field: keyof BannerContent, value: string | string[]) {
    setContent((c) => ({ ...c, headings: { ...c.headings, [key]: { ...c.headings[key], [field]: value } } }));
  }

  function updateListItem(group: "services" | "paraquemCards" | "steps", index: number, field: keyof CardText, value: string) {
    setContent((c) => {
      const list = [...c[group]];
      list[index] = { ...list[index], [field]: value };
      return { ...c, [group]: list };
    });
  }

  function updateTestimonial(index: number, field: keyof Testimonial, value: string) {
    setContent((c) => {
      const list = [...c.testimonials];
      list[index] = { ...list[index], [field]: value };
      return { ...c, testimonials: list };
    });
  }

  function updateDiagCard(field: keyof DiagCard, value: string | string[]) {
    setContent((c) => ({ ...c, diagCard: { ...c.diagCard, [field]: value } }));
  }

  function updatePlanField(plan: keyof SiteContent["plans"], field: keyof PlanText, value: string) {
    setContent((c) => ({ ...c, plans: { ...c.plans, [plan]: { ...c.plans[plan], [field]: value } } }));
  }

  function updatePlanFeature(plan: keyof SiteContent["plans"], index: number, value: string) {
    setContent((c) => {
      const features = [...c.plans[plan].features];
      features[index] = value;
      return { ...c, plans: { ...c.plans, [plan]: { ...c.plans[plan], features } } };
    });
  }

  async function saveContent() {
    setSaveStatus("saving");
    const { error } = await supabase
      .from("nortyx_editable_content")
      .upsert({ id: "homepage", content, updated_at: new Date().toISOString() });
    if (error) {
      console.error("[Nortyx] Falha ao salvar no Supabase:", error);
      setSaveStatus("error");
      window.alert(
        `Não consegui salvar. Detalhe do erro:\n\n${error.message}${error.code ? `\n\nCódigo: ${error.code}` : ""}${error.hint ? `\n\nDica: ${error.hint}` : ""}\n\nSe for a primeira vez, confira se você rodou o setup-supabase.sql no SQL Editor do Supabase.`
      );
    } else {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
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

  const editableStyle = editMode ? { outline: "1.5px dashed rgba(26,36,84,.35)", outlineOffset: 2, borderRadius: 3 } : undefined;

  // Título genérico (linhas + prefixo/itálico final) — usado no hero (h1) e nas seções (h2)
  function renderTitleTag(
    tag: "h1" | "h2",
    tagClassName: string | undefined,
    b: BannerContent,
    onChange: (field: keyof BannerContent, value: string | string[]) => void,
  ) {
    const Tag = tag as any;
    return (
      <Tag className={tagClassName}>
        {b.titleLines.map((line, i) => (
          <span key={i}>
            <span
              contentEditable={editMode}
              suppressContentEditableWarning
              style={editableStyle}
              onBlur={(e) => {
                const lines = [...b.titleLines];
                lines[i] = e.currentTarget.textContent || "";
                onChange("titleLines", lines);
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
          onBlur={(e) => onChange("titleLastPrefix", e.currentTarget.textContent || "")}
        >
          {b.titleLastPrefix}
        </span>
        <em
          contentEditable={editMode}
          suppressContentEditableWarning
          style={editableStyle}
          onBlur={(e) => onChange("titleLastEm", e.currentTarget.textContent || "")}
        >
          {b.titleLastEm}
        </em>
      </Tag>
    );
  }

  function renderBannerHeader(key: "banner1" | "banner2" | "banner3" | "banner4") {
    const b = content[key];
    const onChange = (field: keyof BannerContent, value: string | string[]) => updateBannerField(key, field, value);
    return (
      <>
        <div
          className="hero-eyebrow"
          contentEditable={editMode}
          suppressContentEditableWarning
          style={editableStyle}
          onBlur={(e) => onChange("eyebrow", e.currentTarget.textContent || "")}
        >
          {b.eyebrow}
        </div>
        {renderTitleTag("h1", undefined, b, onChange)}
        <p
          className="hero-desc"
          contentEditable={editMode}
          suppressContentEditableWarning
          style={editableStyle}
          onBlur={(e) => onChange("desc", e.currentTarget.textContent || "")}
        >
          {b.desc}
        </p>
      </>
    );
  }

  // Cabeçalho de seção (tag + título + subtítulo) — reaproveita a mesma estrutura do hero
  function renderHeadingTagTitle(key: keyof SiteContent["headings"]) {
    const h = content.headings[key];
    const onChange = (field: keyof BannerContent, value: string | string[]) => updateHeadingField(key, field, value);
    return (
      <>
        {h.eyebrow !== "" || editMode ? (
          <div
            className="s-tag rv"
            contentEditable={editMode}
            suppressContentEditableWarning
            style={editableStyle}
            onBlur={(e) => onChange("eyebrow", e.currentTarget.textContent || "")}
          >
            {h.eyebrow}
          </div>
        ) : null}
        {renderTitleTag("h2", "s-title rv", h, onChange)}
      </>
    );
  }

  function renderHeadingSub(key: keyof SiteContent["headings"], subStyle?: CSSProperties) {
    const h = content.headings[key];
    return (
      <p
        className="s-sub rv"
        style={subStyle}
        contentEditable={editMode}
        suppressContentEditableWarning
        onBlur={(e) => updateHeadingField(key, "desc", e.currentTarget.textContent || "")}
      >
        {h.desc}
      </p>
    );
  }

  // Cabeçalho completo (tag + título + subtítulo juntos) — usado quando o sub fica na mesma coluna
  function renderHeading(key: keyof SiteContent["headings"], subStyle?: CSSProperties) {
    return (
      <>
        {renderHeadingTagTitle(key)}
        {renderHeadingSub(key, subStyle)}
      </>
    );
  }

  // Card simples de nome + descrição (serviços, para quem, etapas)
  function renderCardText(group: "services" | "paraquemCards" | "steps", index: number, nameClass: string, descClass: string) {
    const item = content[group][index];
    return (
      <>
        <div
          className={nameClass}
          contentEditable={editMode}
          suppressContentEditableWarning
          style={editableStyle}
          onBlur={(e) => updateListItem(group, index, "name", e.currentTarget.textContent || "")}
        >
          {item.name}
        </div>
        <div
          className={descClass}
          contentEditable={editMode}
          suppressContentEditableWarning
          style={editableStyle}
          onBlur={(e) => updateListItem(group, index, "desc", e.currentTarget.textContent || "")}
        >
          {item.desc}
        </div>
      </>
    );
  }

  function renderPlanNameTagline(plan: keyof SiteContent["plans"]) {
    const p = content.plans[plan];
    return (
      <>
        <div
          className="plan-name"
          contentEditable={editMode}
          suppressContentEditableWarning
          style={editableStyle}
          onBlur={(e) => updatePlanField(plan, "name", e.currentTarget.textContent || "")}
        >
          {p.name}
        </div>
        <div
          className="plan-tagline"
          contentEditable={editMode}
          suppressContentEditableWarning
          style={editableStyle}
          onBlur={(e) => updatePlanField(plan, "tagline", e.currentTarget.textContent || "")}
        >
          {p.tagline}
        </div>
      </>
    );
  }

  function renderEditablePrice(value: string, onChange: (v: string) => void, className?: string) {
    return (
      <span
        className={className}
        contentEditable={editMode}
        suppressContentEditableWarning
        style={editableStyle}
        onBlur={(e) => onChange(e.currentTarget.textContent || "")}
      >
        {value}
      </span>
    );
  }

  function renderPlanFeatures(plan: keyof SiteContent["plans"]) {
    const p = content.plans[plan];
    return (
      <div className="plan-feats">
        {p.features.map((f, i) => (
          <div key={i} className="plan-feat">
            <span className="feat-ok">✓</span>
            <span
              contentEditable={editMode}
              suppressContentEditableWarning
              style={editableStyle}
              onBlur={(e) => updatePlanFeature(plan, i, e.currentTarget.textContent || "")}
            >
              {f}
            </span>
          </div>
        ))}
      </div>
    );
  }

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
                <div className="trust-num">{content.plans.appNortyx.monthly}</div>
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

        {/* ── BANNER 4 · App Personalizado ── */}
        <section className={`hero hero-custom hc-slide ${hcSlide === 3 ? "hc-active" : ""}`}>
          <div className="hero-left">
            {renderBannerHeader("banner4")}
            <div className="hero-ctas">
              <a href={WHATSAPP_CUSTOM} target="_blank" rel="noreferrer" className="btn-primary">
                💬 Falar com Estevão →
              </a>
              <a href="#planos" className="btn-secondary">Ver todos os planos</a>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <div className="trust-num">100%</div>
                <div className="trust-text">sob medida<br />pro seu negócio</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--lp-border)" }} />
              <div className="trust-item">
                <div className="trust-num">Você</div>
                <div className="trust-text">é dono do<br />código e do app</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--lp-border)" }} />
              <div className="trust-item">
                <div className="trust-num">∞</div>
                <div className="trust-text">suporte e<br />evolução contínua</div>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div style={{ position: "relative" }}>
              <div className="float-chip fc1">
                <div className="fc-icon">🎯</div>
                <div className="fc-label">Feito para você</div>
                <div className="fc-val">Sua operação, seu app</div>
              </div>
              <div className="float-chip fc2">
                <div className="fc-icon">🛠️</div>
                <div className="fc-label">Desenvolvimento</div>
                <div className="fc-val">100% sob medida</div>
              </div>
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Projeto sob medida</span>
                  <span className="panel-live">Sob consulta</span>
                </div>
                <div className="panel-metrics">
                  <div className="metric-box">
                    <div className="metric-lbl">Prazo médio</div>
                    <div className="metric-val" style={{ fontSize: "1.6rem" }}>4–8 sem.</div>
                    <div className="metric-sub">▲ conforme escopo</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-lbl">Início</div>
                    <div className="metric-val" style={{ fontSize: "1.6rem" }}>Imediato</div>
                    <div className="metric-sub">▲ após aprovação</div>
                  </div>
                </div>
                <div className="panel-divider" />
                <div className="panel-rows">
                  <div className="panel-row">
                    <div className="row-icon">📋</div>
                    <div className="row-label">Levantamento</div>
                    <div className="row-val" style={{ color: "var(--green)" }}>Concluído</div>
                  </div>
                  <div className="panel-row">
                    <div className="row-icon">🎨</div>
                    <div className="row-label">Design das telas</div>
                    <div className="row-val">Em andamento</div>
                  </div>
                  <div className="panel-row">
                    <div className="row-icon">⚙️</div>
                    <div className="row-label">Desenvolvimento</div>
                    <div className="row-val">A iniciar</div>
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
          {["Consultoria", "Diagnóstico", "App Nortyx", "App Personalizado"].map((label, i) => (
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
              {renderHeading("servicos", { marginTop: 0 })}
            </div>
            <div className="svc-grid">
              {[
                { n: "01", tags: ["Diagnóstico", "Análise"] },
                { n: "02", tags: ["Fluxo de caixa", "Projeções"] },
                { n: "03", tags: ["DRE", "Relatórios"] },
                { n: "04", tags: ["Metas", "Orçamento"] },
                { n: "05", tags: ["Recebíveis", "Cobrança"] },
                { n: "06", tags: ["Mentoria", "Acompanhamento"] },
              ].map((s, i) => (
                <div key={s.n} className="svc-card rv">
                  <div className="svc-num">{s.n}</div>
                  {renderCardText("services", i, "svc-name", "svc-desc")}
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
              {renderHeadingTagTitle("paraquem")}
            </div>
            {renderHeadingSub("paraquem")}
          </div>
          <div className="paraquem-grid">
            <div className="pq-card featured rv">
              <span className="pq-icon">⚖️</span>
              {renderCardText("paraquemCards", 0, "pq-name", "pq-desc")}
              <div className="pq-features">
                <div className="pq-feat">Controle de honorários</div>
                <div className="pq-feat">Redução de inadimplência</div>
                <div className="pq-feat">DRE mensal</div>
              </div>
            </div>
            <div className="pq-card featured rv">
              <span className="pq-icon">🩺</span>
              {renderCardText("paraquemCards", 1, "pq-name", "pq-desc")}
              <div className="pq-features">
                <div className="pq-feat">Fluxo de caixa</div>
                <div className="pq-feat">Controle de pacientes</div>
                <div className="pq-feat">Planejamento de expansão</div>
              </div>
            </div>
            <div className="pq-card featured rv">
              <span className="pq-icon">📣</span>
              {renderCardText("paraquemCards", 2, "pq-name", "pq-desc")}
              <div className="pq-features">
                <div className="pq-feat">Receita por cliente</div>
                <div className="pq-feat">Fluxo de caixa</div>
                <div className="pq-feat">Metas de crescimento</div>
              </div>
            </div>
            {["🦷", "🔧", "🏋️", "🏫", "💆"].map((icon, i) => (
              <div key={icon} className="pq-card rv">
                <span className="pq-icon">{icon}</span>
                {renderCardText("paraquemCards", i + 3, "pq-name", "pq-desc")}
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
              {renderHeadingTagTitle("processo")}
            </div>
            {renderHeadingSub("processo")}
          </div>
          <div className="steps">
            {["01", "02", "03", "04"].map((n, i) => (
              <div key={n} className="step rv">
                <div className="step-num">{n}</div>
                {renderCardText("steps", i, "step-name", "step-desc")}
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
              {renderHeadingTagTitle("planos")}
            </div>
            <div>
              {renderHeadingSub("planos")}
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
              {renderPlanNameTagline("essencial")}
              <div className="plan-price">{renderEditablePrice(annual ? (content.plans.essencial.annual || "") : (content.plans.essencial.monthly || ""), (v) => updatePlanField("essencial", annual ? "annual" : "monthly", v))}</div>
              <div className="plan-period">{annual ? "/mês · cobrado anualmente" : "/mês · sem fidelidade"}</div>
              {annual && <div className="plan-annual" style={{ display: "block" }}>Equivale a R$ 7.584/ano · economia de R$ 1.896</div>}
              <div className="plan-sep" />
              {renderPlanFeatures("essencial")}
              <div className="plan-feats" style={{ marginTop: -10 }}>
                <div className="plan-feat"><span className="feat-no">✗</span><span style={{ color: "var(--lp-muted)" }}>Planejamento anual</span></div>
                <div className="plan-feat"><span className="feat-no">✗</span><span style={{ color: "var(--lp-muted)" }}>Análise de precificação</span></div>
              </div>
              <button
                type="button"
                className="plan-btn plan-btn-out"
                onClick={() => openModal("Essencial", `${annual ? content.plans.essencial.annual : content.plans.essencial.monthly}/mês`)}
              >
                Contratar agora
              </button>
            </div>

            {/* Profissional */}
            <div className="plan hot rv">
              <div className="plan-badge">MAIS POPULAR</div>
              {renderPlanNameTagline("profissional")}
              <div className="plan-price">{renderEditablePrice(annual ? (content.plans.profissional.annual || "") : (content.plans.profissional.monthly || ""), (v) => updatePlanField("profissional", annual ? "annual" : "monthly", v))}</div>
              <div className="plan-period">{annual ? "/mês · cobrado anualmente" : "/mês · sem fidelidade"}</div>
              {annual && (
                <div className="plan-annual" style={{ display: "block", color: "rgba(34,197,94,.8)" }}>
                  Equivale a R$ 12.384/ano · economia de R$ 3.096
                </div>
              )}
              <div className="plan-sep" />
              {renderPlanFeatures("profissional")}
              <button
                type="button"
                className="plan-btn plan-btn-fill"
                onClick={() => openModal("Profissional", `${annual ? content.plans.profissional.annual : content.plans.profissional.monthly}/mês`)}
              >
                Contratar agora
              </button>
            </div>

            {/* App Nortyx */}
            <div className="plan app-plan-light rv" id="plano-app">
              <div className="plan-badge app-plan-light-badge">SOMENTE O APP</div>
              {renderPlanNameTagline("appNortyx")}
              <div className="plan-price">{renderEditablePrice(content.plans.appNortyx.monthly || "", (v) => updatePlanField("appNortyx", "monthly", v))}</div>
              <div className="plan-period">/mês · + setup inicial de {renderEditablePrice(content.plans.appNortyx.setup || "", (v) => updatePlanField("appNortyx", "setup", v))}</div>
              <div className="plan-sep" />
              {renderPlanFeatures("appNortyx")}
              <button
                type="button"
                className="plan-btn plan-btn-out"
                onClick={() => openModal("App Nortyx", `${content.plans.appNortyx.setup} de setup + ${content.plans.appNortyx.monthly}/mês`)}
              >
                Adquirir o App →
              </button>
            </div>

            {/* App Personalizado */}
            <div className="plan app-plan rv">
              {renderPlanNameTagline("appPersonalizado")}
              <div className="plan-price">{renderEditablePrice(content.plans.appPersonalizado.priceText || "", (v) => updatePlanField("appPersonalizado", "priceText", v))}</div>
              <div className="plan-period">{renderEditablePrice(content.plans.appPersonalizado.periodText || "", (v) => updatePlanField("appPersonalizado", "periodText", v))}</div>
              <div className="plan-sep" />
              {renderPlanFeatures("appPersonalizado")}
              <a href={WHATSAPP_CUSTOM} target="_blank" rel="noreferrer" className="plan-btn plan-btn-fill app-plan-btn">
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
              {renderHeadingTagTitle("depoimentos")}
            </div>
            {renderHeadingSub("depoimentos")}
          </div>
          <div className="dep-grid">
            {["DR", "DM", "CA"].map((initials, i) => (
              <div key={initials} className="dep rv">
                <div className="dep-quote">"</div>
                <p
                  className="dep-text"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  style={editableStyle}
                  onBlur={(e) => updateTestimonial(i, "text", e.currentTarget.textContent || "")}
                >
                  {content.testimonials[i].text}
                </p>
                <div className="dep-author">
                  <div className="dep-avatar">{initials}</div>
                  <div>
                    <div className="dep-stars">★★★★★</div>
                    <div
                      className="dep-name"
                      contentEditable={editMode}
                      suppressContentEditableWarning
                      style={editableStyle}
                      onBlur={(e) => updateTestimonial(i, "name", e.currentTarget.textContent || "")}
                    >
                      {content.testimonials[i].name}
                    </div>
                    <div
                      className="dep-role"
                      contentEditable={editMode}
                      suppressContentEditableWarning
                      style={editableStyle}
                      onBlur={(e) => updateTestimonial(i, "role", e.currentTarget.textContent || "")}
                    >
                      {content.testimonials[i].role}
                    </div>
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
            {renderHeading("diagnostico")}
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
              <div
                className="diag-card-tag"
                contentEditable={editMode}
                suppressContentEditableWarning
                style={editableStyle}
                onBlur={(e) => updateDiagCard("tag", e.currentTarget.textContent || "")}
              >
                {content.diagCard.tag}
              </div>
              <div className="diag-card-title">
                {content.diagCard.titleLines.map((line, i) => (
                  <span key={i}>
                    <span
                      contentEditable={editMode}
                      suppressContentEditableWarning
                      style={editableStyle}
                      onBlur={(e) => {
                        const lines = [...content.diagCard.titleLines];
                        lines[i] = e.currentTarget.textContent || "";
                        updateDiagCard("titleLines", lines);
                      }}
                    >
                      {line}
                    </span>
                    {i < content.diagCard.titleLines.length - 1 && <br />}
                  </span>
                ))}
              </div>
              <div
                className="diag-card-desc"
                contentEditable={editMode}
                suppressContentEditableWarning
                style={editableStyle}
                onBlur={(e) => updateDiagCard("desc", e.currentTarget.textContent || "")}
              >
                {content.diagCard.desc}
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
              <div
                className="diag-note"
                contentEditable={editMode}
                suppressContentEditableWarning
                style={editableStyle}
                onBlur={(e) => updateDiagCard("note", e.currentTarget.textContent || "")}
              >
                {content.diagCard.note}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <div className="cta-final">
        {renderHeading("ctaFinal")}
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
              <p
                className="footer-tagline"
                contentEditable={editMode}
                suppressContentEditableWarning
                style={editableStyle}
                onBlur={(e) => setContent((c) => ({ ...c, footerTagline: e.currentTarget.textContent || "" }))}
              >
                {content.footerTagline}
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
                <a href="#planos" onClick={(e) => { e.preventDefault(); openModal("Essencial", `${annual ? content.plans.essencial.annual : content.plans.essencial.monthly}/mês`); }}>Essencial</a>
                <a href="#planos" onClick={(e) => { e.preventDefault(); openModal("Profissional", `${annual ? content.plans.profissional.annual : content.plans.profissional.monthly}/mês`); }}>Profissional</a>
                <a href="#plano-app" onClick={(e) => { e.preventDefault(); openModal("App Nortyx", `${content.plans.appNortyx.setup} de setup + ${content.plans.appNortyx.monthly}/mês`); }}>App Nortyx</a>
                <a href={WHATSAPP_CUSTOM} target="_blank" rel="noreferrer">App Personalizado</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Contato</div>
              <div className="footer-contact">
                <a href="mailto:Nortyx.group@gmail.com">Nortyx.group@gmail.com</a>
                <a href="tel:+5516991746034">(16) 99174-6034</a>
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
