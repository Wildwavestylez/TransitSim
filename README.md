# TransitSim

A modular, browser-based transport simulation built around real-world maps and editable infrastructure.

## Vision

TransitSim aims to simulate an integrated public transport operator across real cities. The long-term scope includes trams, tram-trains, buses, regional and conventional rail, passenger journeys and transfers, timetables, fleet management, infrastructure construction, and operating finances.

The project is not tied to Ostrava or any single city. The existing `World/Ostrava.html` prototype is a source of ideas and mechanics, not the architecture we must preserve.

## Engineering principles

- **Modular by design:** infrastructure, routing, vehicles, passengers, simulation time, economy, persistence, and UI should have clear boundaries.
- **Testable core:** domain logic should run without a browser map wherever possible.
- **Real geography:** use a map as a geographic interface, while keeping the transport network as explicit domain data.
- **Infrastructure-aware routing:** each vehicle type must obey the infrastructure and access rules appropriate to it.
- **Stable simulation:** use controlled simulation updates, bounded passenger generation, and explicit lifecycle management rather than unmanaged timers and animation loops.
- **Reliable saves:** versioned save data, validation, and round-trip tests.
- **Incremental migration:** reuse proven mechanics after review; rewrite brittle implementation details instead of copying them blindly.
- **Preserve the prototype:** do not modify `Wildwavestylez/World/Ostrava.html` as part of this project without a separate, explicit reason.

## Current phase

**Phase 0 — audit and architecture.** The first deliverables are a feature inventory, known-risk register, migration plan, and a small, testable foundation. No claim is made that the original prototype's crashes have been reproduced or fully diagnosed.

See:
- [Prototype audit](docs/PROTOTYPE_AUDIT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Migration plan](docs/MIGRATION_PLAN.md)

## Planned development workflow

1. Make small, reviewable commits.
2. Add or update tests for domain behavior.
3. Run automated checks in GitHub Actions.
4. Treat a successful build as necessary but not sufficient evidence of correct gameplay.
5. Keep browser-only behavior and visual verification clearly distinguished from automated tests.

## Status

This repository is the clean foundation for the new project. The detailed gameplay specification, city selection, map editing rules, vehicle operating rules, and simulation time model will be decided as the prototype audit progresses.
