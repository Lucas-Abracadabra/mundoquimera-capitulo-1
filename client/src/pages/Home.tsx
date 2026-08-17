// Direção Quimera em Blocos: o aplicativo apresenta o storyfile original como um atlas narrativo, mantendo texto, caminhos e variáveis.
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Compass, Download, FileText, Map as MapIcon, Search, Shield, Sparkles, Swords } from "lucide-react";
import storyData from "@/data/storyMap.json";

const mapImage = "/manus-storage/quimera-map-numbered_c7c8104b.jpg";
const markImage = "/manus-storage/quimera-mark_94657664.png";
const pinterestFallback = "/manus-storage/pin-002_6a91b29b.jpg";
const desktopReleaseBase = "https://github.com/Lucas-Abracadabra/mundoquimera-capitulo-1/releases/download/v1.0.4";
const desktopDownloads = [
  { key: "windows", label: "Windows", detail: "Instalador .exe", href: `${desktopReleaseBase}/Mundo-Quimera-Capitulo-1-setup-1.0.4-x64.exe` },
  { key: "macos", label: "macOS", detail: "Arquivo .dmg", href: `${desktopReleaseBase}/Mundo-Quimera-Capitulo-1-1.0.4-mac-arm64.dmg` },
  { key: "linux", label: "Linux", detail: "AppImage", href: `${desktopReleaseBase}/Mundo-Quimera-Capitulo-1-1.0.4-linux-x86_64.AppImage` },
];
const pinterestAssetByKey: Record<string, string> = {
  "e99fa784fb4d32c16628ebd94d314cff.jpg": "/manus-storage/pin-001_89593a53.jpg",
  "24fc88f13ae8ce783ebd953d032be039.jpg": "/manus-storage/pin-002_6a91b29b.jpg",
  "7a73dfbe7d54ff4459aeb680dc5cfa12.jpg": "/manus-storage/pin-003_9ea90622.jpg",
  "8d06bfc0fdfee8ddefd6bdb369a03daa.jpg": "/manus-storage/pin-004_fb292038.jpg",
  "1cb80d2f0ec1e062dd3394a309b57cc9.jpg": "/manus-storage/pin-006_f69e3175.jpg",
  "9432575321cae34c54e842034721f2cd.jpg": "/manus-storage/pin-008_c4762673.jpg",
  "ed1ed5473a998f3216774c7c8d01c2a6.jpg": "/manus-storage/pin-009_e891692f.jpg",
  "726d7a2bde4a934e61572f206ed7dbef.jpg": "/manus-storage/pin-010_7a4d1638.jpg",
  "74a605010f841d5db0d769f55519e9d4.jpg": "/manus-storage/pin-012_8d76d177.jpg",
  "2da8655a2921d3985334c1ee7130e2bb.jpg": "/manus-storage/pin-013_7004f96e.jpg",
  "a92589c544706090b6608647bcfcd4f2.jpg": "/manus-storage/pin-014_f3377de8.jpg",
  "ff25afaa17d0f60cf382c48c16236895.jpg": "/manus-storage/pin-015_f5a63017.jpg",
  "0f4b455cbf82af602e4f0078d0f0681f.jpg": "/manus-storage/pin-016_fe8a9417.jpg",
  "778df78ee8001831f3b60a21271713e3.jpg": "/manus-storage/pin-017_418a1755.jpg",
  "5e4a56d6a28475a9906f34cd4346a146.jpg": "/manus-storage/pin-018_801b226a.jpg",
  "3d42f305a5cae4fc710850fcc2725750.jpg": "/manus-storage/pin-019_21848454.jpg",
  "52edfc2c18e6cd0b3967e3a9d5fe2547.jpg": "/manus-storage/pin-020_3d6d22f1.jpg",
  "55a8fd1cdcc5476a467e072ff7d58694.jpg": "/manus-storage/pin-021_8b18f6c3.jpg",
  "1e95b89853a4a600db48d15f745f65f1.jpg": "/manus-storage/pin-022_202a1d23.jpg",
  "5e88a626d78ea723b462f16f4bef22a4.jpg": "/manus-storage/pin-023_2a525ac4.jpg",
  "771beec1ebf2baa6bf6d871c8e975925.jpg": "/manus-storage/pin-024_d6a57322.jpg",
};
const fallbackImage = pinterestFallback;

type Value = number | string | boolean;
type Tab = "busca" | "mapa" | "notas" | "atributos";
type Passage = { pid: string; name: string; tags: string[]; text: string; links: string[]; variables: string[]; images?: string[] };
type LinkOption = { label: string; target: string };
type ContentBlock = { kind: "text"; text: string } | { kind: "image"; src: string; width?: number; height?: number } | { kind: "choice"; option: LinkOption };

const passages = storyData.passages as Passage[];
const initialPassage = passages.find((passage) => passage.name.trim() === "Menu") ?? passages.find((passage) => passage.name.trim() === "Introdução") ?? passages[0];
const byName = new Map<string, Passage>(passages.map((passage) => [passage.name.trim(), passage] as [string, Passage]));
const originalLocations = ["Introdução", "Roubaram sua Adaga de Prata", "Vagou pela Estrada", "Se aproximou das Tartarugas", "Vila Om Sin Nacem", "Foi a Taverna", "fundos", "Loja"];
const mapLocations = [
  { number: 1, label: "Antes da jornada", aliases: ["Menu", "Introdução"], x: 96.5, y: 74.2 },
  { number: 2, label: "Estrada da adaga", aliases: ["Roubaram sua Adaga de Prata"], x: 76.8, y: 67.4 },
  { number: 3, label: "Estrada aberta", aliases: ["Vagou pela Estrada"], x: 72.8, y: 79.4 },
  { number: 4, label: "Encontro", aliases: ["Se aproximou das Tartarugas"], x: 56.1, y: 63.2 },
  { number: 5, label: "Vila Om Sin Nacem", aliases: ["Vila Om Sin Nacem"], x: 54.3, y: 79.8 },
  { number: 6, label: "Taverna", aliases: ["Foi a Taverna"], x: 37.3, y: 59.8 },
  { number: 7, label: "Fundos", aliases: ["fundos"], x: 76.1, y: 52.2 },
  { number: 8, label: "Loja", aliases: ["Loja"], x: 33.3, y: 74.5 },
];

function normalizeName(value: string) { return value.trim().replace(/^.*->/, "").replace(/^.*→/, "").trim(); }
function isMechanicalPassage(name: string) { return /^(Sistema de Combate|Ganhou)$/i.test(name.trim()); }
function parseLinks(passage: Passage): LinkOption[] {
  return passage.links.map((raw) => {
    const pieces = raw.split("|");
    const label = pieces[0].replace(/^\s*button:\s*/i, "").trim() || pieces[1] || raw;
    const target = normalizeName((pieces[1] ?? pieces[0]).replace(/\.$/, ""));
    return { label, target };
  }).filter((link) => byName.has(link.target) && !isMechanicalPassage(link.target) && !/sistema de combate|atributos/i.test(`${link.label} ${link.target}`));
}
function evalValue(raw: string, vars: Record<string, Value>): Value {
  const value = raw.trim().replace(/[\]\[]/g, "");
  if (/^true$/i.test(value)) return true;
  if (/^false$/i.test(value)) return false;
  if (/^[-+]?\d+(\.\d+)?$/.test(value)) return Number(value);
  const variable = value.match(/^\$([\wÀ-ÿ_]+)/);
  if (variable) return vars[variable[1]] ?? 0;
  return value.replace(/^['"]|['"]$/g, "");
}
function applySets(text: string, current: Record<string, Value>) {
  const next = { ...current };
  const patterns = [
    /\(set:\s*\$([\wÀ-ÿ_]+)\s+to\s+([^\)]+)\)/g,
    /<<set\s+\$([\wÀ-ÿ_]+)\s*=\s*([^>]+)>>/g,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const key = match[1];
      const expression = match[2].trim();
      const operation = expression.match(/^\$([\wÀ-ÿ_]+)\s*([+-])\s*(\d+(?:\.\d+)?)/);
      if (operation) {
        const base = Number(next[operation[1]] ?? 0);
        next[key] = operation[2] === "+" ? base + Number(operation[3]) : base - Number(operation[3]);
      } else next[key] = evalValue(expression, next);
    }
  }
  return next;
}
function evaluateCondition(condition: string, vars: Record<string, Value>, visited: string[]) {
  const historyMatch = condition.match(/\(history:\)\s+contains\s+["']([^"']+)/i);
  if (historyMatch) return visited.includes(historyMatch[1].trim());
  const comparison = condition.match(/\$([\wÀ-ÿ_]+)\s*(is|>=|<=|>|<|contains|doesNotContain)\s*([^\]]+)/i);
  if (!comparison) return true;
  const left = vars[comparison[1]] ?? 0;
  const right = evalValue(comparison[3], vars);
  switch (comparison[2]) {
    case "is": return left === right;
    case ">=": return Number(left) >= Number(right);
    case "<=": return Number(left) <= Number(right);
    case ">": return Number(left) > Number(right);
    case "<": return Number(left) < Number(right);
    case "contains": return String(left).includes(String(right));
    case "doesNotContain": return !String(left).includes(String(right));
    default: return true;
  }
}
function extractBracket(text: string, start: number) {
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === "[") depth += 1;
    if (text[index] === "]") {
      depth -= 1;
      if (depth === 0) return { content: text.slice(start + 1, index), end: index + 1 };
    }
  }
  return { content: text.slice(start + 1), end: text.length };
}
function resolveConditionals(raw: string, vars: Record<string, Value>, visited: string[]) {
  let text = raw;
  let match = text.match(/\(if:\s*([^\)]*)\)/i);
  while (match && match.index !== undefined) {
    const macroStart = match.index;
    const openBracket = text.indexOf("[", macroStart + match[0].length);
    if (openBracket < 0) break;
    const first = extractBracket(text, openBracket);
    const after = text.slice(first.end);
    const elseMatch = after.match(/^\s*\(else:\)\s*/i);
    let replacement = evaluateCondition(match[1], vars, visited) ? first.content : "";
    let consumed = first.end;
    if (elseMatch) {
      const elseOpen = first.end + elseMatch[0].length;
      const second = extractBracket(text, elseOpen);
      if (!evaluateCondition(match[1], vars, visited)) replacement = second.content;
      consumed = second.end;
    }
    text = text.slice(0, macroStart) + replacement + text.slice(consumed);
    match = text.match(/\(if:\s*([^\)]*)\)/i);
  }
  return text;
}
function stripTwineMacros(input: string) {
  let output = "";
  let index = 0;
  while (index < input.length) {
    if (input[index] === "(") {
      let depth = 0;
      let close = -1;
      for (let cursor = index; cursor < input.length; cursor += 1) {
        if (input[cursor] === "(") depth += 1;
        if (input[cursor] === ")") {
          depth -= 1;
          if (depth === 0) { close = cursor; break; }
        }
      }
      if (close >= 0) {
        const command = input.slice(index + 1, close).trim();
        if (/^[a-z][\w-]*\s*:/i.test(command)) { index = close + 1; continue; }
      }
    }
    output += input[index];
    index += 1;
  }
  return output;
}

function cleanStoryText(raw: string, vars: Record<string, Value>, visited: string[]) {
  return stripTwineMacros(resolveConditionals(raw, vars, visited))
    .replace(/<img[^>]*>/gi, "")
    .replace(/<!--[\\s\\S]*?-->/g, "")
    .replace(/<<[\s\S]*?>>/g, "")
    .replace(/\[\[[^\]]+\]\]/g, "")
    .replace(/(?<!\[)\[([^\]\n]+)\](?!\])/g, "$1")
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1")
    .replace(/==>\s*<==/g, "")
    .replace(/=>\s*<===/g, "")
    .replace(/^\s*(?:==>|=>)+\s*$/gm, "")
    .replace(/^\s*(?:<==|<===)+\s*$/gm, "")
    .replace(/\\(?=\s*(?:\n|$))/g, "")
    .replace(/\{\s*\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/Timérius|Timério|Timéius/g, "Ender")
    .replace(/\s+\n/g, "\n")
    .trim();
}
function resolveImage(source: string) {
  const key = source.split("/").pop() ?? "";
  return pinterestAssetByKey[key] ?? source;
}
function passageImages(passage: Passage) {
  return (passage.images ?? []).map(resolveImage);
}
function readableName(name: string) { return name.replace(/Timérius|Timério|Timéius/g, "Ender").replace(/\s+/g, " ").trim() || "Passagem"; }
function parseOriginalContent(raw: string, vars: Record<string, Value>, visited: string[]) {
  const blocks: ContentBlock[] = [];
  const tokenPattern = /<img\b[^>]*>|\[\[[^\]]+\]\]/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(raw)) !== null) {
    const token = match[0];
    const index = match.index;
    const text = cleanStoryText(raw.slice(cursor, index), vars, visited);
    if (text.trim()) blocks.push({ kind: "text", text });
    if (/^<img/i.test(token)) {
      const src = token.match(/\bsrc=["']([^"']+)["']/i)?.[1];
      if (src) {
        const widthValue = token.match(/\bwidth=["']?(\d+)/i)?.[1];
        const heightValue = token.match(/\b(?:height|heigth)=["']?(\d+)/i)?.[1];
        blocks.push({ kind: "image", src: resolveImage(src), width: widthValue ? Number(widthValue) : undefined, height: heightValue ? Number(heightValue) : undefined });
      }
    } else {
      const inner = token.slice(2, -2);
      const parts = inner.split(/\||->/);
      const target = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).trim();
      const label = (parts.length > 1 ? parts.slice(0, -1).join("|") : parts[0]).trim();
      if (target && !isMechanicalPassage(target) && !/^Atributos$/i.test(target) && !/^Atributos$/i.test(label)) blocks.push({ kind: "choice", option: { label: label || target, target: normalizeName(target) } });
    }
    cursor = index + token.length;
  }
  const tail = cleanStoryText(raw.slice(cursor), vars, visited);
  if (tail.trim()) blocks.push({ kind: "text", text: tail });
  return blocks;
}

export default function Home() {
  const [passageName, setPassageName] = useState(initialPassage.name.trim());
  const [tab, setTab] = useState<Tab>("busca");
  const [vars, setVars] = useState<Record<string, Value>>({ vida: 9, vontade: 7, força: 7, forca: 7, destreza: 5, intelecto: 7, descanso: 3, moedas: 15, tempo: 0, equipamento: "", notas: "", inventario: "Espada; adaga de prata" });
  const [visited, setVisited] = useState<string[]>([initialPassage.name.trim()]);
  const [notes, setNotes] = useState<string[]>(["Ender procura a esposa nos calabouços do Granducado de Quidrae."]);
  const [noteDraft, setNoteDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDownloads, setShowDownloads] = useState(false);
  const [platform, setPlatform] = useState("other");

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setPlatform(userAgent.includes("win") ? "windows" : userAgent.includes("mac") ? "macos" : userAgent.includes("linux") ? "linux" : "other");
  }, []);

  const passage = byName.get(passageName) ?? initialPassage;
  const options = useMemo(() => parseLinks(passage), [passage]);
  const storyText = cleanStoryText(passage.text, vars, visited);
  const contentBlocks = parseOriginalContent(passage.text, vars, visited);
  const currentMapLocation = mapLocations.find((location) => location.aliases.some((alias) => normalizeName(passageName).toLowerCase() === alias.toLowerCase())) ?? mapLocations[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [passageName]);

  function goTo(target: string) {
    const nextPassage = byName.get(target);
    if (!nextPassage) return;
    setVars((current) => applySets(nextPassage.text, current));
    setPassageName(nextPassage.name.trim());
    setVisited((current) => [...current.slice(-30), nextPassage.name.trim()]);
    if (/atribut|variáve|moeda|poção|espada|faca|escudo|adaga|missão|chave/i.test(nextPassage.name + nextPassage.text)) {
      setNotes((current) => current.includes(nextPassage.name.trim()) ? current : [...current, `Registro: ${nextPassage.name.trim()}`]);
    }
  }
  function addNote() { if (noteDraft.trim()) { setNotes((current) => [...current, noteDraft.trim()]); setNoteDraft(""); } }
  function setTool(next: Tab) { setTab(next); }
  const contextualChoices = options.filter((option) => { const targetPassage = byName.get(normalizeName(option.target)); if (!targetPassage || isMechanicalPassage(option.target) || /^Atributos$/i.test(option.label) || /^Atributos$/i.test(option.target)) return false; const tags = targetPassage.tags.map((tag) => tag.toUpperCase()); const isMenu = tags.includes("MENU") || /menu/i.test(targetPassage.name); const isSameScene = normalizeName(targetPassage.name) === normalizeName(passage.name); const hasMapContext = tags.some((tag) => ["E-1", "TARTARUGAS", "ANDAR-PELA-VILA", "BALCÃO", "LOJA", "LADRAO", "CASA-2", "ESTABELECIMENTO", "FIM"].includes(tag)); return !isMenu && !isSameScene && hasMapContext; });
  const currentLocation = readableName(passage.name);
  const visitedNames = visited.map((item) => readableName(item));
  const atmosphere = passage.tags.some((tag) => /LADRAO|COMBATE|PERIGO/i.test(tag)) ? { label: "PERIGO", tone: "danger" } : passage.tags.some((tag) => /TARTARUGAS|ESTABELECIMENTO|LOJA/i.test(tag)) ? { label: "ENCONTRO", tone: "encounter" } : passage.tags.some((tag) => /FIM|MENU/i.test(tag)) ? { label: "REGISTRO", tone: "record" } : { label: "EXPLORAÇÃO", tone: "exploration" };


  return (
    <main className="quimera-shell">
      <header className="topbar">
        <div className="brand-lockup"><img src={markImage} alt="Marca de Mundo Quimera" className="brand-mark" /><div><span className="eyebrow">MUNDO QUIMERA · STORYFILE ORIGINAL</span><h1>1 — {readableName(passage.name)}</h1></div></div>
        <div className="chapter-meta"><span>CAPÍTULO 1 · {passages.length} PASSAGENS</span><strong>Ender</strong></div>
      </header>

      <section className="game-frame">
        <div className={`dynamic-panel atmosphere-${atmosphere.tone}`}>
          <div className="panel-toolbar"><span><Compass size={16} /> {passage.tags[0] || "Rota"}</span><span>Passagem {passage.pid} · {readableName(passage.name)}</span><span className="route-code">VISITADAS {visited.length} · VARIÁVEIS {Object.keys(vars).length}</span><span className={`state-pill atmosphere-pill ${atmosphere.tone}`}><Sparkles size={14} /> {atmosphere.label}</span></div>
          <div className="panel-content inline-story-layout"><div className="field-note">FICHA DE CAMPO<br /><strong>{String(passage.pid).padStart(2, "0")}</strong><br />texto preservado</div>
            
            <div className="story-copy original-story inline-story-content"><p className="scene-kicker">REGISTRO ORIGINAL · {passage.tags.join(" · ") || "NARRATIVA"}</p><h2>{readableName(passage.name)}</h2><div className="story-text">{contentBlocks.map((block, index) => block.kind === "image" ? <div className="original-inline-image" key={`image-${index}`}><img src={block.src} width={block.width} height={block.height} style={{ width: block.width ? `${block.width}px` : undefined, height: block.height ? `${block.height}px` : undefined }} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }} alt={`Imagem original ${index + 1} de ${readableName(passage.name)}`} /></div> : block.kind === "choice" ? <div className="inline-choice" key={`choice-${index}`}><button onClick={() => goTo(block.option.target)}>{block.option.label}</button></div> : block.text.split("\n\n").map((paragraph, paragraphIndex) => <p key={`${index}-${paragraphIndex}-${paragraph.slice(0, 18)}`}>{paragraph}</p>))}</div>{options.length > 8 && <p className="more-options">+ {options.length - 8} escolhas adicionais nesta passagem</p>}</div>
          </div>
          <div className="panel-footer"><span className="passage-progress">{passage.pid} / {passages.length} · {options.length} caminhos disponíveis</span><span className="choice-hint"><Swords size={15} /> avance pelas escolhas da passagem</span></div>
        </div>

        {passageName.trim() === "Menu" && <section className="download-dossier" aria-label="Downloads do aplicativo"><div className="download-dossier-head"><div><p className="scene-kicker">VERSÃO DE CAMPO</p><h2>Levar Quimera com você</h2><p>O aplicativo desktop está sendo preparado para Windows, macOS e Linux.</p></div><button className="download-trigger" onClick={() => setShowDownloads((current) => !current)} aria-expanded={showDownloads}><Download size={18} /> {showDownloads ? "Fechar downloads" : "Baixar aplicativo"}</button></div>{showDownloads && <div className="download-grid">{desktopDownloads.map((item) => <div className={`download-card ${platform === item.key ? "recommended" : ""}`} key={item.key}><div><strong>{item.label}{platform === item.key && <em> recomendado</em>}</strong><span>{item.detail}</span></div><a href={item.href} target="_blank" rel="noreferrer" className="download-card-link"><Download size={14} /> Baixar</a></div>)}<p className="download-note">{platform !== "other" ? `Seu sistema foi identificado como ${desktopDownloads.find((item) => item.key === platform)?.label ?? "desktop"}.` : "Escolha o pacote correspondente ao seu sistema."} Os arquivos são publicados pela release oficial do projeto.</p></div>}</section>}

        <nav className="tabbar" aria-label="Ferramentas de exploração"><button className={tab === "atributos" ? "tab active" : "tab"} onClick={() => setTool("atributos")}><Shield size={20} />Atributos</button><button className={tab === "mapa" ? "tab active" : "tab"} onClick={() => setTool("mapa")}><MapIcon size={20} />Mapa</button><button className={tab === "busca" ? "tab active" : "tab"} onClick={() => setTool("busca")}><Search size={20} />Busca</button><button className={tab === "notas" ? "tab active" : "tab"} onClick={() => setTool("notas")}><FileText size={20} />Notas</button></nav>

        {tab === "mapa" && <section className="tool-panel map-view"><div className="dossier-tag">MAPA NUMERADO · QUIMERA</div><div className="map-stage numbered-map"><img src={mapImage} alt="Mapa numerado de Quimera" /><span className="map-marker" style={{ left: `${currentMapLocation.x}%`, top: `${currentMapLocation.y}%` }} title={`Ender está no ponto ${currentMapLocation.number}: ${currentMapLocation.label}`} aria-label={`Ender está no ponto ${currentMapLocation.number}: ${currentMapLocation.label}`}><span className="map-marker-core" /> <strong>{currentMapLocation.number}</strong></span></div><div className="tool-copy"><p className="scene-kicker">ATLAS DE EXPLORAÇÃO</p><h2>{currentMapLocation.label}</h2><p>Ender está marcado no ponto atual da rota. A posição começa no ponto 1 antes da jornada e acompanha as localidades reconhecidas pelas escolhas narrativas.</p><div className="map-record"><strong>POSIÇÃO</strong><span>PONTO {currentMapLocation.number}</span><strong>PASSAGEM</strong><span>{String(passage.pid).padStart(3, "0")}</span><strong>VISITADAS</strong><span>{visited.length}</span></div></div></section>}
        {tab === "busca" && <section className="tool-panel search-view"><div className="dossier-tag">BUSCA CONTEXTUAL · DESTINOS DA PASSAGEM</div><div className="tool-heading"><div><p className="scene-kicker">PONTOS PRÓXIMOS</p><h2>Onde Ender está e o que aparece ao redor.</h2></div><span className="count-badge">{contextualChoices.length} destinos</span></div><div className="context-location"><span className="selected-icon"><Compass size={18} /></span><div><strong>Você está aqui: {currentLocation}</strong><p>Locais e caminhos são determinados pelas escolhas reais desta passagem.</p></div></div><div className="location-grid contextual-grid">{contextualChoices.length > 0 ? contextualChoices.map((option, index) => <div key={`${option.target}-${index}`} className="location-card contextual-card"><span className="location-number">{index + 1}</span><strong>{readableName(option.target)}</strong><small>{option.label} · disponível pela escolha narrativa</small></div>) : <div className="empty-context"><BookOpen size={22} /><strong>Nenhum destino novo nesta passagem</strong><span>Avance pela narrativa para descobrir o próximo ponto.</span></div>}</div><div className="discovered-record"><div className="directory-heading"><strong>Locais já visitados</strong><span>{visitedNames.length} registros</span></div><div className="visited-chips">{visitedNames.slice(-8).map((name, index) => <span key={`${name}-${index}`}>{name}</span>)}</div></div></section>}
        {tab === "atributos" && <section className="tool-panel attributes-view"><div className="dossier-tag">FICHA DE PERSONAGEM · ESTADO ATUAL</div><div className="tool-heading"><div><p className="scene-kicker">ATRIBUTOS DE ENDER</p><h2>Recursos, capacidades e pertences.</h2></div><span className="count-badge">atualizado</span></div><div className="attribute-layout"><div className="attribute-card primary"><div className="attribute-card-head"><span>CONDIÇÃO</span><strong>Ender</strong></div><div className="stat-row"><div><span>VIDA</span><strong>{String(vars.vida ?? 0)}</strong></div><div><span>VONTADE</span><strong>{String(vars.vontade ?? 0)}</strong></div><div><span>DESCANSO</span><strong>{String(vars.descanso ?? 0)}</strong></div></div><div className="meter-list"><div><span>Vida</span><div className="meter"><i style={{ width: `${Math.min(100, Math.max(0, Number(vars.vida ?? 0) * 10))}%` }} /></div></div><div><span>Vontade</span><div className="meter"><i className="meter-will" style={{ width: `${Math.min(100, Math.max(0, Number(vars.vontade ?? 0) * 10))}%` }} /></div></div></div></div><div className="attribute-card"><div className="attribute-card-head"><span>CAPACIDADES</span><strong>Base</strong></div><div className="stat-grid"><div><span>FORÇA</span><strong>{String(vars.força ?? vars.forca ?? 0)}</strong></div><div><span>DESTREZA</span><strong>{String(vars.destreza ?? 0)}</strong></div><div><span>INTELECTO</span><strong>{String(vars.intelecto ?? 0)}</strong></div><div><span>TEMPO</span><strong>{String(vars.tempo ?? 0)}</strong></div></div></div><div className="attribute-card inventory-card"><div className="attribute-card-head"><span>RECURSOS</span><strong>{String(vars.moedas ?? 0)} moedas</strong></div><p><b>Equipamento</b><br />{String(vars.equipamento || "Nenhum equipamento registrado")}</p><p><b>Inventário</b><br />{String(vars.inventario || "Nenhum item registrado")}</p><p><b>Notas do storyfile</b><br />{String(vars.notas || "Nenhuma nota automática registrada")}</p></div></div></section>}
        {tab === "notas" && <section className="tool-panel notes-view"><div className="dossier-tag">CADERNO DE BORDO · REGISTRO DE CONSEQUÊNCIAS</div><div className="tool-heading"><div><p className="scene-kicker">NOTAS DE ENDER</p><h2>O que a história deixou para trás.</h2></div><span className="count-badge">{notes.length} registros</span></div><div className="notes-list">{notes.map((note, index) => <div className="note-row" key={`${note}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{note}</p></div>)}</div><div className="note-entry"><input value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addNote()} placeholder="Registrar uma pista sem alterar o texto original..." /><button onClick={addNote}>Adicionar</button></div></section>}

        <section className="status-strip"><span className="seal-mark">Q</span><div><span>VIDA</span><strong>{String(vars.vida ?? 0)}</strong></div><div><span>VONTADE</span><strong>{String(vars.vontade ?? 0)}</strong></div><div><span>FORÇA</span><strong>{String(vars.força ?? vars.forca ?? 0)}</strong></div><div><span>MOEDAS</span><strong>{String(vars.moedas ?? 0)}</strong></div><div className="objective"><Shield size={16} /><span>História original preservada · {visited.length} passagens visitadas</span></div></section>
      </section>
    </main>
  );
}
