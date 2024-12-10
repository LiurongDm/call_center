<template>
    <div class="com-container" @dblclick="reverMap">
        <div class="com-chart" ref="map_ref">
        </div>
    </div>
</template>


<script lang="ts" setup name="Map">
import axios from 'axios';
import {getProvinceMapInfo} from '@/utils/map_utils'
import {useTheme } from '@/store/componentTheme'

import { watch,getCurrentInstance, onMounted, onUnmounted, ref ,reactive} from 'vue';
const instance = getCurrentInstance!();
let allData:any = ref(null);
const $echarts = instance?.appContext.config.globalProperties.$echarts
const $http = instance?.appContext.config.globalProperties.$http
const $socket = instance?.appContext.config.globalProperties.$socket

const themeStore = useTheme();
let theme = ref('dark')


import chalk from '@/assets/chalk';
import vintage from '@/assets/vintage';
$echarts.registerTheme('chalk', chalk);
$echarts.registerTheme('vintage',vintage);

let map_ref = ref<HTMLDivElement|null>(null)
let chartinsatnce: echarts.ECharts | null;
let mapData = reactive(new Map<string, any>());


$socket.registerCallBack('mapData', getData)



watch(()=>themeStore.theme,(newTheme)=>{
    theme.value = newTheme
    chartinsatnce?.dispose()
    initChart()
    screenAdapter()
    updateChart()
    console.log("监控到主题改变为："+newTheme)
})
onMounted(()=>{
    initChart()
    // getData()
    $socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      value: ''
    })
    addEventListener('resize',screenAdapter) // 自适应监听,只有屏幕变化才会调整尺寸
    // 所以初始化的时候，需要自行自适应一下屏幕
    screenAdapter()
})

onUnmounted(()=>{
    //挂载的时候， 对监听事件进行去除
    removeEventListener('resize',screenAdapter)
    $socket.unRegisterCallBack('mapData')
        $socket.unRegisterCallBack('rankData')

})

function screenAdapter(){
    const titleFontSize = (map_ref.value?.offsetWidth ?? 0) / 100 * 3.6 
    const adapterOption = {
        title:{
            textStyle:{ 
                fontSize:titleFontSize //标题文字的大小
             }
        },
        legend:{
            itemWidth:titleFontSize/2, //图表的宽度
            itemHeight:titleFontSize/2, // 图例的高度
            itemGap:titleFontSize/2, //图例的间隔大小
            textStyle:{ 
                fontSize:titleFontSize/2 //图例上的文字大小
            }
        }

    }
    chartinsatnce?.setOption(adapterOption)
    chartinsatnce?.resize()
}

async function initChart(){
    chartinsatnce = $echarts.init(map_ref.value,theme.value)
    // 获取中国地图的矢量数据
    // http://localhost:8080/static/map/china.json
    const ret = await axios.get('http://localhost:8080/static/map/china.json') //获取地图信息
    $echarts.registerMap('china',ret.data) // 注册地图
    
    
    const initOption ={
        title:{
            text:"| 客户分布", //图表的标题
            left:"20px", //标题具体左侧的距离
            top:"20px" //标题距离上面的距离
        },
        geo:{
            type:'map', //说明是地图
            map:'china', //地图的名字，跟上面注册的一致
            top:'5%', //距离上面的距离
            bottom:'5%', //距离下面的距离
            itemStyle:{ //地图的风格上的一些配置
                areaColor:'#2E72BF', //每一个省份区域显示的颜色
                borderColor:'#333' //城市之间的边框显示的颜色
            }
            
        },
        legend:{ // 显示图例
            left:'5%',  //图例距离左侧的距离
            bottom:'5%', //图例距离下方的距离
            orient:'vertical' //图例显示的方向
        }
        
    }
    chartinsatnce?.setOption(initOption)

    chartinsatnce?.on('click', (arg)=>{
        const provinceInfo = getProvinceMapInfo(arg.name);
        (async () => {
            if (provinceInfo) {
                if (!mapData.has(provinceInfo.key))
                {
                    const ret = await axios.get(`http://localhost:8080${provinceInfo.path}`)
                    mapData.set(provinceInfo.key,ret.data)
                    $echarts.registerMap(provinceInfo.key,ret.data)
            }
                const changeOption = {
                    geo:{
                        map:provinceInfo.key
                    }
                }
                chartinsatnce?.setOption(changeOption)
            }
  })();
});
    
}

async function getData(ret:any){
    // 用await 获取数据，对allData进行赋值
    // const {data:ret} =  await $http.get('/map')
    allData.value = ret
    updateChart()
}

function updateChart(){
    //处理数据
    // console.log(allData.value)
    const legendArr = allData.value.map((item:any)=>{
        return item.name
        
    })
    const seriesArr = allData.value.map((item:any)=>{
        return {
        type:'effectScatter', //地图上的散点图
        rippleEffect:{ // 散点涟漪效果设置
            scale:5, //散点的涟漪效果大小
            brushType:'stroke' //涟漪为空心
        },
        name:item.name, // 散点的名字
        data:item.children, //散点的信息
        coordinateSystem:'geo' //要设置这个散点才可以显示在地图上
        }
    })
    const dataOption ={
        series:seriesArr,
        legend:{
            data:legendArr  //显示对应的图例
        }

    }
    chartinsatnce?.setOption(dataOption)

}

function reverMap(){
    const reveroption = {
        geo:{
            map:'china'
        }
    }
    chartinsatnce?.setOption(reveroption)
}

defineExpose({
    screenAdapter
});
</script>


<style lang="less"></style>
