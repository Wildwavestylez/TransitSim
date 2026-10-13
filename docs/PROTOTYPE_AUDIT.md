# Prototype audit: `World/Ostrava.html`

**Source reviewed:** `Wildwavestylez/World`, `main/Ostrava.html`  
**Reviewed snapshot:** blob SHA `6a4cadc7b20def7c90e9d0e83e2ab28bd1e1294f`  
**Purpose:** identify reusable mechanics and migration risks. This is a static code review, not a claim that every reported failure has been reproduced at runtime.

## Existing features

| Feature | Evidence in prototype | Migration recommendation |
|---|---|---|
| Leaflet + OpenStreetMap map | Leaflet map and OSM tile layer | Reuse the map concept; isolate the map adapter from game rules |
| Track construction | Track segments, snapping, build mode, undo | Rebuild around explicit infrastructure nodes and edges |
| Tunnels | Track segments carry an `isTunnel` flag | Generalize infrastructure types and access constraints |
| Stops | Stop objects with coordinates, names, markers, and passenger queues | Separate stop domain data from Leaflet markers |
| Lines | Ordered stop lists and polylines | Model services/routes independently of their visual layers |
| Fleet | Vehicle type catalogue, purchase, assignment, capacity and speed | Create typed vehicle definitions and runtime vehicle state |
| Vehicle movement | `startTrainMovement`, `moveSegment`, `animate` | Reimplement with a controlled simulation lifecycle |
| Passenger generation | Interval-based random origin/destination generation | Replace with bounded, configurable demand generation |
| Boarding and alighting | `handlePassengerBoarding` | Split passenger decisions, stop dwell, capacity and fare handling |
| Transfers and routing | BFS and Dijkstra helpers over line stops | Build a graph-based routing service with explicit transfer costs |
| Economy | Balance, construction costs and passenger revenue | Isolate economic rules; preserve intentional balancing choices unless asked to change them |
| Save/load | JSON in `localStorage` | Introduce versioned, validated save data and round-trip tests |
| HUD and menus | Inline HTML/CSS and DOM updates | Rebuild as UI components separate from domain state |

## Confirmed code-level risks

### 1. Passenger accumulation and generation cost
The passenger generator runs on an interval and, for every stop, filters the full stop collection by geographic distance. It creates individual passenger objects without a visible global or per-stop cap. Both the repeated scanning and accumulated passenger objects can become expensive as the network grows.

**Migration:** configurable demand rate, queue limits or demand aggregation where appropriate, deterministic tests, and explicit cleanup/expiry rules. Do not invent final gameplay limits before they are agreed.

### 2. Vehicle animation lifecycle
Vehicle movement uses `requestAnimationFrame` and nested `setTimeout` calls. There is no clear cancellation token for the full movement lifecycle. Setting `isMoving = false` does not cancel already scheduled callbacks. Restarting movement after changing a line can therefore leave old callbacks alive long enough to interfere.

**Migration:** one authoritative movement controller per vehicle, explicit start/stop/dispose operations, and no duplicate simulation loops.

### 3. Route search scalability and cache invalidation
The Dijkstra implementation repeatedly scans stops and lines to discover neighbors and uses an unbounded plain-object cache. A cache-clear function exists, but its call sites must be audited before relying on it.

**Migration:** explicit graph representation, efficient adjacency lookup, bounded or versioned cache, and invalidation on every relevant network/service change.

### 4. Track path search
Track path finding uses `queue.shift()`, array-based visited checks and repeated scans of track segments. These choices can become costly for larger networks.

**Migration:** adjacency indexes and queue/set data structures appropriate to the graph size.

### 5. Save data is incomplete
The save payload omits at least vehicle passengers on board and the aggregate passenger/distance statistics, although loading attempts to read the latter. The load path defaults the balance using `data.balance || 350000000`, which treats a legitimate zero balance as missing. Save data has no schema version or validation.

**Migration:** versioned save schema, explicit nullish/default handling, validation before mutation, and tests for zero values, passengers, fleet assignments, and round trips.

### 6. Duplicate assignment function
`assignTrainToLine` is declared twice. The later declaration in the same scope supersedes the earlier function declaration and makes behavior harder to reason about.

**Migration:** one authoritative assignment service with explicit invariants and tests.

### 7. Invalid track connectivity fallback
When the track-path finder cannot establish a path, it can fall back to a straight segment between endpoints. This can make a route appear connected even if the underlying infrastructure is not.

**Migration:** route creation must fail with a useful validation result when the required network path does not exist.

### 8. Map-node lifecycle
Node markers are added to the map and coordinates are stored in `nodes`. The reviewed code does not clearly remove all associated node markers/coordinates when infrastructure is demolished. This should be verified and addressed in the new model.

### 9. Additional correctness and maintainability risks
- `switchTab` depends on the global `event` object rather than receiving the event/selected tab explicitly.
- Stop IDs based on `stops.length + 1` can be reused after deletion and may collide with remaining objects.
- Passenger routing and line topology are coupled to UI-oriented objects and string/number ID conversions.
- The prototype combines domain state, map rendering, UI generation, timers, and persistence in one script.

## Economic values: do not silently “correct”
Some displayed construction prices do not match the implementation constants. This is known to be part of the user's experimentation with balancing. Preserve the values as currently implemented only if porting the prototype's current behavior; do not change economy values during the technical migration without an explicit design decision.

## Not yet verified
- Exact conditions that reproduce the reported slowdown/crash.
- Whether every cache invalidation path is correct.
- Full browser behavior on mobile and desktop.
- Whether the original save format contains older variants not represented in the reviewed snapshot.
- Real-world route and timetable accuracy; the prototype is not yet a real transport network model.

## Acceptance criteria for the migration
- Passenger generation is bounded and configurable.
- One active movement controller exists per vehicle.
- Routing operates over explicit, validated network connections.
- A failed route search never fabricates a connection.
- Save/load preserves all persistent domain state and handles zero values.
- The core domain can be tested without Leaflet or a browser DOM.
- Automated tests run in GitHub Actions.
