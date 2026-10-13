/**
 * Small, browser-independent graph model for transport infrastructure.
 * Rendering objects (including Leaflet layers) must never be stored here.
 */

export function createNetwork() {
  return {
    nodes: new Map(),
    edges: new Map(),
    adjacency: new Map(),
    revision: 0,
  };
}

export function addNode(network, node) {
  if (!node || typeof node.id !== 'string' || node.id.trim() === '') {
    throw new TypeError('Node must have a non-empty string id.');
  }
  if (network.nodes.has(node.id)) {
    throw new Error(`Node already exists: ${node.id}`);
  }

  network.nodes.set(node.id, { ...node });
  network.adjacency.set(node.id, new Set());
  network.revision += 1;
  return network.nodes.get(node.id);
}

export function addEdge(network, edge) {
  if (!edge || typeof edge.id !== 'string' || edge.id.trim() === '') {
    throw new TypeError('Edge must have a non-empty string id.');
  }
  if (network.edges.has(edge.id)) {
    throw new Error(`Edge already exists: ${edge.id}`);
  }
  if (edge.from === edge.to) {
    throw new Error('Self-loop infrastructure edges are not supported.');
  }
  if (!network.nodes.has(edge.from) || !network.nodes.has(edge.to)) {
    throw new Error('Both edge endpoints must exist before adding an edge.');
  }

  const normalized = {
    ...edge,
    directed: edge.directed === true,
    modes: Array.isArray(edge.modes) ? [...edge.modes] : [],
  };

  network.edges.set(normalized.id, normalized);
  network.adjacency.get(normalized.from).add(normalized.id);
  if (!normalized.directed) {
    network.adjacency.get(normalized.to).add(normalized.id);
  }
  network.revision += 1;
  return normalized;
}

export function removeEdge(network, edgeId) {
  const edge = network.edges.get(edgeId);
  if (!edge) return false;

  network.adjacency.get(edge.from)?.delete(edgeId);
  network.adjacency.get(edge.to)?.delete(edgeId);
  network.edges.delete(edgeId);
  network.revision += 1;
  return true;
}

export function getAdjacentEdges(network, nodeId, mode) {
  if (!network.nodes.has(nodeId)) return [];

  const edgeIds = network.adjacency.get(nodeId) ?? new Set();
  const result = [];

  for (const edgeId of edgeIds) {
    const edge = network.edges.get(edgeId);
    if (!edge) continue;
    if (mode && !edge.modes.includes(mode)) continue;
    if (edge.directed && edge.from !== nodeId) continue;
    result.push({
      edge,
      nodeId: edge.from === nodeId ? edge.to : edge.from,
    });
  }

  return result;
}

export function hasPath(network, startId, targetId, mode) {
  if (!network.nodes.has(startId) || !network.nodes.has(targetId)) return false;
  if (startId === targetId) return true;

  const visited = new Set([startId]);
  const queue = [startId];
  let head = 0;

  while (head < queue.length) {
    const currentId = queue[head++];

    for (const adjacent of getAdjacentEdges(network, currentId, mode)) {
      if (adjacent.nodeId === targetId) return true;
      if (visited.has(adjacent.nodeId)) continue;
      visited.add(adjacent.nodeId);
      queue.push(adjacent.nodeId);
    }
  }

  return false;
}
