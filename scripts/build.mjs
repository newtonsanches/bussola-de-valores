// Gera dist/ com um index.html autossuficiente (CSS e JS embutidos) + arquivos de public/.
// Sem dependências: os módulos são concatenados na ordem de dependência e os import/export removidos.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";

const MODULES = ["src/questions.js", "src/scoring.js", "src/illustrations.js", "src/app.js"];

const js = MODULES.map(f => readFileSync(f, "utf8")
  .replace(/^import[^;]+;\s*$/gm, "")
  .replace(/^export\s+\{[^}]*\};?\s*$/gm, "")
  .replace(/^export\s+(const|function|let|async function)/gm, "$1")
).join("\n");
const css = readFileSync("src/styles.css", "utf8");
const bundle = `(function(){\n${js}\n})();`;

let html = readFileSync("index.html", "utf8")
  .replace(/<!--STYLES-->[\s\S]*?<!--\/STYLES-->/, `<style>\n${css}\n</style>`)
  .replace(/<!--SCRIPTS-->[\s\S]*?<!--\/SCRIPTS-->/, () => `<script>\n${bundle}\n</script>`);

if (existsSync("dist")) rmSync("dist", { recursive: true });
mkdirSync("dist");
cpSync("public", "dist", { recursive: true });
writeFileSync("dist/index.html", html);

// Versão "só o corpo" para pré-visualização como Artifact (sem doctype/html/head/body).
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>|<link rel="(icon|apple-touch-icon|manifest)"[^>]*>/g, "");
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
writeFileSync("dist/preview.html", head.trim() + "\n" + body.trim() + "\n");

console.log("dist/ gerado:", Math.round(html.length / 1024), "KB");
