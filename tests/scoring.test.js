import { test } from "node:test";
import assert from "node:assert/strict";
import { ITEMS, AXES } from "../src/questions.js";
import { score, quadrantOf, encodeResult, decodeResult, rankFamilies, byId } from "../src/scoring.js";

// Responde todas as perguntas empurrando cada eixo para o sentido indicado (±1).
function answerAll(dir) {
  const ans = {};
  for (const it of ITEMS) {
    if (it.check != null) { ans[it.id] = { v: it.check, ms: 5000 }; continue; }
    if (it.type === "scenario") {
      let best = 0, bv = -Infinity;
      it.opts.forEach(([, vec], k) => {
        const s = Object.keys(it.w).reduce((t, ax) => t + (vec[ax] || 0) * dir[ax] * it.w[ax], 0);
        if (s > bv) { bv = s; best = k; }
      });
      ans[it.id] = { opt: best, v: 0, ms: 5000 };
    } else {
      const s = Object.entries(it.w).reduce((t, [ax, w]) => t + Math.sign(w) * dir[ax], 0);
      ans[it.id] = { v: s >= 0 ? 1 : -1, ms: 5000 };
    }
  }
  return ans;
}

test("cada eixo tem itens suficientes e chaveamento nos dois sentidos", () => {
  for (const ax of Object.keys(AXES)) {
    const lik = ITEMS.filter(i => i.type === "likert" && i.w[ax]);
    assert.ok(lik.some(i => i.w[ax] > 0) && lik.some(i => i.w[ax] < 0), `eixo ${ax} sem balanceamento`);
  }
});

test("ids são únicos", () => {
  assert.equal(new Set(ITEMS.map(i => i.id)).size, ITEMS.length);
});

test("perfil extremo positivo pontua positivo em todos os eixos", () => {
  const r = score(answerAll({ E: 1, A: 1, C: 1, H: 1 }));
  for (const ax of Object.keys(AXES)) assert.ok(r.axes[ax].ok && r.axes[ax].score > 60, `${ax}=${r.axes[ax].score}`);
  assert.equal(r.attentionFail, false);
});

test("perfil extremo negativo pontua negativo em todos os eixos", () => {
  const r = score(answerAll({ E: -1, A: -1, C: -1, H: -1 }));
  for (const ax of Object.keys(AXES)) assert.ok(r.axes[ax].score < -60, `${ax}=${r.axes[ax].score}`);
});

test("concordar com tudo fica perto do centro e gera alerta", () => {
  const ans = {};
  for (const it of ITEMS) if (it.type === "likert") ans[it.id] = { v: 1, ms: 5000 };
  const r = score(ans);
  assert.ok(r.acquiescence > 0.9);
  assert.ok(r.attentionFail);
  for (const ax of ["E", "C", "H"]) assert.ok(Math.abs(r.axes[ax].score) <= 20, `${ax}=${r.axes[ax].score}`);
});

test("'não sei' não conta e eixo sem respostas fica indisponível", () => {
  const ans = {};
  for (const it of ITEMS) ans[it.id] = { v: null, ms: 3000 };
  const r = score(ans);
  for (const ax of Object.keys(AXES)) assert.equal(r.axes[ax].ok, false);
  assert.equal(r.dontKnow, ITEMS.length);
});

test("quadrantes", () => {
  assert.equal(quadrantOf(-50, 50), "estadoOrdem");
  assert.equal(quadrantOf(50, 50), "mercadoOrdem");
  assert.equal(quadrantOf(-50, -50), "estadoLiberdade");
  assert.equal(quadrantOf(50, -50), "mercadoLiberdade");
  assert.equal(quadrantOf(5, -5), "centro");
});

test("codificação do resultado compartilhável é reversível", () => {
  const r = score(answerAll({ E: 1, A: -1, C: -1, H: 1 }));
  const back = decodeResult(encodeResult(r.axes));
  for (const ax of Object.keys(AXES)) assert.equal(back[ax].score, r.axes[ax].score);
  assert.equal(decodeResult("lixo"), null);
  assert.equal(decodeResult("E999A0C0H0").E.score, 100);
});

test("perfil libertário econômico aponta liberalismo libertário como mais próximo", () => {
  const r = score(answerAll({ E: 1, A: -1, C: -1, H: 1 }));
  assert.equal(rankFamilies(r.axes)[0].nome, "Liberalismo libertário");
});

test("toda opção de situação referencia eixos do item", () => {
  for (const it of ITEMS.filter(i => i.type === "scenario"))
    for (const [, vec] of it.opts) for (const ax of Object.keys(vec)) assert.ok(ax in it.w, `${it.id}:${ax}`);
  assert.ok(byId.S1);
});
