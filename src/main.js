import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import { addEdge, addNode, createNetwork, removeEdge } from './core/network.js';

const mapElement = document.querySelector('#map');
const STORAGE_KEY = 'transitsim-world-v1';
const modeNames = { tram: 'tramvajová trať', bus: 'autobusová trasa', rail: 'železniční trať' };

if (mapElement) {
  const map = L.map(mapElement, { zoomControl: false, scrollWheelZoom: true }).setView([49.8, 15.5], 7);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  const railwayLayer = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
    attribution: 'Železniční vrstva © OpenRailwayMap contributors',
    minZoom: 2,
    maxZoom: 19,
    opacity: 0.82,
  }).addTo(map);
  const baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
  });
  L.control.layers({ 'OpenStreetMap': baseMap }, { 'Železnice': railwayLayer }, { collapsed: true, position: 'topright' }).addTo(map);

  let network = createNetwork();
  let tool = 'node';
  let selected = [];
  let nodeSequence = 1;
  let edgeSequence = 1;
  const nodeLayers = new Map();
  const edgeLayers = new Map();
  const toolNode = document.querySelector('#tool-node');
  const toolEdge = document.querySelector('#tool-edge');
  const modeSelect = document.querySelector('#network-mode');
  const message = document.querySelector('#tool-message');
  const count = document.querySelector('#network-count');
  const hint = document.querySelector('#network-hint');

  const setMessage = (text) => { message.textContent = text; };
  const persist = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        nodes: [...network.nodes.values()],
        edges: [...network.edges.values()],
        nodeSequence, edgeSequence,
      }));
    } catch { setMessage('Uložení se nepodařilo. Zkontroluj úložiště prohlížeče.'); }
  };
  const updateCounts = () => {
    count.textContent = `${network.nodes.size} uzlů · ${network.edges.size} úseků`;
    hint.textContent = selected.length ? `Vybráno uzlů: ${selected.length}` : 'Změny se ukládají v tomto prohlížeči';
  };
  const clearSelection = () => {
    selected = [];
    nodeLayers.forEach((layer) => layer.setStyle({ radius: 6, color: '#10221f', fillColor: '#57d6b2', weight: 2 }));
    updateCounts();
  };
  const selectNode = (id) => {
    if (tool !== 'edge') return;
    if (selected.includes(id)) return;
    selected.push(id);
    nodeLayers.get(id)?.setStyle({ radius: 8, color: '#fff', fillColor: '#f2b84b', weight: 3 });
    updateCounts();
    if (selected.length === 2) {
      const [from, to] = selected;
      const edgeId = `edge-${edgeSequence++}`;
      try {
        addEdge(network, { id: edgeId, from, to, modes: [modeSelect.value], directed: false });
        drawEdge(network.edges.get(edgeId));
        persist();
        setMessage(`Přidán úsek: ${modeNames[modeSelect.value]}. Vyber další dva uzly.`);
      } catch (error) {
        setMessage(error.message);
      }
      clearSelection();
    } else {
      setMessage('Vyber druhý uzel, který chceš propojit.');
    }
  };
  const drawNode = (node) => {
    const marker = L.circleMarker([node.lat, node.lng], {
      radius: 6, color: '#10221f', weight: 2, fillColor: '#57d6b2', fillOpacity: 1,
    }).addTo(map);
    marker.bindTooltip(`Uzel ${node.id.replace('node-', '')}`);
    marker.on('click', (event) => { L.DomEvent.stopPropagation(event); selectNode(node.id); });
    nodeLayers.set(node.id, marker);
  };
  const drawEdge = (edge) => {
    const a = network.nodes.get(edge.from);
    const b = network.nodes.get(edge.to);
    if (!a || !b) return;
    const color = { tram: '#e7a64a', bus: '#4e9bf5', rail: '#a78bfa' }[edge.modes[0]] || '#57d6b2';
    const line = L.polyline([[a.lat, a.lng], [b.lat, b.lng]], { color, weight: 5, opacity: 0.9 }).addTo(map);
    line.bindTooltip(modeNames[edge.modes[0]] || 'Úsek');
    line.on('click', () => {
      if (tool !== 'delete') return;
      removeEdge(network, edge.id);
      map.removeLayer(line);
      edgeLayers.delete(edge.id);
      persist();
      updateCounts();
      setMessage('Úsek byl odstraněn.');
    });
    edgeLayers.set(edge.id, line);
  };
  const redraw = () => {
    nodeLayers.forEach((layer) => map.removeLayer(layer));
    edgeLayers.forEach((layer) => map.removeLayer(layer));
    nodeLayers.clear(); edgeLayers.clear();
    network.nodes.forEach(drawNode);
    network.edges.forEach(drawEdge);
    updateCounts();
  };
  const setTool = (next) => {
    tool = next;
    selected = [];
    toolNode.classList.toggle('active', tool === 'node');
    toolEdge.classList.toggle('active', tool === 'edge');
    map.getContainer().style.cursor = tool === 'node' ? 'crosshair' : 'grab';
    setMessage(tool === 'node' ? 'Klikni do mapy a přidej uzel.' : tool === 'edge' ? 'Vyber první a potom druhý uzel.' : 'Kliknutím na úsek ho odstraníš.');
    updateCounts();
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && Array.isArray(saved.nodes) && Array.isArray(saved.edges)) {
      saved.nodes.forEach((node) => addNode(network, node));
      saved.edges.forEach((edge) => addEdge(network, edge));
      nodeSequence = saved.nodeSequence || saved.nodes.length + 1;
      edgeSequence = saved.edgeSequence || saved.edges.length + 1;
    }
  } catch {
    network = createNetwork();
    localStorage.removeItem(STORAGE_KEY);
  }
  redraw();

  map.on('click', (event) => {
    if (tool !== 'node') return;
    const id = `node-${nodeSequence++}`;
    addNode(network, { id, lat: Number(event.latlng.lat.toFixed(6)), lng: Number(event.latlng.lng.toFixed(6)) });
    drawNode(network.nodes.get(id));
    persist();
    updateCounts();
    setMessage('Uzel přidán. Přidávej další, nebo přepni na Propojit uzly.');
  });

  toolNode.addEventListener('click', () => setTool('node'));
  toolEdge.addEventListener('click', () => setTool('edge'));
  document.querySelector('#tool-delete').addEventListener('click', () => setTool('delete'));
  document.querySelector('#tool-reset').addEventListener('click', () => {
    if (network.nodes.size && !window.confirm('Opravdu smazat celou síť?')) return;
    network = createNetwork(); nodeSequence = 1; edgeSequence = 1; clearSelection(); redraw(); persist(); setTool('node');
    setMessage('Nová prázdná síť. Klikni do mapy a začni stavět.');
  });
  setTool('node');
}
