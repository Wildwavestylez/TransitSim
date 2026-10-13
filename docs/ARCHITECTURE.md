# TransitSim architecture

This is an initial architecture, not a frozen specification. The boundaries should be kept clear while implementation details evolve.

## Layers

### 1. Domain core
Plain JavaScript modules with no Leaflet, DOM, or browser rendering dependencies.

Responsibilities:
- Infrastructure graph and connectivity
- Vehicle definitions and runtime state
- Service routes and stop sequences
- Passenger demand, journeys and transfers
- Simulation clock and movement state
- Economy and construction transactions
- Save schema and migrations

### 2. Application services
Coordinate user commands and domain changes:
- Build/demolish infrastructure
- Create or edit stops and services
- Buy, assign, dispatch and withdraw vehicles
- Advance the simulation
- Save/load a validated snapshot

Services should validate a command before changing state and return explicit success/failure results.

### 3. Adapters
- Map adapter: Leaflet markers, polylines, map clicks and viewport
- Persistence adapter: browser storage initially, behind a replaceable interface
- Clock adapter: animation frame or browser scheduling only at the presentation boundary

Map layers must be a projection of domain data, not the source of truth for the transport network.

### 4. UI
HUD, construction tools, fleet/depot, service management, timetable and passenger views. UI reads application state and issues commands; it should not implement routing or economy rules itself.

## Initial module boundaries

- `src/core/ids.js` — stable IDs and ID helpers
- `src/core/network.js` — infrastructure graph and connectivity
- `src/core/routes.js` — service route validation and stop ordering
- `src/core/vehicles.js` — vehicle definitions and state invariants
- `src/core/passengers.js` — passenger demand and journey state
- `src/core/simulation.js` — deterministic simulation step/lifecycle
- `src/core/economy.js` — transactions and costs/revenue
- `src/core/save.js` — versioned serialization and validation
- `src/map/leaflet-adapter.js` — rendering and map input
- `src/ui/` — HUD, tools, panels and interaction
- `tests/` — unit and integration tests

Modules will be added when their behavior is sufficiently specified, rather than creating empty files for every future feature.

## Transport network model

The long-term network should distinguish at least:
- Infrastructure nodes and directed/undirected edges
- Infrastructure mode/type and restrictions
- Stops/platforms and their physical connections to infrastructure
- Service routes, which reference stops and legal paths
- Transfer links, with optional walking/accessibility costs
- Vehicles and their compatibility with infrastructure

A tram-train should not automatically gain access to every road or railway. Compatibility must be explicit. A bus should route over roads, and a conventional train over compatible rail infrastructure.

## Simulation model

Prefer a controlled simulation step or scheduler over an independent interval per feature. Domain time should be separate from wall-clock/rendering time. The UI may render at display frame rate, while simulation logic advances in predictable steps. This enables deterministic tests, pause/resume, speed controls later, and avoids duplicated movement loops.

The initial time scale, timetable model, dwell rules and exact vehicle physics remain design decisions.

## Save data

Use a versioned envelope, for example:
- `schemaVersion`
- `savedAt`
- `world`
- `infrastructure`
- `stops`
- `services`
- `vehicles`
- `passengers`
- `economy`
- `simulation`

Do not serialize Leaflet layers, DOM nodes, callbacks, or other runtime-only objects. Loading should validate and migrate data before replacing the active world.

## Quality gates
- Unit tests for graph, route validation, economy and save schema.
- Integration tests for a vehicle serving a route and for passenger boarding/transfers.
- Build/test checks in CI.
- Browser smoke tests when a browser automation environment is available.
