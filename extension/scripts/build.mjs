import { build, context } from "esbuild";
import { copyFile, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const extensionRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outdir = path.join(extensionRoot, "dist");
const watch = process.argv.includes("--watch");

async function readEnv() {
  const values = {};

  for (const filename of [".env", ".env.local"]) {
    try {
      const source = await readFile(path.join(extensionRoot, filename), "utf8");
      for (const line of source.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!match) continue;
        values[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
      }
    } catch {
      // Environment files are optional; the popup can store credentials instead.
    }
  }

  return values;
}

async function copyStaticFiles() {
  await mkdir(outdir, { recursive: true });
  await Promise.all([
    copyFile(path.join(extensionRoot, "manifest.json"), path.join(outdir, "manifest.json")),
    copyFile(path.join(extensionRoot, "popup.html"), path.join(outdir, "popup.html")),
  ]);
}

const env = await readEnv();
const options = {
  entryPoints: {
    background: path.join(extensionRoot, "src/background.ts"),
    content: path.join(extensionRoot, "src/content.ts"),
    popup: path.join(extensionRoot, "src/popup.ts"),
  },
  bundle: true,
  define: {
    __SUPABASE_URL__: JSON.stringify(
      env.VEIL_SUPABASE_URL ?? "https://duijlqusviazcvixxgcy.supabase.co",
    ),
    __SUPABASE_ANON_KEY__: JSON.stringify(env.VEIL_SUPABASE_ANON_KEY ?? ""),
  },
  entryNames: "[name]",
  format: "esm",
  logLevel: "info",
  minify: !watch,
  outdir,
  platform: "browser",
  sourcemap: watch ? "inline" : false,
  target: "chrome120",
};

if (!watch) {
  await rm(outdir, { recursive: true, force: true });
  await copyStaticFiles();
  await build(options);
  console.log(`Veil extension built at ${outdir}`);
} else {
  await copyStaticFiles();
  const buildContext = await context(options);
  await buildContext.watch();
  console.log(`Watching Veil extension sources at ${extensionRoot}`);
}
