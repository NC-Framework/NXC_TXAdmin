# Changelog

Entries are added only for genuinely user-visible or contract-relevant changes.

## Unreleased

Rewritten for the current Nexus Core architecture. The previous contents came from an
earlier iteration of the project that was never built.

**Changed**

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
