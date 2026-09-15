# Plano: valor mensal do App Nortyx para R$ 390

## O que muda

O preço mensal do plano **App Nortyx** passa de **R$ 250** para **R$ 390**.
Tudo o mais no card continua igual: o texto "+ setup inicial de R$ 1.500" permanece, assim como os planos Essencial (R$ 790) e Profissional (R$ 1.290) e a lista de benefícios do app.

O card continuará mostrando:

```text
App Nortyx
R$ 390
/mês · + setup inicial de R$ 1.500
```

## Como será feito

- Ajustar o valor mensal do App Nortyx de `"R$ 250"` para `"R$ 390"` na lista de textos padrão da página (`src/routes/index.tsx`, linha 152). É a única ocorrência desse número em todo o projeto — já verificado.
- Conferir na própria página que o card do App Nortyx passa a exibir **R$ 390** e que o restante (setup, planos Essencial e Profissional, alternância Mensal/Anual) não foi afetado.

## Detalhe importante sobre o conteúdo salvo

Os textos da página podem estar guardados também no banco de dados da Nortyx (a tabela de conteúdo editável), e o que está lá tem prioridade sobre os valores do código quando o site consegue consultá-lo. No ambiente de testes aqui do editor esse acesso não está funcionando (o site mostra os valores do código), então não consegui verificar se já existe um preço antigo salvo.

Por isso, depois da alteração, se a versão publicada ainda mostrar **R$ 250**, o caminho é abrir o modo de edição do site (Ctrl + Shift + E), trocar o número no card do App Nortyx e clicar em **Salvar** — isso grava o valor novo no banco e resolve.
