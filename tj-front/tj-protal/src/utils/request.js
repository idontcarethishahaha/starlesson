import axios from 'axios';
import proxy from '../config/proxy';
import { ElMessage, ElMessageBox } from 'element-plus';
import  router  from '../router';
import {ref} from "vue";
import {tryRefreshToken} from './refreshToken'

const env = import.meta.env.MODE || 'development';
const host = env === 'mock' ? 'https://mock.boxuegu.com/mock/3359' : proxy[env].host; // 如果是mock模式 就不配置host 会走本地Mock拦截
const CODE = {
  LOGIN_TIMEOUT: 1000,
  REQUEST_SUCCESS: 200,
  REQUEST_FOBID: 1001,
};
// 登录异常弹窗处理
let isLogin = true
// 刷新标记
// let refreshing = ref(false)

const instance = axios.create({
  baseURL:  host,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
});

instance.interceptors.request.use((config) => {
  const TOKEN = sessionStorage.getItem('token');
  // 从sessionStorage获取并解析用户信息
  const userInfoStr = sessionStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};

  // 安全地获取用户信息
  const userName = userInfo.name || '';
  const userGender = userInfo.gender === 0 ? '男' : (userInfo.gender === 1 ? '女' : '');
  const userProvince = userInfo.province || '';
  const userCity = userInfo.city || '';
  // 对可能包含非ASCII字符的值进行编码
  const encodedUserName = encodeURIComponent(userName);
  const encodedUserGender = encodeURIComponent(userGender);
  const encodedUserProvince = encodeURIComponent(userProvince);
  const encodedUserCity = encodeURIComponent(userCity);

  // 确保 headers 对象存在
  if (!config.headers) config.headers = {};

  // 有请求体时才设置 Content-Type，避免 GET 请求也带 application/json
  if (config.data !== undefined && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  if (TOKEN) {
    config.headers['Authorization'] = TOKEN;
  }
  config.headers['X-User-Name'] = encodedUserName;
  config.headers['X-User-Gender'] = encodedUserGender;
  config.headers['X-User-Province'] = encodedUserProvince;
  config.headers['X-User-City'] = encodedUserCity;

  return config
});

instance.defaults.timeout = 30000;
async function refreshToken(err){
  // 尝试刷新token
  let success = await tryRefreshToken();
  if(success){
    // refreshing.value = false;
    return instance(err.config);
  }
  // refreshing.value = false;
  ElMessageBox.alert(
    '请先登录！',
    '未登录或登录超时',
    {
      confirmButtonText: '重新登录',
      callback: () => {
        router.push('/login')
      },
    }
  )
  return true;
}
function alertLoginMessage() {
  isLogin = false;
  sessionStorage.removeItem('userInfo');
  sessionStorage.removeItem("token");
  ElMessageBox.confirm(
    '您的账号登录超时或在其他机器登录，请重新登录或更换账号登录！',
    '登录超时',
    {
      confirmButtonText: '重新登录',
      cancelButtonText: '继续浏览',
      type: 'warning',
    }
    )
    .then(() => {
      router.push('/login')
    })
    .catch(() => {
      router.go(0)
    })
}
// const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
instance.interceptors.response.use(
  async (response) => {
    let data = response.data;
    
    if (Array.isArray(data) || (data && typeof data === 'object' && !data.code)) {
      data = {
        code: CODE.REQUEST_SUCCESS,
        msg: 'OK',
        data: data,
      };
    }

    let code = data.code;
    if (code === CODE.REQUEST_SUCCESS) {
      return data;
    }

    if (code === 401 && isLogin) {
      isLogin = false;
      alertLoginMessage();
    }

    return data;
  },
   async (err) => {
    console.log(err)
    if(err.response.status === 401 && isLogin){
      // 登录异常或超时，刷新token
      return refreshToken(err);
    }
    // refreshing = false;
    return Promise.reject(err);
  },
);

export default instance;
