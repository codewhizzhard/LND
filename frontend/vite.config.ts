import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "@backend-new": path.resolve(__dirname, "../backend-new/src"),
       "@hashgraph/sdk": path.resolve(__dirname, "node_modules/@hashgraph/sdk")
    },
  },
 /*  optimizeDeps: {
    exclude: ['my-sdk'],
  }, */
   server: {
    hmr: true,
    fs: {
      // allow serving files from one level up
      allow: [".."]
    },
     watch: {
      usePolling: true
    }
  },

});
