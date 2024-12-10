import {createRouter,createWebHistory} from 'vue-router'

import sellerPage from '@/views/sellerPage.vue'
import Trendpage from '@/views/trendpage.vue'
import MapPage from '@/views/MapPage.vue'
import RankPage from '@/views/RankPage.vue'
import HotPage from '@/views/HotPage.vue'
import StockPage from '@/views/StockPage.vue'
import ScreenPage from '@/views/screenPage.vue'
 

const router = createRouter({
    history:createWebHistory(),
    routes:[
        {
            path:'/',
            redirect:'screen'
            
        },
        {
            path:'/screen',
            component:ScreenPage
            
        },
        {
            path:'/sellerPage',
            component:sellerPage
            
        },{
            path:'/trendPage',
            component:Trendpage
        },{
            path:'/mapPage',
            component:MapPage
        },{
            path:'/rankPage',
            component:RankPage
        },{
            path:'/hotpage',
            component:HotPage
        },{
            path:'/stockpage',
            component:StockPage
        }

       
    ]
})


export default router


// {
//     path:'/home',
//     component:home
// },
// {
//     path:'/news',
//     component:news,
//     children:[
//         {
//             path:'detail',
//             component:newdetai1
//         }
//     ]
// },
// {
//     path:'/about',
//     component:about
// }