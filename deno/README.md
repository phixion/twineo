# Deno

This is a version of the same code rewritten to be compatible with Deno, so you
can easily deploy on [Deno Deploy](https://deno.com/deploy). The only problem is
that Deno Deploy only supports github integrations.

## Project structure

ETA is also fully compatible with Deno by default, so all the templates can be
used here as well. In the `public` folder, you'll need to build the Tailwindcss
file to include.

The expected folder structure is something like this:

```
deno/
├── public/
│   ├── styles.min.css
│   ├── search.js
│   ├── stream.js
│   ├── vod.js
│   ├── [poppins font files]
├── templates/
│   ├── clip.eta
│   ├── index.eta
│   ├── stream.eta
│   ├── vod.eta
├── src/
│   ├── ...
├── ...
├── index.ts (main file)
```

## Running

```
deno task start
```
