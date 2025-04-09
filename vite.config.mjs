import { glob } from 'glob';
import path from 'node:path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root_path = path.resolve(__dirname);

const swc_path = path.resolve(root_path, 'swc.config.json');
const src_path = path.resolve(root_path, 'src');

const main_path = path.resolve(src_path, 'main.ts');
const repl_path = path.resolve(src_path, 'repl.ts');
const cli_path = path.resolve(src_path, 'typeorm/typeorm.cli.ts');

const migration_files_path = glob.sync(`${src_path}/typeorm/migrations/[0-9]*-*.ts`);

const app_path = process.env.RUN_BUILD ? [main_path, repl_path, cli_path, ...migration_files_path] : main_path;

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
