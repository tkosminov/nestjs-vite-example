import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root_path = resolve(__dirname);

const swc_path = resolve(root_path, 'swc.config.json');
const src_path = resolve(root_path, 'src');

const main_path = resolve(src_path, 'main.ts');
const repl_nest_path = resolve(src_path, 'repl-nest/repl.ts');
const repl_custom_path = resolve(src_path, 'repl-custom/repl.ts');
const cli_path = resolve(src_path, 'typeorm/typeorm.cli.ts');

const app_path = process.env.RUN_BUILD !== 'true' ? main_path : [main_path, repl_nest_path, repl_custom_path, cli_path];

const config = defineConfig({
  server: {
    host: 'localhost',
    port: 8080,
    hmr: true,
    watch: { usePolling: true },
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'nest',
      appPath: app_path,
      exportName: 'vite_node_app',
      tsCompiler: 'swc',
      swcOptions: {
        configFile: swc_path,
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        preserveModules: true,
      },
    },
  },
});

export default config;
