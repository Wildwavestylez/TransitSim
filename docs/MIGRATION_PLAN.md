# Migration plan

## Phase 0 — Audit and scope
- [x] Review the current `Ostrava.html` structure and major mechanics.
- [x] Record confirmed code-level risks and migration recommendations.
- [x] Define initial architecture boundaries.
- [ ] Agree on the first playable vertical slice.

## Phase 1 — Testable foundation
- [ ] Establish the build and test toolchain.
- [ ] Implement a small, browser-independent infrastructure graph.
- [ ] Add tests for node/edge creation, connectivity, and invalid endpoints.
- [ ] Add CI checks for tests and production build.
- [ ] Create a minimal map shell only after the domain foundation is in place.

## Phase 2 — First playable vertical slice
Target: one small area of a real map, editable compatible infrastructure, two stops, one service, one vehicle, deterministic movement, and a basic save/load round trip.

- [ ] Choose the initial city/area and map source.
- [ ] Decide the initial infrastructure type and build/edit rules.
- [ ] Render domain infrastructure on the map.
- [ ] Validate a service against actual network connectivity.
- [ ] Run one vehicle without duplicate loops.
- [ ] Save/load the world and verify persistent state.

## Phase 3 — Passenger operation
- [ ] Add configurable demand generation and queue limits.
- [ ] Add vehicle capacity, boarding and alighting.
- [ ] Add journey paths and transfer rules.
- [ ] Add tests for unreachable destinations and full vehicles.

## Phase 4 — Integrated operator
- [ ] Add a second infrastructure/vehicle mode.
- [ ] Define mode compatibility and interchange rules.
- [ ] Add schedules, dwell time and service frequency.
- [ ] Expand depot/fleet, service management, and operational reporting.

## Phase 5 — Larger networks and polish
- [ ] Profile with large synthetic networks.
- [ ] Add map/graph indexes and cache strategy based on measured bottlenecks.
- [ ] Add robust save migrations and recovery behavior.
- [ ] Add browser-level regression tests and responsive UI.
- [ ] Evaluate hosting/deployment and performance budgets.

## Migration rule
Do not port a prototype function verbatim merely because it exists. First define its domain contract, then reuse the useful behavior, remove UI/map coupling, and add tests. Keep the original prototype unchanged as a reference.

## Next decision needed
Before building the first playable slice, agree on the first city/area and what the player can modify in it (for example, adding/removing stops, laying new infrastructure, or editing services). This affects map constraints and the domain model.
