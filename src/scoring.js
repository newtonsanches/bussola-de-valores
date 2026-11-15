// Funções puras de pontuação. Sem acesso ao DOM, para poderem ser testadas em Node.
import { ITEMS, AXES, FAMILIES, QUADRANTS } from "./questions.js";

export const byId = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const MIN_ITEMS_PER_AXIS = 4;
export const CENTER_RADIUS = 15;

// Converte uma resposta em contribuições por eixo: { eixo: [valor alinhado (−1..1), peso] }.
export function contributions(item, ans) {
  const out = {};
  if (!ans || ans.v === null) return out;
  if (item.type === "likert" || item.type === "pair") {
    for (const [ax, w] of Object.entries(item.w)) out[ax] = [ans.v * Math.sign(w), Math.abs(w)];
  } else {
    const vec = item.opts[ans.opt][1];
    for (const [ax, w] of Object.entries(item.w)) out[ax] = [vec[ax] || 0, w];
  }
  return out;
}

const wmean = L => { const W = L.reduce((s, x) => s + x.w, 0); return W ? L.reduce((s, x) => s + x.v * x.w, 0) / W : 0; };

export function score(answers) {
  const per = Object.fromEntries(Object.keys(AXES).map(k => [k, []]));
  for (const it of ITEMS) {
    const ans = answers[it.id];
    if (!ans || it.check != null) continue;
    for (const [ax, [v, w]] of Object.entries(contributions(it, ans))) per[ax].push({ id: it.id, v, w, fs: it.src === "FS" });
  }

  const axes = {};
  for (const [ax, L] of Object.entries(per)) {
    if (L.length < MIN_ITEMS_PER_AXIS) { axes[ax] = { ok: false, n: L.length }; continue; }
    const m = wmean(L);
    const W = L.reduce((s, x) => s + x.w, 0);
    const sd = Math.sqrt(L.reduce((s, x) => s + x.w * (x.v - m) ** 2, 0) / W);
    const infl = L.map(x => ({ ...x, pull: x.v * x.w }))
      .filter(x => x.pull !== 0 && Math.sign(x.pull) === Math.sign(m))
      .sort((a, b) => Math.abs(b.pull) - Math.abs(a.pull)).slice(0, 3);
    axes[ax] = { ok: true, n: L.length, score: Math.round(m * 100), sd, infl };
  }

  // Autoridade: medida indireta (valores de criação) × medida direta (opiniões e situações).
  const fsL = per.A.filter(x => x.fs), dirL = per.A.filter(x => !x.fs);
  const indirect = fsL.length >= 3 ? Math.round(wmean(fsL) * 100) : null;
  const direct = dirL.length >= 3 ? Math.round(wmean(dirL) * 100) : null;

  // Qualidade das respostas.
  const lik = ITEMS.filter(i => i.type === "likert" && i.check == null && answers[i.id] && answers[i.id].v !== null);
  const acquiescence = lik.length ? lik.reduce((s, i) => s + answers[i.id].v, 0) / lik.length : 0;
  const attentionFail = answers.ATT ? answers.ATT.v !== -1 : false;
  const times = Object.values(answers).map(a => a.ms).filter(x => x > 0).sort((a, b) => a - b);
  const medianMs = times.length ? times[Math.floor(times.length / 2)] : 0;
  const dontKnow = Object.values(answers).filter(a => a.v === null).length;

  return { axes, indirect, direct, acquiescence, attentionFail, medianMs, dontKnow };
}

export function quadrantOf(e, a) {
  if (Math.hypot(e, a) < CENTER_RADIUS) return "centro";
  if (a >= 0) return e < 0 ? "estadoOrdem" : "mercadoOrdem";
  return e < 0 ? "estadoLiberdade" : "mercadoLiberdade";
}

export function intensity(x) {
  const a = Math.abs(x);
  if (a < 15) return 0;      // perto do centro
  if (a < 40) return 1;      // leve
  if (a < 70) return 2;      // clara
  return 3;                  // forte
}
export const INTENSITY_LABEL = ["Equilíbrio", "Leve", "Clara", "Forte"];

export function rankFamilies(axes) {
  return FAMILIES.map(f => {
    let d = 0, n = 0;
    for (const k of Object.keys(AXES)) if (axes[k] && axes[k].ok) { d += (axes[k].score - f.p[k]) ** 2; n++; }
    return { ...f, dist: n ? Math.sqrt(d / n) : Infinity };
  }).sort((a, b) => a.dist - b.dist);
}

export function consistency(sd) { return sd < 0.35 ? "alta" : sd < 0.55 ? "média" : "baixa"; }

// Resultado compartilhável: "E45A-20C10H-5". Só pontuações, nada de respostas.
export function encodeResult(axes) {
  return Object.keys(AXES).map(k => k + (axes[k].ok ? axes[k].score : "x")).join("");
}
export function decodeResult(str) {
  const m = /^E(-?\d+|x)A(-?\d+|x)C(-?\d+|x)H(-?\d+|x)$/.exec(str || "");
  if (!m) return null;
  const axes = {};
  ["E", "A", "C", "H"].forEach((k, i) => {
    const v = m[i + 1];
    axes[k] = v === "x" ? { ok: false, n: 0 } : { ok: true, score: Math.max(-100, Math.min(100, parseInt(v, 10))) };
  });
  return axes;
}

export { QUADRANTS };
