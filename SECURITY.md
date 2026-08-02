# Security

## Reporting

**Do not open a public issue for a security vulnerability.** Report privately to the
project owner through the contact channel published for the server.

## This repository specifically

A deployment recipe defines what a server installs and how it is configured, which makes
two concerns matter more than elsewhere.

**Committed credentials.** Operator-supplied values must remain blank in committed files.
`npm run check` scans for connection strings, license keys, webhook URLs, and private
keys. If a real credential is ever committed here, **rotate it** — removing the commit
does not un-publish it.

**Referenced repositories.** The recipe downloads code and runs it on an operator's
server. `npm run check` asserts that every referenced repository is one this project
publishes or has approved. A recipe pointed at an unexpected repository is a supply-chain
problem, not a typo.

## What a recipe must never do

- Supply secrets.
- Reference a repository outside the approved set.
- Install a resource that has not been published.
