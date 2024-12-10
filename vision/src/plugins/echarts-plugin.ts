import * as echarts from 'echarts';
import type { Plugin } from 'vue';
import type { App } from 'vue';

// 定义一个 Vue 插件对象
export const EChartsPlugin: Plugin = {
  install(app: App) {
    // 将 ECharts 挂载到 Vue 的原型上
    app.config.globalProperties.$echarts = echarts;
  }
};

// export default EChartsPlugin