<template>
    <div class="com-container">
        <div class="com-chart" ref="rank_ref">
            
        </div>
    </div>
</template>


<script lang="ts" setup name="Rank">

import {watch, getCurrentInstance, onMounted, onUnmounted, ref } from 'vue';
import {useTheme } from '@/store/componentTheme'

const instance = getCurrentInstance!();
let startvalue = ref(0);
let endvalue = ref(9);
let timeid:number;

const themeStore = useTheme();
let theme = ref('dark')

const $echarts = instance?.appContext.config.globalProperties.$echarts
const $http = instance?.appContext.config.globalProperties.$http
const $socket = instance?.appContext.config.globalProperties.$socket



import chalk from '@/assets/chalk';
import vintage from '@/assets/vintage';
$echarts.registerTheme('chalk', chalk);
$echarts.registerTheme('vintage',vintage);

let allData:any = ref(null);

let rank_ref = ref<HTMLDivElement|null>(null)
let chartinsatnce: echarts.ECharts | null;
$socket.registerCallBack('rankData', getData)


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
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    })
    addEventListener('resize',screenAdapter) // 自适应监听,只有屏幕变化才会调整尺寸
    // 所以初始化的时候，需要自行自适应一下屏幕
    screenAdapter()
})

onUnmounted(()=>{
    //挂载的时候， 对监听事件进行去除
    removeEventListener('resize',screenAdapter)
    clearInterval(timeid)
    $socket.unRegisterCallBack('rankData')

})

function screenAdapter(){
    const titleFontSize = (rank_ref.value?.offsetWidth ?? 0) / 100 * 3.6
    const adapterOption = {
        title:{
            textStyle:{
                fontSize:titleFontSize
            }
        },
        series:[
            {
                barWidth:titleFontSize,
                itemStyle:{
                    borderRadius:[titleFontSize/2,titleFontSize/2,0,0]
                }
            }

        ]

    }
    chartinsatnce?.setOption(adapterOption)
    chartinsatnce?.resize()
}

function initChart(){
    chartinsatnce = $echarts.init(rank_ref.value,theme.value)
    const initOption ={
        title:{
            text:'| 地区呼叫量排行',
            left:20,
            top:20

        },
        grid:{
            top:'40%',
            left:'5%',
            right:'5%',
            bottom:'5%',
            containLabel:true

        },
        tooltip:{
          trigger:'axis'  
        },
        xAxis:{
            type:'category'
        },
        yAxis:{
            type:'value'
        },
        series:[
            {
                type:'bar'
            }
        ]

    }
    if (chartinsatnce){
    chartinsatnce.setOption(initOption)

    chartinsatnce.on('mouseover',()=>{
        clearInterval(timeid)
    })

    chartinsatnce.on('mouseout',()=>{
        startInterval()
    })

}
    
}

async function getData(ret:any){
    // 用await 获取数据，对allData进行赋值
    // const {data:ret} = await $http.get('/rank')
    allData.value = ret
    // 从大到小
    allData.value.sort((a:any,b:any)=>{return b.value-a.value})
    updateChart()
    startInterval()
}

function updateChart(){
    const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
    //处理数据
    const provinceArr = allData.value.map((item:any)=>{return item.name})
    const valueArr = allData.value.map((item:any)=>{return item.value})

    const dataOption ={
        dataZoom:{
            show:false,
            startValue:startvalue.value,
            endValue:endvalue.value
        },
        xAxis:{
            data:provinceArr
        },
        series:[
            {
                data:valueArr,
                itemStyle:{
                    color:(arg:any)=>{
                        let targetColorArr = colorArr[0]
                        if(arg.value>300){
                            targetColorArr = colorArr[0]

                        }else if(arg.value>200){
                            targetColorArr = colorArr[1]

                        }else{
                            targetColorArr = colorArr[2]

                        }
                        return new $echarts.graphic.LinearGradient(0,0,0,1,[
                            {
                                offset:0,
                                color:targetColorArr[0]
                            },
                            {
                                offset:1,
                                color:targetColorArr[1]
                            }
                        ])
                    }
                }
            }
        ]

   
    }
    chartinsatnce?.setOption(dataOption)

}

function startInterval(){
    if(timeid){
        clearInterval(timeid)
        }
    timeid = setInterval(()=>{
        startvalue.value ++
        endvalue.value ++
        if (endvalue.value > allData.value.length){
            startvalue.value = 0
            endvalue.value =9
        }
        updateChart()
    },2000)
}

defineExpose({
    screenAdapter
});
</script>


<style lang="less"></style>
