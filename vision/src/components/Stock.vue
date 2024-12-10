<template>
    <div class="com-container">
        <div class="com-chart" ref="stock_ref">
            
        </div>
    </div>
</template>


<script lang="ts" setup name="stock">
import {watch, getCurrentInstance, onMounted, onUnmounted, reactive, ref } from 'vue';
const instance = getCurrentInstance!();
import {useTheme } from '@/store/componentTheme'

const themeStore = useTheme();
let theme = ref('dark')

let allData:any = reactive([{}]);
let timeid:number;
const titleFontSize = ref(0)
const $echarts = instance?.appContext.config.globalProperties.$echarts
const $http = instance?.appContext.config.globalProperties.$http
const $socket = instance?.appContext.config.globalProperties.$socket



import chalk from '@/assets/chalk';
import vintage from '@/assets/vintage';
$echarts.registerTheme('chalk', chalk);
$echarts.registerTheme('vintage',vintage);


let currentIndex = ref(0)
let stock_ref = ref<HTMLDivElement|null>(null)
let chartinsatnce: echarts.ECharts | null;
$socket.registerCallBack('stockData', getData)


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
      socketType: 'stockData',
      chartName: 'stock',
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
    $socket.unRegisterCallBack('stockData')
})

function screenAdapter(){
    titleFontSize.value = (stock_ref.value?.offsetWidth ?? 0) / 100 * 3.6
    // console.log(titleFontSize.value)
    const innerRadius = titleFontSize.value * 2.8
    const outterRadius = titleFontSize.value * 1.125
    const adapterOption = {
        title:{
            textStyle:{
                fontSize:titleFontSize.value
            }
        },
        series:[
        {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize.value / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize.value / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize.value / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize.value / 2
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize.value / 2
            }
          }

        ]
    }
    chartinsatnce?.setOption(adapterOption)
    chartinsatnce?.resize()
}

function initChart(){
    chartinsatnce = $echarts.init(stock_ref.value,theme.value)
    // console.log("初始化")
    // console.log((stock_ref.value?.offsetWidth ?? 0)/100*3.6)
    const initOption ={
        title:{
            text:'| 放弃率',
            left:20,
            top:20
        }
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
    // const {data:ret} = await $http.get('stock')
    Object.assign(allData,ret)
    updateChart()
    startInterval()
}

function updateChart(){
    //处理数据
    const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
    const colorArr = [
    ['#4FF778', '#0BA82C'],
    ['#E5DD45', '#E8B11C'],
    ['#E8821C', '#E55445'],
    ['#5052EE', '#AB6EE5'],
    ['#23E5E5', '#2E72BF']
    ]
    const start = currentIndex.value * 5
    const end = (currentIndex.value+1) * 5
    const showData = allData.slice(start, end)
    const seriesArr = showData.map((item:any, index:any) => {
        return {
          type: 'pie',
          emphasis: {
            scale: false // 替代 hoverAnimation
            },
        //   hoverAnimation:false,//关闭鼠标移入到饼图时的动画效果.新版已弃用，有警告
          center: centerArr[index],
          labelLine: {
             show: false // 隐藏指示线
          },
          label: {
            show:true,
            position: 'center',
            color:colorArr[index][0]
          },
          data: [
            {
            name: item.name + '\n\n' + item.sales,
            value: item.sales,
            itemStyle:{
                color:new $echarts.graphic.LinearGradient(0,1,0,0,[
                    {
                        offset:0,
                        color:colorArr[index][0]
                    },
                    {
                        offset:1,
                        color:colorArr[index][1]
                    }
                ]
            )
            }
            },{
            name:'test',
            value: item.stock,
            label:{
                show:false
            },
            itemStyle:{
            color:'#333843'
              }
            }
        ]
    
        }
    })
       
   
       

    const dataOption ={
        series: seriesArr
    }
    chartinsatnce?.setOption(dataOption)

}
function startInterval(){
    if (timeid) {
        clearInterval(timeid)
      }
    timeid = setInterval(()=>{
        if (currentIndex.value >= 1){
            currentIndex.value = 0
        }else{
            currentIndex.value ++;
        }
        updateChart()
    },5000)
    
}


defineExpose({
    screenAdapter
});

</script>


<style lang="less"></style>
