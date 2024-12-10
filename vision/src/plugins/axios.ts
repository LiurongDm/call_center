// src/utils/axios.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  // 设置 Axios 的配置
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么，例如设置 token
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
  },
  error => Promise.reject(error)
);

// 添加响应拦截器
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // 请求已发出，服务器响应了状态码
      // 这里可以处理一些登录超时，跳转到登录页的逻辑
      if (error.response.status === 401) {
        // 例如：跳转到登录页
        console.log('Session expired, please login again.');
      }
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;