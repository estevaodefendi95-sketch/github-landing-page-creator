# Portar a landing page do nortyx para o projeto

Você anexou `nortyx-landing.html` — uma landing completa de **Consultoria Financeira Nortyx** (1197 linhas, tema claro creme + navy `#1a2454`, fonte serif Cormorant Garamond + DM Sans). Vou portar essa landing para a rota `/` desta app TanStack Start, mantendo 100% do visual.

## Seções (preservadas do HTML)

Nav, Hero, Números, Serviços, Para Quem, Processo, Planos (toggle mensal/anual), Depoimentos, CTA Diagnóstico, Footer, Modal de inscrição.

## Como vou portar

1. **Tipografia** — adicionar `<link>` das fontes Google (Cormorant Garamond + DM Sans) no `head()` do `__root.tsx`.
2. **Estilos** — copiar o `<style>` inteiro do HTML para `src/styles.css` (mantém variáveis `--ink`, `--navy`, `--cream`, etc.) sem mexer nos tokens shadcn existentes (a landing usa classes próprias, não utilities Tailwind, então não conflita).
3. **Markup** — converter as seções para JSX em componentes separados sob `src/components/landing/`:
   - `Navbar.tsx`, `Hero.tsx`, `Numbers.tsx`, `Services.tsx`, `Audience.tsx`, `Process.tsx`, `Plans.tsx`, `Testimonials.tsx`, `Diagnostico.tsx`, `Footer.tsx`, `SubscribeModal.tsx`.
   - Converter atributos: `class` → `className`, eventos inline `onclick="..."` → handlers React, `for` → `htmlFor`.
4. **Interatividade** — reescrever os scripts inline como hooks React:
   - Scroll spy / nav shadow on scroll → `useEffect` com listener.
   - Toggle Mensal/Anual nos planos → `useState<'monthly'|'annual'>`.
   - Abrir/fechar modal ao clicar em "Assinar" → `useState` + portal shadcn `Dialog` (ou manter o markup original com state).
   - Form do modal → handler que valida campos e mostra a tela de sucesso (`#modal-ok`); sem backend, só estado local + `toast` confirmando. Se quiser enviar para algum lugar real (email, planilha, Cloud), me diga depois.
   - Remover a "edit toolbar secreta" (Ctrl+Shift+E) — é ferramenta de edição inline do HTML estático, não faz sentido na app React.
5. **Rota `/`** — `src/routes/index.tsx` substitui o placeholder atual e renderiza `<Navbar />` + cada seção + `<Footer />` + `<SubscribeModal />`. `head()` com title `Nortyx — Consultoria Financeira`, description, og:title/description, canonical `/`, og:url `/`, JSON-LD `Organization`.
6. **`__root.tsx`** — `lang="pt-BR"`, preconnect das fontes Google.

## Sobre o GitHub

A landing original não tem menção ao GitHub, então não vou inventar. Se quiser que eu adicione um botão "Ver no GitHub" no nav ou no footer apontando para `https://github.com/estevaodefendi95-sketch/nortyx`, é só dizer e eu incluo.

## Fora do escopo

- Não vou enviar o form do modal para nenhum backend (sem Cloud) — só feedback visual. Posso adicionar depois.
- Não vou reescrever as classes para Tailwind utilities — manter o CSS original é mais rápido, mais fiel e zero risco visual.
- Sem páginas extras (Termos, Privacidade etc.) — links âncora do HTML são todos `#seção`, ficam funcionais.
