# Backend

## Known Issues

### Why not use `"type": "module"` in `package.json`

This is due to `@mobily/ts-belt` being a Common JS module plus how `exports` and `main` properties in its `package.json` are defined. They causing wired issue when combined with TypeScript and ts-node.

If we remove `@mobily/ts-belt`, we should be able to be unblocked to adopt `"type": "module"` in `package.json`.
