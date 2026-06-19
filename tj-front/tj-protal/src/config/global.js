export const prefix = '';
export const TOKEN_NAME = 'token';

/**
 * 开发环境 API 基础地址
 * - 如果后端网关在本机运行（端口 8080），改为 http://localhost:8080
 * - 如果后端服务（tj-chat: 8094, tj-aigc: 8092 等）在本机分开运行，改为 http://localhost:8094
 * - 生产环境通常通过 Nginx/Vite proxy 代理，此处可留空
 */
export const devAPIHost = 'http://localhost:8080';
