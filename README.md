# NXC_TXAdmin

txAdmin deployment recipe for **Nexus Core**.

- Homepage: <https://nxcframework.net>
- Development team: The Nexus Core Framework team

---

> ## Not ready for production
>
> Nexus Core is in **Phase 1** of eleven. Two framework resources — `nxc_lib` and
> `nxc_core` — are published. There is no character system, no inventory, no banking, no
> jobs, and no gameplay.
>
> This recipe exists so the deployment path is built alongside the framework rather than
> bolted on at the end. It is useful for development environments and nothing else.

> ## Requires GTA V Enhanced
>
> Nexus Core targets **FiveM for GTA V Enhanced** and the Enhanced Cfx Server runtime.
>
> **This recipe cannot install or verify the server artifacts.** txAdmin runs a recipe on
> a server that already exists, so having installed Enhanced Cfx Server artifacts is
> yours to do. Deploying this onto a Legacy FXServer will appear to succeed.
>
> The recipe declares no `$minFxVersion` and enforces no game build. Both previously
> carried Legacy-series values — `7290` and `3095` — and the first of those is what made
> the recipe undeployable on Enhanced. `check-recipe.mjs` fails if either returns.
>
> It also requires you to record the exact server build in `server.cfg`; `nxc_core` refuses
> to start until you do, so a platform regression can be traced to a specific update rather
> than to whatever changed most recently.
>
> **No voice resource is installed.** Enhanced's voice API is server-side only, and
> `pma-voice` wraps the deprecated client-side Mumble natives. `nxc_voice` will target the
> Enhanced API directly.
>
> See [`docs/coverage.md`](docs/coverage.md).

## Using it

In txAdmin, choose **Remote URL** during setup and supply the raw recipe URL:

```text
https://raw.githubusercontent.com/NC-Framework/NXC_TXAdmin/main/NexusCore.yml
```

txAdmin prompts for database credentials and runs the recipe.

## What it installs

| Component | Source | Note |
| --- | --- | --- |
| CitizenFX defaults | `citizenfx/cfx-server-data` | Standard server resources |
| `oxmysql` | Pinned release `v2.9.1` | The approved database driver |
| `pma-voice` | `AvarianKnight/pma-voice` | Retained by decision |
| `screenshot-basic` | `citizenfx/screenshot-basic` | Screenshot utility |
| `nxc_lib` | `NC-Framework/nxc_lib` | Shared primitives |
| Migration table | `data/schema/0001_bootstrap.sql` | **Only** the migration tracker |
| `server.cfg` | `data/server.cfg.template` | Correct start order, blank operator values |

Seven foundation resources — `nxc_core`, `nxc_config`, `nxc_ui`, `nxc_zones`,
`nxc_target`, `nxc_interact`, `nxc_devtools` — are **not installed** because they are not
yet implemented. See [`docs/coverage.md`](docs/coverage.md).

## The schema creates one table

Only `nxc_migrations`. Every other table belongs to a resource domain, and each resource
applies its own migrations at startup.

A deployment recipe that created `characters`, `accounts`, or `inventories` would be
writing state it does not own, and its schema would drift from the owning resource's
migrations with neither being authoritative.

## After deployment

The recipe cannot supply secrets and does not try to. Open `server.cfg` and fill in every
value marked **OPERATOR MUST SUPPLY**:

| Value | Note |
| --- | --- |
| `mysql_connection_string` | Your database |
| `nxc_token_signing_key` | Unique per environment; rotating invalidates live sessions |
| `sv_licenseKey` | Supplied by txAdmin during setup |

**Never commit a filled-in `server.cfg`.**

## Configuration after deployment

Almost nothing is configured by editing files. Operational values — business hours,
payouts, prices, target locations, dispatch rules, feature flags — are registered by each
resource and edited in game through a permission-controlled interface.

Static configuration carries only bootstrap values: the database connection, environment
identity, startup mode, log level, and the development-mode switch.

## Validation

```bash
npm run check
```

Asserts that every referenced repository is one this project publishes or has approved,
that every referenced file exists, that no committed file contains a credential, that
operator values are blank, and that attribution matches the project standard.

## Licence

**None selected.** No licence grant is offered or implied.
