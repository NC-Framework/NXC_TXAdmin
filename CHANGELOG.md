# Changelog

Entries are added only for genuinely user-visible or contract-relevant changes.

## Unreleased

Rewritten for the current Nexus Core architecture. The previous contents came from an
earlier iteration of the project that was never built.

**Fixed**

- **`nxc_core` was installed but never started.** It was added to the recipe's download
  tasks without a matching `ensure` in `server.cfg`. The deployment reported success, the
  files sat on disk, and the framework spine simply never ran — the quietest possible
  failure, because from the server's point of view nothing was wrong. `check-recipe.mjs`
  now fails when a Nexus resource is installed and not ensured.
- **`sv_scriptHostBind` removed.** It does not exist on Enhanced, which rejects it at
  startup with `Command not found (sv_scripthostbind)`. Carried over from a Legacy
  template. Now checked for.
- **`screenshot-basic` removed.** It ships unbuilt — its manifest declares `dist/client.js`,
  `dist/server.js` and `dist/ui.html`, none of which are in the repository — and builds them
  through the `yarn` resource from `cfx-server-data/[system]`, which is not part of the
  Enhanced minimal set. Observed failing with `Dependency "yarn" failed to load`. Nothing in
  Nexus Core uses it, so it goes rather than dragging in a build toolchain of unverified
  Enhanced compatibility.

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
