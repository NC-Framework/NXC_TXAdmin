# Conformance

Where this recipe currently differs from the Nexus Core project standards.

**Nothing in this document has been changed in the recipe.** Several items are design
decisions that only the project owner can make, and silently "fixing" them would be a
worse outcome than recording them. This is a list for a decision, not a list of defects.

Standards referenced live in `NC-Framework/nxc-core-governance`.

---

## C-01 — Attribution does not match the required author string

**Current:** `author: Nexus Core Team`
**Required:** `The Nexus Core Framework team`

The author string is fixed project-wide and appears in the generated server hostname via
`{{recipeAuthor}}`, so this is visible to every player on the server list.

**Fix:** one line in `NexusCore.yml`.

---

## C-02 — Version claims 1.0.0

**Current:** `version: 1.0.0`

Under the project versioning standard, `1.0.0` means contracts are stable enough for
external consumers to pin confidently. The framework is at Phase 1 with one published
resource.

The version is also rendered into the server description, so it is a public claim about
maturity.

**Fix:** `0.1.0`, incrementing as the recipe gains resources.

---

## C-03 — The recipe downloads from `NC_TXAdmin`, but this repository is `NXC_TXAdmin`

**Current:**

```yaml
- action: download_github
  src: https://github.com/NC-Framework/NC_TXAdmin
```

This repository is `NC-Framework/NXC_TXAdmin`. Unless `NC_TXAdmin` also exists and is
kept in sync, **the recipe fails at the first task** — and every subsequent task depends
on it, because `server.cfg`, the logo, and the SQL all come from that download.

**This is the highest-priority item.** It is a functional failure rather than a standards
difference, and it is invisible until someone actually runs a deployment.

**Fix:** point at `NXC_TXAdmin`, or confirm the other repository is the intended source.

---

## C-04 — `menuv` conflicts with the approved UI stack

**Current:** the recipe installs `menuv`, a third-party Lua menu library.

The approved UI stack is React, TypeScript, Vite, Tailwind, Zustand, and Framer Motion,
and every player-facing surface is required to use the shared design system so the
platform has one visual language.

Introducing a third-party gameplay dependency and changing the approved UI stack are both
listed as deviations requiring an approved proposal.

**Decision needed:** is `menuv` a temporary convenience for pre-framework development, or
an intended dependency? If temporary, it needs a removal milestone recorded. If intended,
it needs a deviation proposal.

---

## C-05 — The schema creates tables that belong to resource domains

**Current:** `ncframework.sql` creates `characters`, `jobs`, `gangs`, `inventories`,
`stashes`, `accounts`, `transactions`, and `shared_accounts`.

Under the domain-ownership rule, each of these belongs to a resource that owns it and
applies its own migrations:

| Table | Owning resource |
| --- | --- |
| `characters` | `nexus_core` |
| `jobs` | `nxc_jobs` |
| `gangs` | `nxc_organizations` |
| `inventories`, `stashes` | `nxc_inventory` |
| `accounts`, `transactions`, `shared_accounts` | `nxc_banking` |

A deployment recipe creating them is writing state it does not own — the same boundary
violation the framework prohibits between resources. It also means the schema and the
resource's own migrations can drift, with neither being authoritative.

### Detail differences within the schema

Independent of ownership, the current definitions differ from the data standards:

| Item | Current | Standard |
| --- | --- | --- |
| Engine and charset | Not specified | `ENGINE=InnoDB`, `utf8mb4` / `utf8mb4_unicode_ci` |
| Primary keys | `INT AUTO_INCREMENT` | Immutable opaque identifiers; auto-increment leaks record counts and is guessable |
| Money | `cash INT`, `bank INT` | Integer **minor units**, named so the unit is unambiguous — for example `balance_cents` |
| Inventory | `inventory JSON` column on `characters` | Owned by `nxc_inventory`, not a column on a character |
| Gender | `ENUM('male','female')` | `VARCHAR` with an application-level check; an `ENUM` change is a table alter |
| Table naming | `characters` | `<resource>_<entity>`, so a boundary violation is visible in review |

The overall shape — `citizen_id`, `job_grade`, `gang_rank`, cash and bank on the character
row — is recognisably a QBCore-style schema. Nexus Core is explicitly not a QBCore
reskin, and adopting that shape at the storage layer would pull its design decisions in
with it.

**Decision needed:** whether the recipe should create domain tables at all. The
alternative is that it creates only the migration-tracking table and each resource applies
its own migrations at startup.

---

## C-06 — The server is tagged as QBCore

**Current:** `sets tags "default, deployer, qbcore, qb-core"`

These tags are how the server presents itself on the public server list. Tagging a Nexus
Core server as QBCore misrepresents what it runs.

**Fix:** replace with tags describing the actual framework.

---

## C-07 — No Nexus Core resource is installed

The recipe has empty placeholder sections for framework resources.

`nxc_lib` is published at `NC-Framework/nxc_lib` and can be added now. The remaining seven
foundation resources are not published, and should stay absent rather than being listed
and broken.

---

## Summary

| Item | Kind | Priority |
| --- | --- | --- |
| C-03 recipe points at the wrong repository | **Functional failure** | Highest |
| C-05 schema creates domain tables | Design decision | High |
| C-04 `menuv` versus the approved UI stack | Design decision | High |
| C-06 QBCore server tags | Misrepresentation | Medium |
| C-01 author string | Standards | Low, one line |
| C-02 version claim | Standards | Low, one line |
| C-07 no framework resource installed | Expected at this phase | Low |
