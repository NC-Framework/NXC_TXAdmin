# NXC_TXAdmin

txAdmin deployment recipe for **Nexus Core**.

- Homepage: <https://nxcframework.net>
- Development team: The Nexus Core Framework team

---

> ## Not ready for production
>
> Nexus Core is in **Phase 1** of eleven. One framework resource — `nxc_lib` — is
> published. There is no character system, no inventory, no banking, and no gameplay.
>
> This recipe exists so the deployment path is built alongside the framework rather than
> bolted on at the end.

## Contents

| File | Purpose |
| --- | --- |
| `NexusCore.yml` | The txAdmin recipe |
| `server.cfg` | Server configuration template, with txAdmin substitution tokens |
| `ncframework.sql` | Database schema applied at deployment |
| `myLogo.png` | Server logo |
| `scripts/check-recipe.mjs` | Validation: repository references, credentials, attribution |
| `docs/coverage.md` | What the recipe installs |
| `docs/conformance.md` | **Where the recipe currently differs from the project standards** |

## Using it

In txAdmin, choose **Remote URL** during setup and supply the raw URL of the recipe:

```text
https://raw.githubusercontent.com/NC-Framework/NXC_TXAdmin/main/NexusCore.yml
```

## After deployment

The recipe cannot supply secrets and does not try to. Fill in the database connection and
your FiveM license key on the server.

**Never commit a filled-in configuration.** A credential in a repository is published, and
rotation is the only remedy.

## Validation

```bash
npm run check
```

Checks that every referenced repository is one this project publishes or has approved,
that no committed file contains a real credential, and that attribution matches the
project standard.

**This check currently fails.** The differences are catalogued in
[`docs/conformance.md`](docs/conformance.md) and are for the project owner to resolve —
several are design decisions, not defects.

## Licence

**None selected.** No licence grant is offered or implied.
