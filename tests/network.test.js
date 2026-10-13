import { describe, expect, it } from 'vitest';
import {
  addEdge,
  addNode,
  createNetwork,
  getAdjacentEdges,
  hasPath,
  removeEdge,
} from '../src/core/network.js';

function makeNetwork() {
  const network = createNetwork();
  addNode(network, { id: 'a', x: 0, y: 0 });
  addNode(network, { id: 'b', x: 1, y: 0 });
  addNode(network, { id: 'c', x: 2, y: 0 });
  addNode(network, { id: 'isolated', x: 9, y: 9 });
  return network;
}

describe('infrastructure network', () => {
  it('adds nodes and rejects duplicate IDs', () => {
    const network = createNetwork();
    addNode(network, { id: 'a' });
    expect(() => addNode(network, { id: 'a' })).toThrow(/already exists/);
    expect(() => addNode(network, { id: '' })).toThrow(/non-empty string id/);
  });

  it('requires existing endpoints and rejects self-loops', () => {
    const network = makeNetwork();
    expect(() => addEdge(network, { id: 'bad', from: 'a', to: 'missing' })).toThrow(/endpoints/);
    expect(() => addEdge(network, { id: 'loop', from: 'a', to: 'a' })).toThrow(/Self-loop/);
  });

  it('finds paths only through connected edges', () => {
    const network = makeNetwork();
    addEdge(network, { id: 'ab', from: 'a', to: 'b', modes: ['tram'] });
    addEdge(network, { id: 'bc', from: 'b', to: 'c', modes: ['tram'] });

    expect(hasPath(network, 'a', 'c', 'tram')).toBe(true);
    expect(hasPath(network, 'a', 'isolated', 'tram')).toBe(false);
    expect(hasPath(network, 'a', 'c', 'bus')).toBe(false);
  });

  it('respects one-way edges', () => {
    const network = makeNetwork();
    addEdge(network, { id: 'ab', from: 'a', to: 'b', directed: true, modes: ['bus'] });

    expect(hasPath(network, 'a', 'b', 'bus')).toBe(true);
    expect(hasPath(network, 'b', 'a', 'bus')).toBe(false);
  });

  it('removes edges and updates connectivity', () => {
    const network = makeNetwork();
    addEdge(network, { id: 'ab', from: 'a', to: 'b', modes: ['tram'] });
    expect(hasPath(network, 'a', 'b', 'tram')).toBe(true);

    expect(removeEdge(network, 'ab')).toBe(true);
    expect(removeEdge(network, 'ab')).toBe(false);
    expect(hasPath(network, 'a', 'b', 'tram')).toBe(false);
    expect(getAdjacentEdges(network, 'a')).toHaveLength(0);
  });

  it('increments the network revision when topology changes', () => {
    const network = makeNetwork();
    const initialRevision = network.revision;
    addEdge(network, { id: 'ab', from: 'a', to: 'b' });
    expect(network.revision).toBe(initialRevision + 1);
    removeEdge(network, 'ab');
    expect(network.revision).toBe(initialRevision + 2);
  });
});
