// Direção Quimera em Blocos: atlas narrativo legível, molduras fortes, cores de estado e ações explícitas.
import { useMemo, useState } from "react";
import { Compass, FileText, Map, Search, ScrollText, Shield, Sparkles, Swords } from "lucide-react";

const mapImage = "/manus-storage/quimera-map-bg_59444783.jpg";
const enderImage = "/manus-storage/ender-portrait_74343876.png";
const tamiviImage = "/manus-storage/tamivi-portrait_31c4a2d8.png";
const markImage = "/manus-storage/quimera-mark_94657664.png";

type Tab = "busca" | "mapa" | "notas";
type Scene = "estrada" | "tamivi" | "consequencia";

const locations = [
  { id: 1, name: "Estrada do Ducado", type: "Rota", available: true, text: "A estrada que leva ao portão de Quidrae." },
  { id: 2, name: "Om Sin Nacem", type: "Porto", available: true, text: "Um pequeno porto e a próxima pista de Ender." },
  { id: 3, name: "Fundos da Taverna", type: "Pista", available: true, text: "Arbustos, silêncio e alguém observando." },
  { id: 4, name: "Casa do Quintal", type: "Local", available: true, text: "Um muro baixo esconde uma passagem estreita." },
  { id: 5, name: "Mercado", type: "Comércio", available: true, text: "Suprimentos, rumores e moedas trocadas." },
  { id: 6, name: "Pensão", type: "Abrigo", available: false, text: "Ainda não descoberta." },
  { id: 7, name: "Portão da Duquesa", type: "Objetivo", available: false, text: "Cinquenta moedas compram a passagem." },
  { id: 8, name: "Quidrae", type: "Destino", available: false, text: "O ducado onde a esposa de Ender está presa." },
];

const baseNotes = ["Ender procura a esposa nos calabouços de Quidrae.", "O portão da cidade exige cinquenta moedas de cobre."];

export default function Home() {
  const [tab, setTab] = useState<Tab>("busca");
  const [scene, setScene] = useState<Scene>("estrada");
  const [selectedLocation, setSelectedLocation] = useState(1);
  const [notes, setNotes] = useState(baseNotes);
  const [noteDraft, setNoteDraft] = useState("");
  const [status, setStatus] = useState("Ender está na estrada para Om Sin Nacem.");
  const [stats, setStats] = useState({ vida: 9, vontade: 7, moedas: 15 });

  const currentLocation = useMemo(() => locations.find((location) => location.id === selectedLocation) ?? locations[0], [selectedLocation]);

  function chooseNarrative(choice: "atacar" | "esperar" | "fugir") {
    if (choice === "atacar") {
      setScene("tamivi");
      setStatus("Tamivi recua um passo. O combate começa como uma leitura de intenções.");
      setStats((current) => ({ ...current, vida: Math.max(1, current.vida - 1), vontade: current.vontade + 1 }));
      setNotes((current) => [...current, "Tamivi usa telecinese e carrega uma adaga escondida."]);
    }
    if (choice === "esperar") {
      setScene("tamivi");
      setStatus("Ender espera. O ladrão revela a mão antes de revelar o nome.");
      setNotes((current) => [...current, "Esperar revelou que Tamivi está ferido."]);
    }
    if (choice === "fugir") {
      setScene("consequencia");
      setStatus("Ender deixa os fundos da taverna. A pista permanece aberta.");
      setSelectedLocation(3);
    }
  }

  function addNote() {
    if (!noteDraft.trim()) return;
    setNotes((current) => [...current, noteDraft.trim()]);
    setNoteDraft("");
  }

  return (
    <main className="quimera-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <img src={markImage} alt="Marca de Mundo Quimera" className="brand-mark" />
          <div><span className="eyebrow">MUNDO QUIMERA</span><h1>1 — A estrada até Quidrae</h1></div>
        </div>
        <div className="chapter-meta"><span>CAPÍTULO 1</span><strong>Ender</strong></div>
      </header>

      <section className="game-frame">
        <div className="dynamic-panel">
          <div className="panel-toolbar"><span><Compass size={16} /> {currentLocation.type}</span><span>{status}</span><span className="route-code">R-01 · 47°N / 12°L</span><span className="state-pill"><Sparkles size={14} /> narrativa</span></div>
          <div className="panel-content"><div className="field-note">FICHA DE CAMPO<br /><strong>Q-01</strong><br />observação ativa</div>
            {scene === "estrada" && <>
              <div className="scene-portrait"><img src={enderImage} alt="Ender, viajante exilado" /></div>
              <div className="story-copy"><p className="scene-kicker">REGISTRO DE ROTA · QUIDRAE</p><h2>O caminho não pede licença.</h2><p>Ender viaja há três meses pela estrada que sai de Canis, na costa norte de Quimera. Carrega uma espada, uma adaga de prata e a certeza de que sua esposa está presa nos calabouços de Quidrae.</p><p>Nos fundos da taverna, alguém observa entre os arbustos. A presença não parece disposta a conversar.</p></div>
            </>}
            {scene === "tamivi" && <>
              <div className="scene-portrait tamivi"><img src={tamiviImage} alt="Tamivi, ladrão misterioso" /></div>
              <div className="story-copy"><p className="scene-kicker">ENCONTRO — TAMIVI</p><h2>Leia o movimento antes da lâmina.</h2><p>Tamivi inclina o corpo e uma folha sobe do chão. Não é um truque de mão: há telecinese no ar. O ladrão parece ferido, mas ainda tem espaço para transformar uma conversa em fuga.</p><div className="choice-list"><button onClick={() => { setStatus("Ender desequilibra Tamivi e recupera a adaga."); setNotes((current) => [...current, "A adaga de Ender foi recuperada."]); }}>Desequilibrar Tamivi</button><button onClick={() => { setStatus("Tamivi escapa entre as árvores, deixando a bolsa para trás."); setStats((current) => ({ ...current, moedas: current.moedas + 2 })); }}>Pegar a bolsa de moedas</button><button onClick={() => { setScene("consequencia"); setStatus("Ender encerra o confronto antes que a ferida piore."); }}>Sair dali</button></div></div>
            </>}
            {scene === "consequencia" && <div className="consequence"><div className="event-stamp"><Swords size={25} /> COMBATE NARRATIVO</div><h2>A consequência fica no mapa.</h2><p>Ender não venceu por números. Ele escolheu o momento, leu o medo de Tamivi e saiu com uma pista — talvez uma adaga, talvez uma bolsa, talvez apenas a certeza de que não está sozinho nesta estrada.</p><button className="primary-action" onClick={() => { setScene("estrada"); setStatus("Ender está na estrada para Om Sin Nacem."); }}>Continuar a viagem</button></div>}
          </div>
          <div className="panel-footer"><button className="arrow-btn" onClick={() => setScene("estrada")} aria-label="Voltar">←</button><span>Passagem {scene === "estrada" ? "1" : scene === "tamivi" ? "2" : "3"} de 3</span><button className="arrow-btn" onClick={() => setScene(scene === "estrada" ? "tamivi" : scene === "tamivi" ? "consequencia" : "estrada")} aria-label="Avançar">→</button></div>
        </div>

        <nav className="tabbar" aria-label="Ferramentas de exploração">
          <button className={tab === "mapa" ? "tab active" : "tab"} onClick={() => setTab("mapa")}><Map size={20} />Mapa</button>
          <button className={tab === "busca" ? "tab active" : "tab"} onClick={() => setTab("busca")}><Search size={20} />Busca</button>
          <button className={tab === "notas" ? "tab active" : "tab"} onClick={() => setTab("notas")}><FileText size={20} />Notas</button>
        </nav>

        {tab === "mapa" && <section className="tool-panel map-view"><div className="dossier-tag">MAPA-MÃE · FOLHA 01</div><div className="map-image-wrap"><img src={mapImage} alt="Mapa ilustrado de Quimera" /><span className="map-pin pin-one">1</span><span className="map-pin pin-three">3</span><span className="map-pin pin-seven">7</span></div><div className="tool-copy"><p className="scene-kicker">MAPA DE QUIMERA</p><h2>Você está aqui: estrada do ducado.</h2><p>Os locais descobertos ficam marcados em laranja. O próximo objetivo está além do portão.</p></div></section>}
        {tab === "busca" && <section className="tool-panel search-view"><div className="dossier-tag">ÍNDICE DE LOCAIS · REGISTRO DE ENDEREÇOS</div><div className="tool-heading"><div><p className="scene-kicker">BUSCA DE LOCAIS</p><h2>Escolha um lugar para investigar.</h2></div><span className="count-badge">{locations.filter((location) => location.available).length} descobertos</span></div><div className="location-grid">{locations.map((location) => <button key={location.id} className={location.id === selectedLocation ? "location-card selected" : "location-card"} disabled={!location.available} onClick={() => { setSelectedLocation(location.id); setStatus(`Ender observa ${location.name.toLowerCase()}.`); }}><span className="location-number">{location.id}</span><strong>{location.name}</strong><small>{location.available ? location.type : "bloqueado"}</small></button>)}</div><div className="selected-location"><span className="selected-icon"><ScrollText size={18} /></span><div><strong>{currentLocation.name}</strong><p>{currentLocation.text}</p></div></div></section>}
        {tab === "notas" && <section className="tool-panel notes-view"><div className="dossier-tag">CADERNO DE BORDO · ANOTAÇÕES DE CAMPO</div><div className="tool-heading"><div><p className="scene-kicker">CADERNO DE ENDER</p><h2>Notas da investigação.</h2></div><span className="count-badge">{notes.length} registros</span></div><div className="notes-list">{notes.map((note, index) => <div className="note-row" key={`${note}-${index}`}><span>0{index + 1}</span><p>{note}</p></div>)}</div><div className="note-entry"><input value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addNote()} placeholder="Registrar uma nova pista..." /><button onClick={addNote}>Adicionar</button></div></section>}

        <div className="status-strip"><span className="seal-mark">Q</span><div><span>VIDA</span><strong>{stats.vida}/9</strong></div><div><span>VONTADE</span><strong>{stats.vontade}/7</strong></div><div><span>MOEDAS</span><strong>{stats.moedas}</strong></div><div className="objective"><Shield size={16} /><span>Objetivo: alcançar Quidrae</span></div></div>
      </section>
    </main>
  );
}
