<template>
    <div class="com-container">
        <div class="com-chart" ref="trend_ref">
            
        </div>
    </div>
</template>


<script lang="ts" setup name="trend-template">
import { getCurrentInstance, onMounted, onUnmounted, ref } from 'vue';
const instance = getCurrentInstance!();

const $echarts = instance?.appContext.config.globalProperties.$echarts
let trend_ref = ref<HTMLDivElement|null>(null)
let chartinsatnce: echarts.ECharts | null;


onMounted(()=>{
    initChart()
    getData()
    addEventListener('resize',screenAdapter) // 自适应监听,只有屏幕变化才会调整尺寸
    // 所以初始化的时候，需要自行自适应一下屏幕
    screenAdapter()
})

onUnmounted(()=>{
    //挂载的时候， 对监听事件进行去除
    removeEventListener('resize',screenAdapter)
})

function screenAdapter(){
    const adapterOption = {}
    chartinsatnce?.setOption(adapterOption)
    chartinsatnce?.resize()
}

function initChart(){
    chartinsatnce = $echarts.init(trend_ref,'dark')
    const initOption ={}
    chartinsatnce?.setOption(initOption)
    
}

async function getData(){
    // 用await 获取数据，对allData进行赋值
    updateChart()
}

function updateChart(){
    //处理数据
    const dataOption ={

    }
    chartinsatnce?.setOption(dataOption)

}

</script>


<style lang="less"></style>
