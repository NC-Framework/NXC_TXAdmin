# Changelog

Entries are added only for genuinely user-visible or contract-relevant changes.

## Unreleased

Rewritten for the current Nexus Core architecture. The previous contents came from an
earlier iteration of the project that was never built.

**Fixed**

- **The recipe would not deploy on an Enhanced server.** `$minFxVersion: 7290` rejected it
  with "this recipe requires FXServer v7290 or above". The Enhanced server is a separate
  artifact — renamed Cfx Server — that entered early access on 2026-07-21 with its own
  build numbering, below the Legacy series `7290` belongs to, so no Enhanced server could
  ever satisfy it. The key is removed, matching the official Enhanced reference recipe,
  and `check-recipe.mjs` fails if it returns.
- `$onesync` removed, matching the official Enhanced reference, which omits it where the
  Legacy reference sets it.
- CitizenFX resources are copied selectively rather than as a whole tree, again following
  the Enhanced reference. Only `mapmanager` and `spawnmanager` are taken; `basic-gamemode`
  and the demo maps are not, because Nexus Core is the gamemode.

**Removed**

- **`pma-voice`.** Enhanced's voice API is server-side only — the server owns channel
  membership, mute, and deaf state — and Cfx's stated reason is that client-controlled
  Mumble channels were a security problem. `pma-voice` wraps those client-side natives.
  Installing it would put a client-authoritative subsystem inside a server-authoritative
  framework, and nothing in Nexus Core uses voice yet, so there is no gap to cover.
  ADR-0017.

**Changed**

- **Targets GTA V Enhanced.** `sv_enforceGameBuild 3095` — a Legacy build — was removed.
  Nobody chose 3095; it was the default that came with not having decided, which is how a
  Legacy target entered the project. `check-recipe.mjs` fails if any game build is
  enforced.
- `set nxc_server_build ""` added, blank and mandatory. `nxc_core` refuses to start until
  the operator records the exact Cfx Server build the deployment runs.
- `pma-voice` is now marked temporary with an end condition. Enhanced replaces the Legacy
  Mumble integration and deprecates the compatibility natives, so `nxc_voice` becomes a
  first-party abstraction rather than a permanent wrapper. The dependency did not change;
  its reason and its expiry did.
- `nxc_core` added to the installed set.

- The recipe now downloads its base payload from this repository. The previous version
  pointed at a repository name that does not exist, so the first task failed and every
  later task depended on it.
- Attribution corrected to the project standard.
- Version set to `0.1.0`, matching a framework with one published resource.
- Server tags no longer advertise the server as QBCore.

**Removed**

- `ncframework.sql`, which created `characters`, `jobs`, `gangs`, `inventories`,
  `stashes`, `accounts`, `transactions`, and `shared_accounts`. Each belongs to a resource
  domain that owns its own migrations. Replaced by a bootstrap schema that creates only
  the migration-tracking table.
- `menuv`, a third-party Lua menu library, which conflicts with the approved React and
  TypeScript UI stack and the requirement that every player-facing surface use the shared
  design system.

**Added**

- `nxc_lib`, the first published framework resource.
- `oxmysql` pinned to an exact release rather than a moving branch.
- Recipe validation, coverage documentation, and a bootstrap schema.
