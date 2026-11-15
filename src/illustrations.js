// Ícones (traço, 24×24) e ilustrações dos quadrantes (preenchidas, 160×120).
// As cores vêm de variáveis CSS para funcionar nos temas claro e escuro.

const P = {
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.4 5.8 4.2 0 1.2-1.2 2.1-2.9 2.1-1.3 0-2.4-.6-2.9-1.5M12 6.3v1.5M12 16.2v1.5"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.3-4.4"/>',
  home: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.8 9.4V20h12.4V9.4"/><path d="M10 20v-5.5h4V20"/>',
  people: '<circle cx="8" cy="8.5" r="2.8"/><circle cx="16.5" cy="8.5" r="2.8"/><path d="M3 19c.4-3.2 2.4-5 5-5s4.6 1.8 5 5M11.5 19c.4-3.2 2.4-5 5-5s4.6 1.8 5 5"/>',
  heart: '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>',
  chat: '<path d="M4 5.5h16v10H9.5L5 19.5v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/>',
  share: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"/>',
  back: '<path d="M15 5.5 8.5 12l6.5 6.5"/>',
  next: '<path d="M9 5.5 15.5 12 9 18.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.4"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  book: '<path d="M4.5 5.5c2.5-1 5-1 7.5.5 2.5-1.5 5-1.5 7.5-.5V19c-2.5-1-5-1-7.5.5-2.5-1.5-5-1.5-7.5-.5z"/><path d="M12 6v13.5"/>',
  alert: '<path d="M12 4 3 19.5h18z"/><path d="M12 10v4.5M12 17v.3"/>',
  sparkle: '<path d="M12 3.5c.7 4.3 2.2 5.8 6.5 6.5-4.3.7-5.8 2.2-6.5 6.5-.7-4.3-2.2-5.8-6.5-6.5 4.3-.7 5.8-2.2 6.5-6.5z"/><path d="M18.5 15.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5z"/>'
};

export function icon(name, size = 22) {
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;
}

// Ilustrações: fundo arredondado na cor do quadrante + cena simples.
const SCENES = {
  // Estado protetor: prédio público com escudo
  estadoOrdem: `
    <circle cx="128" cy="26" r="12" fill="var(--ill-sun)"/>
    <path d="M30 52 80 30l50 22z" fill="var(--ill-deep)"/>
    <rect x="34" y="52" width="92" height="7" rx="2" fill="var(--ill-deep)"/>
    ${[44, 62, 80, 98, 116].map(x => `<rect x="${x - 4}" y="60" width="8" height="34" rx="2" fill="var(--ill-light)"/>`).join("")}
    <rect x="28" y="94" width="104" height="9" rx="3" fill="var(--ill-deep)"/>
    <path d="M80 66 66 71v9c0 8 6 13.5 14 16 8-2.5 14-8 14-16v-9z" fill="var(--ill-accent)" stroke="var(--ill-deep)" stroke-width="3"/>
    <path d="m74 81 4.5 4.5 8-8.5" fill="none" stroke="var(--ill-deep)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  // Ordem e livre-iniciativa: loja com toldo + escudo
  mercadoOrdem: `
    <rect x="34" y="50" width="78" height="52" rx="3" fill="var(--ill-light)"/>
    <path d="M28 36h90l-6 18H34z" fill="var(--ill-deep)"/>
    ${[0, 1, 2, 3, 4].map(i => `<path d="M${34 + i * 15.6} 54a7.8 7.8 0 0 0 15.6 0" fill="${i % 2 ? "var(--ill-deep)" : "var(--ill-accent)"}"/>`).join("")}
    <rect x="44" y="70" width="24" height="32" rx="2" fill="var(--ill-deep)"/>
    <rect x="76" y="68" width="26" height="18" rx="2" fill="var(--ill-sun)"/>
    <path d="M128 52 114 57v9c0 8 6 13.5 14 16 8-2.5 14-8 14-16v-9z" fill="var(--ill-accent)" stroke="var(--ill-deep)" stroke-width="3"/>
    <path d="m122 67 4.5 4.5 8-8.5" fill="none" stroke="var(--ill-deep)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  // Igualdade com liberdade: três pessoas iguais + pássaro
  estadoLiberdade: `
    <path d="M104 28c6-6 12-6 16 0 4-6 10-6 16 0" fill="none" stroke="var(--ill-deep)" stroke-width="3.5" stroke-linecap="round"/>
    ${[[48, "var(--ill-accent)"], [80, "var(--ill-light)"], [112, "var(--ill-sun)"]].map(([x, c]) =>
      `<circle cx="${x}" cy="56" r="11" fill="var(--ill-deep)"/><path d="M${x - 17} 102c0-16 7.5-26 17-26s17 10 17 26z" fill="${c}" stroke="var(--ill-deep)" stroke-width="3"/>`).join("")}
    <path d="M60 84h8M92 84h8" stroke="var(--ill-deep)" stroke-width="5" stroke-linecap="round"/>`,
  // Liberdade acima de tudo: pássaro voando + moeda + sol
  mercadoLiberdade: `
    <circle cx="34" cy="30" r="13" fill="var(--ill-sun)"/>
    <path d="M56 70 34 58l5 14-5 14z" fill="var(--ill-accent)" stroke="var(--ill-deep)" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="80" cy="72" rx="28" ry="16" fill="var(--ill-light)" stroke="var(--ill-deep)" stroke-width="3"/>
    <circle cx="108" cy="60" r="13" fill="var(--ill-light)" stroke="var(--ill-deep)" stroke-width="3"/>
    <circle cx="112" cy="57" r="2.6" fill="var(--ill-deep)"/>
    <path d="m120 58 13 4-13 5z" fill="var(--ill-sun)" stroke="var(--ill-deep)" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M66 66c2-22 14-36 36-42-4 16-10 30-20 44z" fill="var(--ill-accent)" stroke="var(--ill-deep)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M30 104c14-6 28-6 42 0s28 6 42 0" fill="none" stroke="var(--ill-deep)" stroke-width="3" stroke-linecap="round" opacity=".35"/>
    <circle cx="130" cy="94" r="13" fill="var(--ill-sun)" stroke="var(--ill-deep)" stroke-width="3"/>
    <path d="M130 87v14M126 91h6a2.5 2.5 0 0 1 0 5h-4a2.5 2.5 0 0 0 0 5h6" fill="none" stroke="var(--ill-deep)" stroke-width="2.2" stroke-linecap="round"/>`,
  // No meio do caminho: balança equilibrada
  centro: `
    <rect x="76" y="34" width="8" height="62" rx="3" fill="var(--ill-deep)"/>
    <rect x="56" y="94" width="48" height="9" rx="4" fill="var(--ill-deep)"/>
    <rect x="34" y="38" width="92" height="7" rx="3.5" fill="var(--ill-deep)"/>
    <circle cx="80" cy="36" r="7" fill="var(--ill-sun)" stroke="var(--ill-deep)" stroke-width="3"/>
    <path d="M42 45 30 74M42 45l12 29M118 45l-12 29M118 45l12 29" stroke="var(--ill-deep)" stroke-width="2.5"/>
    <path d="M24 74h36a18 10 0 0 1-36 0z" fill="var(--ill-accent)" stroke="var(--ill-deep)" stroke-width="3"/>
    <path d="M100 74h36a18 10 0 0 1-36 0z" fill="var(--ill-light)" stroke="var(--ill-deep)" stroke-width="3"/>`
};

export function illustration(key, cls = "") {
  return `<svg class="ill ${cls}" data-q="${key}" viewBox="0 0 160 120" role="img" aria-hidden="true">
    <rect width="160" height="120" rx="22" fill="var(--ill-bg)"/>${SCENES[key]}</svg>`;
}
