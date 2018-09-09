# pong.io

A simple pong game.

# Getting Started

This project leverages bake for automation, please install it via the
directions here: https://github.com/kyleburton/bake

Running the game is straightforward:

```
bake build
bake run:live
```

Running the game in production mode is just as easy:

```
bake build:prod
bake run:live
```

# Local Development Gotchas

Note that the `node_modules` directly is cached locally for easier local
development. This happens when one first runs `bake run:live`.

However, when new dependencies are added, one must run `bake yarn` to install
these dependencies.
