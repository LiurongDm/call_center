<template>
    <div class="com-container">
        <div class="com-chart" ref="seller_ref">
        </div>
    </div>
</template>

<!-- 这个是使用vue2 的选项式写法 -->
<!-- <script>
export default{
    data(){
        return {
            chartInstance:null
        }
    },
    mounted () {
    this.initChart()
    this.getData()
    },
    methods:{

        initChart(){
            console.log(this.$echarts)
            this.chartInstance = this.$echarts.init(this.$refs.seller_ref)
        },
        async getData () {
        const { data: ret } = await this.$http.get('http://127.0.0.1:8888/api/seller')
        console.log(ret)
        }
    }
}
</script> -->

<!-- 这个是使用 getCurrentInstance 的方法 -->
<script setup lang="ts" name="seller">
// 通过getCurrentInstance 获取
// import 'echarts/theme/macarons.js';
import chalk from '@/assets/chalk';
import { watch,getCurrentInstance, onMounted ,ref,onUnmounted} from 'vue'

// import chalk from '@/assets/chalk';



const instance = getCurrentInstance()!;
let seller_ref = ref<HTMLDivElement | null>(null);
let chartinsatnce: echarts.ECharts | null;
import {useTheme } from '@/store/componentTheme'

// let chartinsatnce = ref(null)

let currentPage = ref(1); //当前页
let totalPage = ref(0); //总的页数
let timerId: number | undefined = undefined;
const $echarts = instance.appContext.config.globalProperties.$echarts
const $socket = instance?.appContext.config.globalProperties.$socket

const themeStore = useTheme();
let theme = ref('dark')

import vintage from '@/assets/vintage';
$echarts.registerTheme('chalk', chalk);
$echarts.registerTheme('vintage',vintage);


watch(()=>themeStore.theme,(newTheme)=>{
    theme.value = newTheme
    chartinsatnce?.dispose()
    initChart()
    screenAdapter()
    updateChart()
    console.log("监控到主题改变为："+newTheme)
})
// 使用接口作为 ref 的类型注解
// let allDate = ref<Item[]>([]);
let allDate = ref([{name:'',value:1}])
$socket.registerCallBack('sellerData', getData)
onMounted(()=>{
    initChart()
    // getData()
    $socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    })
    addEventListener('resize',screenAdapter)
    // 在页面加载完成的时候，主动进行屏幕适配
    screenAdapter()
})

onUnmounted(()=>{
    clearInterval(timerId)
    removeEventListener('resize',screenAdapter)
    $socket.unRegisterCallBack('sellerData')

})

function initChart(){

    chartinsatnce = $echarts.init(seller_ref.value,theme.value)

    const initOption ={
        title:{
            text:"| 通话时长统计",
            left:20,
            top:20
        },
        grid:{
          top:"20%",
          Left:"3%",
          right:"6%",
          bottom:"3%",
          containLabel:true   
        },
        xAxis:{
            type:'value'
            
        },
        yAxis:{
            type:'category',

        },
        
        tooltip:{
            trigger:'axis',
            axisPointer:{
                type:"line",
                z:0,
                lineStyle:{
                    color:'#2D3443',
                    type:'solid'
                }
            }
        
        },
    
        series:[
            {
                type:'bar',
                label:{
                    show:true,
                    position:"right",
                    color:"white"
                },
                itemStyle:{
                    borderRadius :[0,33,33,0],
                    // 设置颜色渐变
                    // 这里的坐标指得相对方向，x1,y1,x2,y2
                    color:$echarts.graphic.LinearGradient(0,0,1,0,[
                        {
                            offset:0,
                            color:"#5052EE"
                        },
                        {
                            offset:1,
                            color:"#AB6EE5"
                        }
                    ])
                }

            }
        ]
    }
    
    if (chartinsatnce){
        chartinsatnce.setOption(initOption)

        chartinsatnce.on('mouseover',()=>{
        clearInterval(timerId) })

        chartinsatnce.on('mouseout',()=>{
        startInterval() })


}
}
    //对图表数据做鼠标点击事件的监听

    

async function getData(ret:any){
    // const $http = instance.appContext.config.globalProperties.$http
    // const {data:ret} =  await $http.get('http://127.0.0.1:8888/api/seller')
    // const {data:ret} =  await $http.get('/seller')

    allDate.value = ret
    allDate.value.sort((a,b)=>{return a.value-b.value}) //这样写是从小到大排序
    totalPage.value = allDate.value.length % 5 ==0 ? allDate.value.length / 5 :allDate.value.length / 5 +1
    updateChart()
    startInterval()

}

function updateChart(){
    const start = (currentPage.value -1)*5
    const end = currentPage.value * 5
    const showData = allDate.value.slice(start,end)
    

    const sellerNames = showData.map((item)=>{return item.name})
    const sellerValues = showData.map((item)=>{return item.value})
    const dataOption = {
        yAxis:{
            data:sellerNames

        },
        series:[
            {
                data:sellerValues
            }
        ]
    }
    
    if (chartinsatnce) {
        chartinsatnce.setOption(dataOption);
  }
}

function startInterval(){
    if (timerId){
        clearInterval(timerId)
    }
    timerId = setInterval(()=>{
        currentPage.value ++
        if (currentPage.value > totalPage.value){
            currentPage.value =1
        }
        updateChart()
    },3000)
}
    
function screenAdapter(){
    const titleFontSize = (seller_ref.value?.offsetWidth ?? 0) / 100 * 3.6;
    const adapterOption = {
        title:{
            textStyle:{
                fontSize:titleFontSize,

            }},
        tooltip:{
            axisPointer:{
              
                lineStyle:{
                    width:titleFontSize
           
                }
            }
        
        },
    
        series:[
            {
                barWidth: titleFontSize,
                itemStyle:{
                    borderRadius :[0,titleFontSize/2,titleFontSize/2,0]
             
                }

            }
        ]
        
    }

    chartinsatnce?.setOption(adapterOption)
    chartinsatnce?.resize()

}
 
defineExpose({
    screenAdapter
});

</script>


<style lang="less" scoped>
</style>