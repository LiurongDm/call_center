<template>
    <div class="com-container">
        <div class="title" :style="comStyle">
            <span>{{ '▎ ' + showTitle}}</span>
            <span class="iconfont title-icon" :style="comStyle" @click="showChoice = !showChoice">&#xe6eb</span>
            <div class="select-con" v-show="showChoice" :style="marginStyle">
                <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
                    {{ item.text}}
                </div>
            </div>
        </div>
        <div class="com-chart" ref="trend_ref">
            
        </div>
    </div>
</template>


<script lang="ts" setup name="trend">
import { computed, getCurrentInstance, onMounted, onUnmounted, ref,watch } from 'vue';
// import chalk from '@/assets/chalk';
const instance = getCurrentInstance!();
import {useTheme } from '@/store/componentTheme'
import chalk from '@/assets/chalk';
import vintage from '@/assets/vintage';


const $echarts = instance?.appContext.config.globalProperties.$echarts
const $http = instance?.appContext.config.globalProperties.$http
const $socket = instance?.appContext.config.globalProperties.$socket


$echarts.registerTheme('chalk', chalk);
$echarts.registerTheme('vintage',vintage);



let trend_ref = ref<HTMLDivElement|null>(null)
let chartinsatnce: echarts.ECharts | null;
let showChoice = ref(false);//是否显示可选项
let choiceType = ref('map'); //一开始默认选中的是map类型
let allData:any = ref(null);
let titleFontSize = ref(0);

// 在组件创建完成之后，进行回调函数的注册
$socket.registerCallBack('trendData', getData)
const themeStore = useTheme();
let theme = ref('dark')




// computed(()=>{
//     theme.value = themeStore.theme

// })

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
        socketType:'trendData',
        chartName:'trend',
        value:''
    })

    addEventListener('resize',screenAdapter) // 自适应监听,只有屏幕变化才会调整尺寸
    // 所以初始化的时候，需要自行自适应一下屏幕
    screenAdapter()
})

onUnmounted(()=>{
    //挂载的时候， 对监听事件进行去除
    removeEventListener('resize',screenAdapter)
    // 在组件销毁的时候，进行回调函数的取消
    $socket.unRegisterCallBack('trendData')

})

let selectTypes = computed(()=>{
    // 计算属性跟onmount函数的执行顺序， 是按代码的顺序来的，且一般计算属性有用到它的时候才可以计算。
    // 且getdata是await的。如果这里不是将allData定义为ref 会显示为空值，显示为ref的时候，计算属性会是先空值
    // 然后由于ref的关系，又将值更为为最新
        if (!allData.value) {
            return []
        }else{
            return allData.value.type.filter((item:any)=>{
                return item.key != choiceType.value
            })
        }
    })

let showTitle = computed(()=>{
// 计算属性跟onmount函数的执行顺序， 是按代码的顺序来的，且一般计算属性有用到它的时候才可以计算。
// 且getdata是await的。如果这里不是将allData定义为ref 会显示为空值，显示为ref的时候，计算属性会是先空值
// 然后由于ref的关系，又将值更为为最新
    if (!allData.value) {
        return ''
    }else{
        return allData.value[choiceType.value].title
    }
})


 let comStyle = computed(()=>{
    return {
        fontSize:titleFontSize.value+'px'
    } 
 })

 let marginStyle = computed(()=>{
      return {
        marginLeft: titleFontSize.value + 'px'
      }
    })

function screenAdapter(){
    titleFontSize.value = (trend_ref.value?.offsetWidth ?? 0) / 100 * 3.6;
    const adapterOption = {
        legend:{
            itemWidth:titleFontSize.value,
            itemHeight:titleFontSize.value,
            itemGap:titleFontSize.value,
            textStyle:{
                fontSize:titleFontSize.value/2
            }
        }
    }
    chartinsatnce?.setOption(adapterOption)
    chartinsatnce?.resize()
}

function initChart(){
    // $echarts.registerTheme('chalk', chalk);
    chartinsatnce = $echarts.init(trend_ref.value,theme.value)
    const initOption ={
        grid:{
          left:'3%',
          top:'35%',
          right:'4%',
          bottom:'1%',
          containLabel:true  
        },
        tooltip:{
            trigger:'axis'
        },
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle'
        },
        xAxis:{
            type:'category',
            boundaryGap:false
        },
        yAxis:{
            type:'value'
        }
    }
    chartinsatnce?.setOption(initOption)
    
}

// async function getData(){
//     // 用await 获取数据，对allData.value进行赋值
//     const {data:ret} = await $http.get('/trend')
//     allData.value = ret
//     updateChart()
// }

function getData(ret:any){
    // 用await 获取数据，对allData.value进行赋值
    allData.value = ret
    // console.log(ret)
    updateChart()
}

function updateChart(){ 

    // 半透明的颜色值
    const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]

    //处理数据
    let timeArr = allData.value.common.month //横坐标
    // console.log(choiceType.value)
    let valueArr = allData.value[choiceType.value].data //系列map的数据，5条线
    let seriesArr = valueArr.map((item:any,index:any)=>{
        return {
            name:item.name,
            type:'line',
            data:item.data,
            stack:choiceType.value,
            areaStyle:{
                color:new $echarts.graphic.LinearGradient(0,0,0,1,[
                    {
                        offset:0,
                        color:colorArr1[index]
                    },
                    {
                        offset:1,
                        color:colorArr2[index]
                    }
                ])
            }
        }
    })
    const legendArr = valueArr.map((item:any)=>{return item.name})
    const dataOption ={
        xAxis :{
            data:timeArr
        },
        legend:{
            data:legendArr
        },
        series:seriesArr
    }
    chartinsatnce?.setOption(dataOption)

}

function handleSelect(currentType:any){
    choiceType.value = currentType
    updateChart()
    showChoice.value = false
}


defineExpose({
    screenAdapter
});

</script>


<style lang="less">
.title{
    position:absolute;
    left:20px;
    top:20px;
    z-index:10;
    // color:white;
    .title-icon{
        margin-left: 10px;
        cursor: pointer; //变成小手指

    }
    .select-con{
        background-color:#222733
}
}
</style>
