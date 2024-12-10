<template>
    <div class="com-container">
        <div class="com-chart" ref="hot_ref">
        </div>
        <span class="iconfont no-rotate arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
        <span class="iconfont no-rotate arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
        <span class="cat-name" :style="comStyle">{{ catname }}</span>
        
    </div>
</template>


<script lang="ts" setup name="hot">
import {watch, getCurrentInstance, onMounted, onUnmounted, ref,reactive, computed } from 'vue';
const instance = getCurrentInstance!();
let allData:any = reactive({});
const $echarts = instance?.appContext.config.globalProperties.$echarts
const $socket = instance?.appContext.config.globalProperties.$socket

import {useTheme } from '@/store/componentTheme'


import chalk from '@/assets/chalk';
import vintage from '@/assets/vintage';
$echarts.registerTheme('chalk', chalk);
$echarts.registerTheme('vintage',vintage);

const themeStore = useTheme();
let theme = ref('dark')

const currentIndex = ref(0)
let hot_ref = ref<HTMLDivElement|null>(null)
let chartinsatnce: echarts.ECharts | null;
const titleFontSize = ref(0)


$socket.registerCallBack('hotData',getData)



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
        action:'getData',
        socketType:'hotData',
        chartName:'hot',
        value:''

    }
    )
    addEventListener('resize',screenAdapter) // 自适应监听,只有屏幕变化才会调整尺寸
    // 所以初始化的时候，需要自行自适应一下屏幕
    screenAdapter()
})

onUnmounted(()=>{
    //挂载的时候， 对监听事件进行去除
    removeEventListener('resize',screenAdapter)
    $socket.unRegisterCallBack('hotData')

})

let catname = computed(()=>{
    if (Object.keys(allData).length === 0) {
        return ''
      } else {
        return allData[currentIndex.value].name
    
}})

let comStyle = computed(()=>{
    return {
        fontSize:titleFontSize.value+'px'
    }
})

function screenAdapter(){
    titleFontSize.value = (hot_ref.value?.offsetWidth ?? 0) / 100 * 3.6
    const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize.value
          }
        }, series: [
          {
            radius: titleFontSize.value * 4.5,
            center: ['50%', '60%']
          }
        ],
        legend: {
          itemWidth: titleFontSize.value,
          itemHeight: titleFontSize.value,
          itemGap: titleFontSize.value / 2,
          textStyle: {
            fontSize: titleFontSize.value / 2
          }
        },

    }
    chartinsatnce?.setOption(adapterOption)
    chartinsatnce?.resize()
}

function initChart(){
    chartinsatnce = $echarts.init(hot_ref.value,theme.value)
    const initOption ={
        title:{
            text:'| 各队列呼叫量对比',
            left:20,
            top:20
        },
        legend:{
            top:'15%',
            icon:'circle'
        },
        tooltip:{
            show:true,
            formatter:(arg:any)=>{
                const thirdCategory = arg.data.children
                // console.log(arg)
                // console.log(arg.data)
                // console.log(arg.data.children)
                let total = 0
                thirdCategory.forEach((item:any) => {
                    total += item.value
                });
                let retStr = ''
                thirdCategory.forEach((item:any)=>{
                    retStr += `
                ${item.name}:    ${String(parseInt((item.value / total * 100).toFixed(2))) + '%'}
                <br/>    
                `
                })
                return retStr
            }
        },
        series:[
        {
            type:'pie',
            label:{
                show:false
            },
            emphasis:{
                label:{
                    show:true
                },
                labelLine:{
                    show:false
                }
            }

        }

        ]
    }
    chartinsatnce?.setOption(initOption)
    
}

// async function getData(){
//     // 用await 获取数据，对allData进行赋值
//     const {data:ret} = await $http.get('hotproduct')
//     Object.assign(allData,ret)
//     updateChart()
// }


function getData(ret:any){
    // 用await 获取数据，对allData进行赋值
    Object.assign(allData,ret)
    updateChart()
}


function updateChart(){
    //处理数据
    // console.log(allData[0])
    const legendData = allData[currentIndex.value].children.map((item:any)=>{ return item.name})

    const seriesData = allData[currentIndex.value].children.map((item:any)=>{
        return {
            name:item.name,
            value:item.value,
            children:item.children//这个字段本不需要用到，但为了tooltip的formatter的时候可以用到这个数据，所以加上了
        }
})
    
    const dataOption ={
        legend:{
            data:legendData
        },
        series:[{
            data:seriesData
        }
        ]

    }
    chartinsatnce?.setOption(dataOption)

}

function toLeft(){
    currentIndex.value--
      if (currentIndex.value < 0) {
        currentIndex.value = Object.keys(allData).length - 1
      }
      updateChart()

}

function toRight(){
    currentIndex.value++
    if (currentIndex.value > Object.keys(allData).length-1) {
        currentIndex.value = 0
      }
      updateChart()

}

defineExpose({
    screenAdapter
})

</script>


<style lang="less">

.no-rotate {
  transform: none !important;
}

.arr-left {
  position:absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.arr-right {
  position:absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.cat-name {
  position:absolute;
  left: 80%;
  bottom: 20px;
  color: white;
}

</style>
