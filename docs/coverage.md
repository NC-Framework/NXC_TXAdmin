# Coverage

What the recipe installs, as it currently stands.

## Installs

| Item | Source | Note |
| --- | --- | --- |
| Base files | `NC-Framework/NC_TXAdmin` | `server.cfg`, logo, and SQL — **see conformance note C-03** |
| Database schema | `ncframework.sql` | **See conformance note C-05** |
| CitizenFX defaults | `citizenfx/cfx-server-data` | Standard server resources |
| `oxmysql` | Pinned release `v2.9.1` | The approved database driver. Pinning an exact release is correct |
| `menuv` | Pinned release `v1.4.1` | **See conformance note C-04** |
| `screenshot-basic` | `citizenfx/screenshot-basic` | Screenshot utility |
| `pma-voice` | `AvarianKnight/pma-voice` | Retained by decision; replacing it early is an explicit non-goal |

## Does not install

**Any Nexus Core framework resource.** The recipe has placeholder sections for them
("Download custom framework resources", "Additional custom resources") which are currently
empty.

`nxc_lib` is published and could be added. The remaining seven foundation resources are
not published yet, and referencing an unpublished repository would fail at deployment
while looking complete in review.

## Throttling

The recipe inserts `waste_time` pauses between download groups to avoid GitHub rate
limiting. This is correct and should be preserved as resources are added.

## Cleanup

`./tmp` is removed at the end. Good — a deployment that leaves its scratch directory
behind leaks whatever it downloaded there.
