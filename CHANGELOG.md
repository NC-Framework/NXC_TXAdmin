# Changelog

Entries are added only for genuinely user-visible or contract-relevant changes.

## Unreleased

Rewritten for the current Nexus Core architecture. The previous contents came from an
earlier iteration of the project that was never built.

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
