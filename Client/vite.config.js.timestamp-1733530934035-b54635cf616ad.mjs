// vite.config.js
import { defineConfig } from "file:///C:/Users/Gacho/Desktop/My_Blog/Client/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Gacho/Desktop/My_Blog/Client/node_modules/@vitejs/plugin-react-swc/index.mjs";
var vite_config_default = defineConfig({
  server: {
    proxy: {
      "proxy": "http://localhost:5000",
      "/api": {
        target: "http://localhost:5000",
        secure: false
      },
      "/api/notificationsHub": {
        target: "http://localhost:5000",
        secure: false,
        ws: true
        // Enable WebSocket proxying
      }
    }
  },
  plugins: [react()]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxHYWNob1xcXFxEZXNrdG9wXFxcXE15X0Jsb2dcXFxcQ2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxHYWNob1xcXFxEZXNrdG9wXFxcXE15X0Jsb2dcXFxcQ2xpZW50XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9HYWNoby9EZXNrdG9wL015X0Jsb2cvQ2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBzZXJ2ZXI6IHtcbiAgICBwcm94eToge1xuICAgICAgXCJwcm94eVwiOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMFwiLFxuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTIwNycsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgJy9ub3RpZmljYXRpb25zSHViJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjUyMDcnLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICB3czogdHJ1ZSwgLy8gRW5hYmxlIFdlYlNvY2tldCBwcm94eWluZ1xuICAgICAgfSxcbiAgICB9LFxuICB9LFxuXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZTLFNBQVMsb0JBQW9CO0FBQzFVLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxTQUFTO0FBQUEsTUFDVCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0EscUJBQXFCO0FBQUEsUUFDbkIsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsSUFBSTtBQUFBO0FBQUEsTUFDTjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFQSxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ25CLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
