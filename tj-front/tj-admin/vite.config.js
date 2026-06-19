// 项目配置页面
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";

const CWD = process.cwd();

//配置参考 https://vitejs.dev/config/
export default defineConfig((mode) => {
  const { VITE_BASE_URL } = loadEnv(mode, CWD);
  return {
    base: "./",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [vue(), vueJsx(), svgLoader()],
    server: {
      port: 18081,
      host: "0.0.0.0",
      proxy: {
        // API 请求全部转发到网关 10010，避开跨域
        '/as': {
          target: 'http://localhost:10010',
          changeOrigin: true,
        },
        '/us': {
          target: 'http://localhost:10010',
          changeOrigin: true,
        },
        '/ms': {
          target: 'http://localhost:10010',
          changeOrigin: true,
        },
        '/cs': {
          target: 'http://localhost:10010',
          changeOrigin: true,
        },
        '/ais': {
          target: 'http://localhost:10010',
          changeOrigin: true,
        },
        '/chat': {
          target: 'http://localhost:10010',
          changeOrigin: true,
        },
        '/file': {
          target: 'http://localhost:10010',
          changeOrigin: true,
        },
        '/session': {
          target: 'http://localhost:10010',
          changeOrigin: true,
        },
        // 静态资源代理
        '/img-tx': {
          target: 'http://localhost:10010',
          changeOrigin: true,
        },
        '/img-minio': {
          target: 'http://192.168.227.128:9000/',
          changeOrigin: true,
        },
      },
    },
  };
});
