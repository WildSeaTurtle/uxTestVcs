# VCS prototypes

React + Vite prototype app deployed to GitHub Pages.

## Local development

Use Node 22.13.0. The project has `.nvmrc` and `.node-version` for version managers.

```sh
npm ci
npm run dev
```

If the active shell still points to Node 16, run commands with the bundled local Node first in `PATH`:

```sh
PATH=.tools/node-v22.13.0-darwin-arm64/bin:$PATH npm run build
PATH=.tools/node-v22.13.0-darwin-arm64/bin:$PATH npm run lint
```

## GitHub Pages

Pushing to `main` deploys automatically through `.github/workflows/deploy.yml`.

The workflow clones `JetBrains/int-ui-kit-for-web-copy` into `../int-ui-kit-for-web`, so the repository must have an `INT_UI_KIT_TOKEN` secret with read access to that repository.
