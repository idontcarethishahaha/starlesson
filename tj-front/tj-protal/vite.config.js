// 项目配置页面
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';

const CWD = process.cwd();

//配置参考 https://vitejs.dev/config/
export default defineConfig((mode) => {
  // const { VITE_BASE_URL } = loadEnv(mode, CWD);
  return {
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      svgLoader()
    ],
    server: {
      hmr:{
        overlay:false
      },  
      port: 18082,
      host: '0.0.0.0',
      proxy: {
        '/img-tx': {
          // target:  'https://tjxt-dev.itheima.net/', // 'http://172.17.2.134',
          target:  'http://www.tianji.com/',
          changeOrigin: true,
          // rewrite: (path) => {
          //   return path.replace(/^\/img-tx/, '')
          // }
        },
        '/img-minio': {
          // target:  'https://tjxt-dev.itheima.net/', // 'http://172.17.2.134',
          target:  'http://192.168.227.128:9000/',
          changeOrigin: true,
          // rewrite: (path) => {
          //   return path.replace(/^\/img-tx/, '')
          // }
        },
        // AI 服务代理 - 统一通过网关转发
        // /ais/** -> tj-aigc 服务（智能体 + RAG 对话）
        '/ais': {
            target: 'http://api.tianji.com',
            changeOrigin: true,
        },
        // /chat/** -> tj-chat 服务（RAG 知识库 + 流式聊天）
        '/chat': {
            target: 'http://api.tianji.com',
            changeOrigin: true,
        },
        // /file/** -> tj-chat 服务（知识库文件管理）
        '/file': {
            target: 'http://api.tianji.com',
            changeOrigin: true,
        },
        // /session/** -> tj-chat 服务（用户会话管理）
        '/session': {
            target: 'http://api.tianji.com',
            changeOrigin: true,
        },
      }
    },
  }
})
