// Conteúdo do questionário: eixos, perguntas, quadrantes e correntes de referência.
// Metodologia e referências em METODOLOGIA.md.

export const AXES = {
  E: {
    nome: "Economia", icone: "coin",
    neg: "Mais Estado", pos: "Mais mercado",
    oQueMede: "Quem deve cuidar do bem-estar e da economia: o governo ou as pessoas e empresas por conta própria.",
    leitura: {
      neg: "Você confia no Estado para reduzir desigualdades: serviços públicos fortes, impostos progressivos e uma rede de proteção para quem precisa.",
      centro: "Você mistura as duas visões: aceita o mercado, mas quer o Estado atuando onde ele falha.",
      pos: "Você confia mais no mercado e na iniciativa individual: menos impostos, menos regras e um Estado mais enxuto."
    }
  },
  A: {
    nome: "Autoridade", icone: "shield",
    neg: "Mais liberdade", pos: "Mais ordem",
    oQueMede: "Quanto poder o Estado e as autoridades devem ter sobre a vida e as escolhas de cada um.",
    leitura: {
      neg: "Você valoriza a autonomia individual e desconfia de poder concentrado, mesmo quando ele promete segurança.",
      centro: "Você busca equilíbrio: quer ordem, mas com limites claros ao poder.",
      pos: "Você valoriza a ordem, a disciplina e líderes firmes, e aceita abrir mão de algumas liberdades por mais segurança."
    }
  },
  C: {
    nome: "Costumes", icone: "home",
    neg: "Mais mudança", pos: "Mais tradição",
    oQueMede: "Como você reage às mudanças nos costumes, na família e na religião.",
    leitura: {
      neg: "Você vê com bons olhos as mudanças nos costumes e acha que tradições devem ser revistas quando deixam alguém de fora.",
      centro: "Você não é nem entusiasta nem resistente às mudanças: depende do tema.",
      pos: "Você dá muito valor às tradições, à família e à religião, e prefere mudanças lentas e cuidadosas."
    }
  },
  H: {
    nome: "Igualdade", icone: "people",
    neg: "Mais igualdade", pos: "Mais hierarquia",
    oQueMede: "Se é aceitável que alguns grupos da sociedade tenham mais poder do que outros.",
    leitura: {
      neg: "Você acha que nenhum grupo deveria dominar outro e apoia ações para dar oportunidades a quem ficou para trás.",
      centro: "Você apoia a igualdade de oportunidades, mas desconfia de algumas políticas para grupos específicos.",
      pos: "Você vê as diferenças entre grupos como algo natural, em geral fruto do mérito, e desconfia de políticas para corrigi-las."
    }
  }
};

// Quadrantes do mapa: x = Economia (E), y = Autoridade (A).
export const QUADRANTS = {
  estadoOrdem:     { nome: "Estado protetor",      cor: "q1", resumo: "Estado forte na economia e na manutenção da ordem.", desc: "Você quer um governo presente: que reduza desigualdades e também garanta ordem e segurança com firmeza." },
  mercadoOrdem:    { nome: "Ordem e livre-iniciativa", cor: "q2", resumo: "Mercado livre com regras firmes e autoridade.", desc: "Você confia no mercado para gerar riqueza, mas quer um Estado firme na segurança, nas leis e nos valores." },
  estadoLiberdade: { nome: "Igualdade com liberdade", cor: "q3", resumo: "Estado reduzindo desigualdades, com muita liberdade individual.", desc: "Você quer um Estado que cuide de quem precisa, sem interferir nas escolhas pessoais de cada um." },
  mercadoLiberdade:{ nome: "Liberdade acima de tudo", cor: "q4", resumo: "Pouco Estado, tanto na economia quanto na vida pessoal.", desc: "Você quer o Estado o menor possível: as pessoas decidem sobre o próprio dinheiro e a própria vida." },
  centro:          { nome: "No meio do caminho",    cor: "q0", resumo: "Posições equilibradas, que mudam conforme o tema.", desc: "Suas respostas ficaram perto do centro nos dois eixos principais. Você avalia caso a caso, sem se prender a um lado." }
};

export const BLOCKS = {
  valores:    { titulo: "Valores",   icone: "heart",   intro: "Escolha entre duas coisas boas. Não existe resposta certa." },
  afirmacoes: { titulo: "Opiniões",  icone: "chat",    intro: "O quanto você concorda com cada frase?" },
  situacoes:  { titulo: "Situações", icone: "compass", intro: "O que você faria em cada caso?" }
};

// pair: w = eixo e sentido do polo B (w > 0: escolher B empurra para +).
// likert: w > 0: concordar empurra para +; w < 0: concordar empurra para −.
// scenario: w = peso do item em cada eixo; cada opção traz seu valor (−1 a 1) por eixo.
// src "FS": escala de valores de criação (Feldman & Stenner, 1997).
export const ITEMS = [
  { id: "V1", block: "valores", type: "pair", q: "Numa criança, o que vale mais?", a: "Independência", b: "Respeito aos mais velhos", w: { A: 1 }, src: "FS" },
  { id: "V2", block: "valores", type: "pair", q: "Numa criança, o que vale mais?", a: "Obediência", b: "Autoconfiança", w: { A: -1 }, src: "FS" },
  { id: "V3", block: "valores", type: "pair", q: "Numa criança, o que vale mais?", a: "Curiosidade", b: "Boas maneiras", w: { A: 1 }, src: "FS" },
  { id: "V4", block: "valores", type: "pair", q: "Numa criança, o que vale mais?", a: "Ser bem-comportada", b: "Ser atenciosa", w: { A: -1 }, src: "FS" },
  { id: "V5", block: "valores", type: "pair", q: "Diante de algo novo, você…", a: "Prefere o que já foi testado", b: "Gosta de experimentar", w: { C: -0.7 } },
  { id: "V6", block: "valores", type: "pair", q: "Numa sociedade justa…", a: "Todos vivem de forma parecida", b: "Cada um fica com o que conquistou", w: { E: 1, H: 0.5 } },
  { id: "V7", block: "valores", type: "pair", q: "Você prefere ter…", a: "Mais segurança", b: "Mais privacidade", w: { A: -1 } },
  { id: "V8", block: "valores", type: "pair", q: "Se a lei e a consciência discordam, siga…", a: "A lei", b: "A consciência", w: { A: -0.8 } },

  { id: "E1", block: "afirmacoes", type: "likert", q: "Estatal que dá prejuízo há anos deve ser vendida.", w: { E: 1 } },
  { id: "E2", block: "afirmacoes", type: "likert", q: "Saúde e educação funcionam melhor nas mãos do governo.", w: { E: -1 } },
  { id: "E3", block: "afirmacoes", type: "likert", q: "Regras trabalhistas mais flexíveis geram mais empregos.", w: { E: 1 } },
  { id: "E4", block: "afirmacoes", type: "likert", q: "Quem ganha mais deve pagar uma fatia bem maior de impostos.", w: { E: -1 } },
  { id: "E5", block: "afirmacoes", type: "likert", q: "Tabelar preços, como de aluguel ou gasolina, mais atrapalha do que ajuda.", w: { E: 1 } },
  { id: "E6", block: "afirmacoes", type: "likert", q: "Toda família deveria ter uma renda mínima garantida, mesmo com mais impostos.", w: { E: -1 } },
  { id: "A1", block: "afirmacoes", type: "likert", q: "Numa crise, o presidente deveria poder agir sem esperar o Congresso ou a Justiça.", w: { A: 1 } },
  { id: "A2", block: "afirmacoes", type: "likert", q: "É melhor um culpado solto do que um inocente preso.", w: { A: -1 } },
  { id: "A3", block: "afirmacoes", type: "likert", q: "A polícia precisa de mais liberdade para agir, mesmo que às vezes erre.", w: { A: 1 } },
  { id: "A4", block: "afirmacoes", type: "likert", q: "Protestos que fecham ruas fazem parte da democracia.", w: { A: -1 } },
  { id: "A5", block: "afirmacoes", type: "likert", q: "O governo deveria ter mais poder para decidir o que pode ser publicado na internet.", w: { A: 1 } },
  { id: "C1", block: "afirmacoes", type: "likert", q: "Os costumes estão mudando rápido demais.", w: { C: 1 } },
  { id: "C2", block: "afirmacoes", type: "likert", q: "Casais do mesmo sexo devem ter os mesmos direitos, inclusive de adotar.", w: { C: -1 } },
  { id: "C3", block: "afirmacoes", type: "likert", q: "A religião deveria ter mais peso nas decisões do governo.", w: { C: 1 } },
  { id: "C4", block: "afirmacoes", type: "likert", q: "Adulto que usa drogas sem prejudicar ninguém não deveria ser tratado como criminoso.", w: { C: -1, A: -0.5 } },
  { id: "C5", block: "afirmacoes", type: "likert", q: "Uma família funciona melhor quando homem e mulher têm papéis bem definidos.", w: { C: 1 } },
  { id: "C6", block: "afirmacoes", type: "likert", q: "Uma tradição deve mudar quando exclui ou prejudica alguém.", w: { C: -1 } },
  { id: "H1", block: "afirmacoes", type: "likert", q: "É natural que alguns grupos tenham mais poder do que outros.", w: { H: 1 } },
  { id: "H2", block: "afirmacoes", type: "likert", q: "O país deve ajudar grupos que historicamente ficaram para trás.", w: { H: -1 } },
  { id: "H3", block: "afirmacoes", type: "likert", q: "Cotas raciais nas universidades são injustas com quem não é cotista.", w: { H: 1 } },
  { id: "H4", block: "afirmacoes", type: "likert", q: "Nenhum grupo deveria mandar mais do que os outros.", w: { H: -1 } },
  { id: "H5", block: "afirmacoes", type: "likert", q: "Quem chegou ao topo, em geral, mereceu estar lá.", w: { H: 1 } },
  { id: "ATT", block: "afirmacoes", type: "likert", q: "Só para ver se você está ligado: marque “Discordo totalmente”.", w: {}, check: -1 },

  { id: "S1", block: "situacoes", type: "scenario", q: "Sua cidade ganhou R$ 50 milhões extras. Onde investir?", w: { E: 1, A: 0.5 },
    opts: [["Postos de saúde e creches", { E: -0.8 }], ["Cortar impostos de quem abre negócio", { E: 0.8 }],
           ["Mais guardas e câmeras", { A: 0.8 }], ["Dinheiro direto para as famílias mais pobres", { E: -0.5, A: -0.3 }]] },
  { id: "S2", block: "situacoes", type: "scenario", q: "Um presidente popular quer adiar a eleição em 2 anos para terminar obras. Você…", w: { A: 1 },
    opts: [["Apoia, se as obras forem importantes", { A: 0.9 }], ["Só apoia se houver plebiscito", { A: 0.3 }], ["É contra, mesmo gostando dele", { A: -0.8 }]] },
  { id: "S3", block: "situacoes", type: "scenario", q: "A escola vai ter aulas sobre diferentes tipos de família. Sua reação?", w: { C: 1, A: 0.3 },
    opts: [["Ótimo, a escola deve falar disso", { C: -0.8 }], ["Ok, se os pais forem avisados antes", { C: -0.1 }],
           ["Prefiro que isso fique com as famílias", { C: 0.6 }], ["O tema deveria ser proibido nas escolas", { C: 0.9, A: 0.6 }]] },
  { id: "S4", block: "situacoes", type: "scenario", q: "Duas candidatas igualmente boas para chefia. Uma é de um grupo raro entre os chefes da empresa. O mais justo é…", w: { H: 1 },
    opts: [["Escolher a do grupo pouco representado", { H: -0.7 }], ["Sortear entre as duas", { H: 0 }], ["Decidir só pela entrevista", { H: 0.3 }]] },
  { id: "S5", block: "situacoes", type: "scenario", q: "Qual destes é o pior problema do Brasil?", w: { E: 0.6, A: 0.6, C: 0.6, H: 0.4 },
    opts: [["Desigualdade entre ricos e pobres", { E: -0.7, H: -0.6 }], ["Governo se metendo demais na vida das pessoas", { E: 0.6, A: -0.6 }],
           ["Perda dos valores morais e da família", { C: 0.8, A: 0.3 }], ["Violência e impunidade", { A: 0.7 }]] },
  { id: "S6", block: "situacoes", type: "scenario", q: "Uma fábrica emprega meia cidade, mas polui o rio. O que fazer?", w: { E: 1 },
    opts: [["Multar e exigir conserto, mesmo com risco de demissões", { E: -0.7 }], ["Dar um prazo longo para não perder empregos", { E: 0.3 }],
           ["Moradores e empresa resolvem na Justiça, sem regra nova", { E: 0.8 }]] }
];

export const LIKERT = [
  ["Discordo totalmente", -1], ["Discordo", -0.5], ["Neutro", 0], ["Concordo", 0.5], ["Concordo totalmente", 1]
];
export const PAIRV = [-1, -0.5, 0.5, 1];

// Coordenadas CONCEITUAIS (E, A, C, H) definidas por este projeto a partir da descrição
// de cada corrente. Não vêm de medição empírica; servem como vocabulário aproximado.
export const FAMILIES = [
  { nome: "Esquerda libertária", p: { E: -70, A: -70, C: -60, H: -70 }, desc: "Igualdade econômica com ampla liberdade individual." },
  { nome: "Social-democracia", p: { E: -45, A: -15, C: -35, H: -50 }, desc: "Mercado com Estado de bem-estar forte e direitos civis." },
  { nome: "Esquerda estatista", p: { E: -70, A: 45, C: 0, H: -40 }, desc: "Estado forte tanto na economia quanto na ordem." },
  { nome: "Centro moderado", p: { E: 0, A: 0, C: 0, H: 0 }, desc: "Posições intermediárias, que variam conforme o tema." },
  { nome: "Liberalismo libertário", p: { E: 75, A: -65, C: -30, H: 20 }, desc: "Mercado livre e Estado mínimo, inclusive nos costumes." },
  { nome: "Centro-direita liberal-conservadora", p: { E: 50, A: 20, C: 35, H: 25 }, desc: "Economia de mercado com valores tradicionais moderados." },
  { nome: "Conservadorismo tradicional", p: { E: 15, A: 50, C: 75, H: 35 }, desc: "Prioridade à tradição, à religião e à ordem." },
  { nome: "Direita autoritária", p: { E: 30, A: 80, C: 70, H: 60 }, desc: "Autoridade forte, tradição e aceitação de hierarquias." }
];
