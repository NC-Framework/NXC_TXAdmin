# Coverage

What this recipe does and does not do, as of version 0.1.0.

## Installs

| Item | Source | Pinned |
| --- | --- | --- |
| Directory structure | — | `[nexus]` and `[nexus-deps]` groups |
| `server.cfg` and logo | This repository | Branch `main` |
| Migration-tracking table | `data/schema/0001_bootstrap.sql` | — |
| CitizenFX defaults | `citizenfx/cfx-server-data` | Branch `master` |
| `oxmysql` | Release `v2.9.1` | **Yes** |
| `pma-voice` | `AvarianKnight/pma-voice` | Branch `main` |
| `screenshot-basic` | `citizenfx/screenshot-basic` | Branch `master` |
| `nxc_lib` | `NC-Framework/nxc_lib` | Branch `main` |

## Not installed

Seven foundation resources: `nxc_core`, `nxc_config`, `nxc_ui`, `nxc_zones`,
`nxc_target`, `nxc_interact`, `nxc_devtools`.

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
| Install maps, vehicles, EUP, or clothing | Assets remain external dependencies, not rewritten or redistributed by this project |
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
