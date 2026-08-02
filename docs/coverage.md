# Coverage

What this recipe does and does not do, as of version 0.1.0.

## Installs

| Item | Source | Pinned |
| --- | --- | --- |
| Directory structure | — | `[nexus]` and `[nexus-deps]` groups |
| `server.cfg` and logo | This repository | Branch `main` |
| Migration-tracking table | `data/schema/0001_bootstrap.sql` | — |
| `mapmanager`, `spawnmanager` | `citizenfx/cfx-server-data` | Branch `master` |
| `oxmysql` | Release `v2.9.1` | **Yes** |
| `screenshot-basic` | `citizenfx/screenshot-basic` | Branch `master` |
| `nxc_lib` | `NC-Framework/nxc_lib` | Branch `main` |
| `nxc_core` | `NC-Framework/nxc_core` | Branch `main` |

## Platform

**This recipe targets FiveM for GTA V Enhanced** and the Enhanced Cfx Server runtime (ADR-0016,
MDD v0.4 section 38).

**It cannot install or verify the server artifacts.** A txAdmin recipe runs on a server that already
exists; it provisions resources and configuration, not the binary. Deploying this onto a Legacy FXServer
will appear to succeed, and will not be supported.

What the recipe does about the platform, given that limit:

| Does | Detail |
| --- | --- |
| Declares no `$minFxVersion` | It read `7290`, a Legacy-series build, and **this is what broke deployment on Enhanced**. The Enhanced server is a separate artifact with its own numbering, so a Legacy minimum can never be met. `check-recipe.mjs` fails if it returns |
| Enforces no game build | `sv_enforceGameBuild 3095` — a Legacy build — was removed. `check-recipe.mjs` fails if it returns |
| Copies CitizenFX resources selectively | The official Enhanced reference recipe names resources one at a time instead of dropping the whole `cfx-server-data` tree in. Only `mapmanager` and `spawnmanager` are taken |
| Installs no voice resource | Enhanced voice is server-side only. `pma-voice` wraps the deprecated client-side Mumble natives and was removed (ADR-0017) |
| Requires the build be recorded | `set nxc_server_build ""` is blank and mandatory; `nxc_core` refuses to start until the operator fills it in (MDD v0.4 38.2) |
| Marks `pma-voice` temporary | Enhanced replaces the Legacy Mumble integration. `pma-voice` stays only until `nxc_voice` exists (§38.5) |

| Does not | Why |
| --- | --- |
| Install Enhanced artifacts | Outside a recipe's reach — txAdmin runs on an existing server |
| Verify the edition at runtime | A build number does not carry its edition. Gate check P1-E02 verifies it on real hardware |
| Pin a minimum server build | No build has been named. OD-020, blocker B-11 |

## Not installed

Six foundation resources: `nxc_config`, `nxc_ui`, `nxc_zones`, `nxc_target`, `nxc_interact`,
`nxc_devtools`.

Their repositories exist and are scaffolded, but the resources are **not implemented**.
Installing an empty resource would produce a server that starts and does nothing, which
is harder to diagnose than one where the resource is absent.

Each is added here as it is released.

## Does not do

| Not done | Why |
| --- | --- |
| Supply secrets | A recipe cannot know them, and a committed credential is a published one |
| Create domain tables | Every table belongs to one resource domain; each resource applies its own migrations |
| Configure gameplay | Operational configuration is registered by each resource and edited in game |
| Install maps, vehicles, EUP, or clothing | Assets remain external dependencies, not rewritten or redistributed by this project. On Enhanced they are additionally **unverified until tested** (MDD v0.4 38.7) |
| Install a UI menu library | The approved UI stack is React and TypeScript through the shared design system |

## Pinning

`oxmysql` is pinned to an exact release. Everything else currently tracks a moving branch,
which means two deployments a week apart can install different code.

That is acceptable during Phase 1, when nothing is stable anyway. **It stops being
acceptable once a compatibility set exists**: a set names exact versions verified to work
together, and a recipe that ignores them cannot deliver what the set promises.

Recorded in ADR-0010 as an outstanding requirement.

## Start order

`server.cfg` lists resources in dependency order. The full foundation order is:

```text
oxmysql -> nxc_lib -> nxc_core -> nxc_config -> nxc_ui -> nxc_zones
        -> nxc_target -> nxc_interact -> nxc_devtools
```

Only published resources appear. The order is maintained by hand today; once a
compatibility set exists it should be generated from the dependency graph, because a
hand-maintained order drifts and the drift is invisible until a resource fails to start.
