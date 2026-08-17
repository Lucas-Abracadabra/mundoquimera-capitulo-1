// Direção Quimera em Blocos: o aplicativo apresenta o storyfile original como um atlas narrativo, mantendo texto, caminhos e variáveis.
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Compass, FileText, Map as MapIcon, Search, Shield, Sparkles, Swords } from "lucide-react";
import storyData from "@/data/storyMap.json";

const mapImage = "/manus-storage/pin-003_9ea90622.jpg";
const markImage = "/manus-storage/quimera-mark_94657664.png";
const pinterestFallback = "/manus-storage/pin-002_6a91b29b.jpg";
const pinterestAssetByKey: Record<string, string> = {
  "7a73dfbe7d54ff4459aeb680dc5cfa12.jpg": "/manus-storage/pin-003_9ea90622.jpg",
  "ff25afaa17d0f60cf382c48c16236895.jpg": "/manus-storage/pin-015_f5a63017.jpg",
  "0f4b455cbf82af602e4f0078d0f0681f.jpg": "/manus-storage/pin-016_fe8a9417.jpg",
  "3d42f305a5cae4fc710850fcc2725750.jpg": "/manus-storage/pin-019_21848454.jpg",
};
const fallbackImage = pinterestFallback;

type Value = number | string | boolean;
type Tab = "busca" | "mapa" | "notas" | "atributos";
type Passage = { pid: string; name: string; tags: string[]; text: string; links: string[]; variables: string[] };
type LinkOption = { label: string; target: string };

const passages = storyData.passages as Passage[];
const initialPassage = passages.find((passage) => passage.name.trim() === "Introdução") ?? passages[0];
const byName = new Map<string, Passage>(passages.map((passage) => [passage.name.trim(), passage] as [string, Passage]));
const originalLocations = ["Introdução", "Roubaram sua Adaga de Prata", "Vagou pela Estrada", "Se aproximou das Tartarugas", "Vila Om Sin Nacem", "Foi a Taverna", "fundos", "Loja"];

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
function cleanStoryText(raw: string, vars: Record<string, Value>, visited: string[]) {
  return resolveConditionals(raw, vars, visited)
    .replace(/<img[^>]*>/gi, "")
    .replace(/<!--[\\s\\S]*?-->/g, "")
    .replace(/<<[^>]*>>/g, "")
    .replace(/\(set:[^\)]*\)/gi, "")
    .replace(/\((?:button|click|link-goto|link|go-to|replace|append|else-if|else|if|either|history|text-colour|bg|meter|cacheaudio)[^\)]*\)/gi, "")
    .replace(/\[\[[^\]]+\]\]/g, "")
    .replace(/==>\s*<==/g, "")
    .replace(/\{\s*\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/Timérius|Timério|Timéius/g, "Ender")
    .replace(/\s+\n/g, "\n")
    .trim();
}
function firstImage(raw: string) {
  const source = raw.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;
  if (!source) return null;
  const key = source.split("/").pop() ?? "";
  return pinterestAssetByKey[key] ?? source;
}
function readableName(name: string) { return name.replace(/Timérius|Timério|Timéius/g, "Ender").replace(/\s+/g, " ").trim() || "Passagem"; }

export default function Home() {
  const [passageName, setPassageName] = useState(initialPassage.name.trim());
  const [tab, setTab] = useState<Tab>("busca");
  const [vars, setVars] = useState<Record<string, Value>>({ vida: 9, vontade: 7, força: 7, forca: 7, destreza: 5, intelecto: 7, descanso: 3, moedas: 15, tempo: 0, equipamento: "", notas: "", inventario: "Espada; adaga de prata" });
  const [visited, setVisited] = useState<string[]>([initialPassage.name.trim()]);
  const [notes, setNotes] = useState<string[]>(["Ender procura a esposa nos calabouços do Granducado de Quidrae."]);
  const [noteDraft, setNoteDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const passage = byName.get(passageName) ?? initialPassage;
  const options = useMemo(() => parseLinks(passage), [passage]);
  const storyText = cleanStoryText(passage.text, vars, visited);
  const image = firstImage(passage.text);
  const locationIndex = Math.max(0, originalLocations.findIndex((name) => name === passageName));

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

  return (
    <main className="quimera-shell">
      <header className="topbar">
        <div className="brand-lockup"><img src={markImage} alt="Marca de Mundo Quimera" className="brand-mark" /><div><span className="eyebrow">MUNDO QUIMERA · STORYFILE ORIGINAL</span><h1>1 — {readableName(passage.name)}</h1></div></div>
        <div className="chapter-meta"><span>CAPÍTULO 1 · {passages.length} PASSAGENS</span><strong>Ender</strong><button className="attribute-launcher" onClick={() => setTool("atributos")}><Shield size={15} /> Atributos</button></div>
      </header>

      <section className="game-frame">
        <div className="dynamic-panel">
          <div className="panel-toolbar"><span><Compass size={16} /> {passage.tags[0] || "Rota"}</span><span>Passagem {passage.pid} · {readableName(passage.name)}</span><span className="route-code">VISITADAS {visited.length} · VARIÁVEIS {Object.keys(vars).length}</span><span className="state-pill"><Sparkles size={14} /> original</span></div>
          <div className="panel-content"><div className="field-note">FICHA DE CAMPO<br /><strong>{String(passage.pid).padStart(2, "0")}</strong><br />texto preservado</div>
            <div className="scene-portrait">{image ? <img src={image} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }} alt={`Ilustração original de ${readableName(passage.name)}`} /> : <div className="portrait-placeholder"><BookOpen size={44} /><span>PASSAGEM<br />SEM ILUSTRAÇÃO</span></div>}</div>
            <div className="story-copy original-story"><p className="scene-kicker">REGISTRO ORIGINAL · {passage.tags.join(" · ") || "NARRATIVA"}</p><h2>{readableName(passage.name)}</h2><div className="story-text">{storyText.split("\n\n").map((paragraph, index) => <p key={`${paragraph.slice(0, 20)}-${index}`}>{paragraph}</p>)}</div><div className="choice-list">{options.slice(0, 8).map((option) => <button key={`${option.label}-${option.target}`} onClick={() => goTo(option.target)}>{option.label}</button>)}</div>{options.length > 8 && <p className="more-options">+ {options.length - 8} escolhas adicionais nesta passagem</p>}</div>
          </div>
          <div className="panel-footer"><span className="passage-progress">{passage.pid} / {passages.length} · {options.length} caminhos disponíveis</span><span className="choice-hint"><Swords size={15} /> avance pelas escolhas da passagem</span></div>
        </div>

        <nav className="tabbar" aria-label="Ferramentas de exploração"><button className={tab === "atributos" ? "tab active" : "tab"} onClick={() => setTool("atributos")}><Shield size={20} />Atributos</button><button className={tab === "mapa" ? "tab active" : "tab"} onClick={() => setTool("mapa")}><MapIcon size={20} />Mapa</button><button className={tab === "busca" ? "tab active" : "tab"} onClick={() => setTool("busca")}><Search size={20} />Busca</button><button className={tab === "notas" ? "tab active" : "tab"} onClick={() => setTool("notas")}><FileText size={20} />Notas</button></nav>

        {tab === "mapa" && <section className="tool-panel map-view"><div className="dossier-tag">MAPA-MÃE · PASSAGENS DO STORYFILE</div><div className="map-image-wrap"><img src={mapImage} alt="Mapa ilustrado de Quimera" /><span className="map-pin pin-one">{String(passage.pid).slice(-1)}</span><span className="map-pin pin-three">{Math.max(1, locationIndex + 1)}</span><span className="map-pin pin-seven">Q</span></div><div className="tool-copy"><p className="scene-kicker">ATLAS DE EXPLORAÇÃO</p><h2>{readableName(passage.name)}</h2><p>O mapa permanece como camada de orientação enquanto a passagem original conduz o próximo movimento de Ender.</p><div className="map-record"><strong>VISITADAS</strong><span>{visited.length} passagens</span><strong>CAMINHOS</strong><span>{options.length} disponíveis</span></div></div></section>}
        {tab === "busca" && <section className="tool-panel search-view"><div className="dossier-tag">ÍNDICE DE LOCAIS · PASSAGENS ORIGINAIS</div><div className="tool-heading"><div><p className="scene-kicker">BUSCA DE PASSAGENS</p><h2>Escolha um lugar ou momento para investigar.</h2></div><span className="count-badge">{passages.length} registros</span></div><div className="location-grid">{originalLocations.map((name, index) => { const exists = byName.has(name); return <button key={name} className={name === passageName ? "location-card selected" : "location-card"} disabled={!exists} onClick={() => exists && goTo(name)}><span className="location-number">{index + 1}</span><strong>{readableName(name)}</strong><small>{exists ? (byName.get(name)?.tags[0] || "narrativa") : "em investigação"}</small></button>; })}</div><div className="passage-directory"><div className="directory-heading"><strong>Índice integral do capítulo</strong><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Buscar por nome, tag ou número..." /></div><div className="directory-list">{passages.filter((item) => !isMechanicalPassage(item.name) && `${item.pid} ${item.name} ${item.tags.join(" ")}`.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => <button key={`${item.pid}-${item.name}`} className={item.name.trim() === passageName ? "directory-item current" : "directory-item"} onClick={() => goTo(item.name.trim())}><span>{item.pid.padStart(3, "0")}</span><strong>{readableName(item.name)}</strong><small>{item.tags.join(" · ") || "sem tag"}</small></button>)}</div></div><div className="selected-location"><span className="selected-icon"><BookOpen size={18} /></span><div><strong>{readableName(passage.name)}</strong><p>{passage.tags.length ? `Tags originais: ${passage.tags.join(", ")}.` : "Passagem sem tag registrada no storyfile."}</p></div></div></section>}
        {tab === "atributos" && <section className="tool-panel attributes-view"><div className="dossier-tag">FICHA DE PERSONAGEM · ESTADO ATUAL</div><div className="tool-heading"><div><p className="scene-kicker">ATRIBUTOS DE ENDER</p><h2>Recursos, capacidades e pertences.</h2></div><span className="count-badge">atualizado</span></div><div className="attribute-layout"><div className="attribute-card primary"><div className="attribute-card-head"><span>CONDIÇÃO</span><strong>Ender</strong></div><div className="stat-row"><div><span>VIDA</span><strong>{String(vars.vida ?? 0)}</strong></div><div><span>VONTADE</span><strong>{String(vars.vontade ?? 0)}</strong></div><div><span>DESCANSO</span><strong>{String(vars.descanso ?? 0)}</strong></div></div><div className="meter-list"><div><span>Vida</span><div className="meter"><i style={{ width: `${Math.min(100, Math.max(0, Number(vars.vida ?? 0) * 10))}%` }} /></div></div><div><span>Vontade</span><div className="meter"><i className="meter-will" style={{ width: `${Math.min(100, Math.max(0, Number(vars.vontade ?? 0) * 10))}%` }} /></div></div></div></div><div className="attribute-card"><div className="attribute-card-head"><span>CAPACIDADES</span><strong>Base</strong></div><div className="stat-grid"><div><span>FORÇA</span><strong>{String(vars.força ?? vars.forca ?? 0)}</strong></div><div><span>DESTREZA</span><strong>{String(vars.destreza ?? 0)}</strong></div><div><span>INTELECTO</span><strong>{String(vars.intelecto ?? 0)}</strong></div><div><span>TEMPO</span><strong>{String(vars.tempo ?? 0)}</strong></div></div></div><div className="attribute-card inventory-card"><div className="attribute-card-head"><span>RECURSOS</span><strong>{String(vars.moedas ?? 0)} moedas</strong></div><p><b>Equipamento</b><br />{String(vars.equipamento || "Nenhum equipamento registrado")}</p><p><b>Inventário</b><br />{String(vars.inventario || "Nenhum item registrado")}</p><p><b>Notas do storyfile</b><br />{String(vars.notas || "Nenhuma nota automática registrada")}</p></div></div></section>}
        {tab === "notas" && <section className="tool-panel notes-view"><div className="dossier-tag">CADERNO DE BORDO · REGISTRO DE CONSEQUÊNCIAS</div><div className="tool-heading"><div><p className="scene-kicker">NOTAS DE ENDER</p><h2>O que a história deixou para trás.</h2></div><span className="count-badge">{notes.length} registros</span></div><div className="notes-list">{notes.map((note, index) => <div className="note-row" key={`${note}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{note}</p></div>)}</div><div className="note-entry"><input value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addNote()} placeholder="Registrar uma pista sem alterar o texto original..." /><button onClick={addNote}>Adicionar</button></div></section>}

        <section className="status-strip"><span className="seal-mark">Q</span><div><span>VIDA</span><strong>{String(vars.vida ?? 0)}</strong></div><div><span>VONTADE</span><strong>{String(vars.vontade ?? 0)}</strong></div><div><span>FORÇA</span><strong>{String(vars.força ?? vars.forca ?? 0)}</strong></div><div><span>MOEDAS</span><strong>{String(vars.moedas ?? 0)}</strong></div><div className="objective"><Shield size={16} /><span>História original preservada · {visited.length} passagens visitadas</span></div></section>
      </section>
    </main>
  );
}
