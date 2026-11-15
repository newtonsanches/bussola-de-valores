# Bússola de Valores

Questionário que mostra onde a pessoa está no mapa político em **4 eixos**: economia, autoridade, costumes e igualdade.
São 37 perguntas, em cerca de 8 minutos, sem cadastro e sem coletar nenhum dado.

![Prévia](public/og-image.png)

## O que tem no app
- **Perguntas indiretas e escolhas com custo**, em vez de “você é de esquerda ou de direita?”.
- **Resultado didático**: quadrante com ilustração, mapa colorido com o ponto “Você”, os 4 eixos com uma explicação personalizada, as correntes mais parecidas e a comparação entre valores e opiniões.
- **Controle de qualidade**: pergunta de atenção, tempo de resposta e viés de concordar com tudo.
- **Compartilhamento**: link com as 4 pontuações (`#r=E-40A55C20H-30`) e imagem pronta para redes sociais.
- **Funciona como app**: pode ser instalado no celular (PWA) e funciona offline depois da primeira visita.
- **Tema claro e escuro** automático.

## Por que não há banco de dados
O app não precisa de banco: as perguntas ficam no código e a pontuação é calculada no aparelho da pessoa.
Isso também evita um risco legal: opinião política é **dado pessoal sensível** pela LGPD (Lei 13.709/2018, art. 5º, II). Para guardá-lo, é preciso consentimento específico e destacado (art. 11), além de segurança e de um encarregado de dados.
Um banco só passa a fazer sentido no estudo de validação (ver [METODOLOGIA.md](METODOLOGIA.md)). Nesse caso, a coleta deve ser anônima, com consentimento explícito e em uma tela separada.

## Estrutura
```
index.html            página (em desenvolvimento carrega src/ como módulos)
src/questions.js      eixos, perguntas, quadrantes e correntes
src/scoring.js        pontuação (funções puras, testadas)
src/illustrations.js  ícones e ilustrações em SVG
src/app.js            interface
src/styles.css        visual
public/               ícones, manifesto PWA, service worker, imagem de prévia
scripts/build.mjs     gera dist/index.html autossuficiente (sem dependências)
tests/                testes da pontuação (node --test)
```

## Rodar e testar
Requer Node 18 ou mais recente. Não há dependências para instalar.
```bash
npm test          # testes da pontuação
npm run build     # gera dist/
npx serve dist    # abre em http://localhost:3000
```

## Publicação (GitHub Pages)
O workflow `.github/workflows/deploy.yml` roda os testes, gera o `dist/` e publica a cada push na `main`.
Para ativar uma vez: **Settings → Pages → Source: GitHub Actions**.
Observação: em repositório **privado**, o GitHub Pages exige plano pago (Pro, Team ou Enterprise). Em repositório público, é gratuito.
Como o `dist/` é um site estático, ele também pode ir para Cloudflare Pages, Netlify ou Vercel (comando `npm run build`, pasta `dist`).

## Como editar perguntas
Tudo fica em `src/questions.js`. Cada eixo precisa ter frases nos dois sentidos (os testes verificam isso). Depois de editar, rode `npm test`.
