<template>
  <div :class="['screen-wrapper', theme === 'dark' ? 'theme-color' : '']">
    <div
      class="header"
      :style="{
        backgroundImage: `url(${headerImg})`,
        color: theme === 'dark' ? 'white' : 'black'
      }"
    >
      <div class="logo">
        <img src="@/assets/img/logo.png" alt="优购网" />
      </div>
      <div class="text-title">优购平台实时监控系统</div>
      <div class="change-btn">
        <img
          src="@/assets/img/qiehuan_light.png"
          @click="changeTheme()"
          ref="changeIcon"
        />
        <span>{{ nowTime }}</span>
      </div>
    </div>
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top" :class="{ 'show-big-screen': bigScreen.trend }">
          <!-- 销量趋势图表 -->
          <trend ref="trend"></trend>
          <div class="resize" @click="setBigScreen('trend')">
            <!-- icon-compress-alt -->
            <span>◎</span>
          </div>
        </div>
        <div id="left-bottom" :class="{ 'show-big-screen': bigScreen.seller }">
          <!-- 商家销售金额图表 -->
          <seller ref="seller"></seller>
          <div class="resize" @click="setBigScreen('seller')">
            <!-- icon-compress-alt -->
            <span>◎</span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top" :class="{ 'show-big-screen': bigScreen.map }">
          <!-- 商家分布图表 -->
          <map-chart ref="map"></map-chart>
          <div class="resize" @click="setBigScreen('map')">
            <!-- icon-compress-alt -->
            <span>◎</span>
          </div>
        </div>
        <div id="middle-bottom" :class="{ 'show-big-screen': bigScreen.rank }">
          <!-- 地区销量排行图表 -->
          <rank ref="rank"></rank>
          <div class="resize" @click="setBigScreen('rank')">
            <!-- icon-compress-alt -->
            <span>◎</span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top" :class="{ 'show-big-screen': bigScreen.hot }">
          <!-- 热销商品占比图表 -->
          <hot-product ref="hot"></hot-product>
          <div class="resize" @click="setBigScreen('hot')">
            <!-- icon-compress-alt -->
            <span>◎</span>
          </div>
        </div>
        <div id="right-bottom" :class="{ 'show-big-screen': bigScreen.stock }">
          <!-- 库存销量分析图表 -->
          <stock-product ref="stock"></stock-product>
          <div class="resize" @click="setBigScreen('stock')">
            <!-- icon-compress-alt -->
            <span>◎</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import HotProduct from '../components/hotproduct'
import MapChart from '../components/map'
import Rank from '../components/rank'
import Seller from '../components/seller'
import StockProduct from '../components/stock'
import Trend from '../components/trend'
import dayjs from 'dayjs'
import { mapState } from 'vuex'
export default {
  name: 'ScreenPage',
  data() {
    return {
      nowTime: null,
      timer: null,
      headerImg: require('../assets/img/header_border_light.png'),
      bigScreen: {
        trend: false,
        seller: false,
        map: false,
        rank: false,
        hot: false,
        stock: false
      }
    }
  },
  components: { HotProduct, MapChart, Rank, Seller, StockProduct, Trend },
  created() {
    this.$webSocket.registerCallback('fullScreen', this.getScreenData)
    this.$webSocket.registerCallback('themeChange', this.getThemeChange)
  },
  mounted() {
    this.timerInterval()
  },
  computed: {
    ...mapState(['theme'])
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.$webSocket.removeRegisterCallback('fullScreen')
  },
  methods: {
    getScreenData(data) {
      this.bigScreen[data.chartName] = data.value
      // 重点，重点，重点
      this.$nextTick(() => {
        this.$refs[data.chartName].screenAdapter()
      })
    },
    getThemeChange(data) {
      // console.log(data)
      this.$store.commit('ChangeTheme', data.value)
      this.$refs.changeIcon.src = require(`@/assets/img/qiehuan_${data.value}.png`)
      this.headerImg = require(`../assets/img/header_border_${data.value}.png`)
    },
    timerInterval() {
      if (this.timer) {
        clearInterval(this.timer)
      } else {
        let date = new Date()
        this.nowTime = dayjs(date).format('YYYY年MM月DD日HH时mm分ss秒')
      }
      this.timer = setInterval(() => {
        let date = new Date()
        this.nowTime = dayjs(date).format('YYYY年MM月DD日HH时mm分ss秒')
      }, 1000)
    },
    changeTheme() {
      let themeChange = this.theme === 'light' ? 'dark' : 'light'
      this.$webSocket.sendData({
        action: 'themeChange',
        socketType: 'themeChange',
        chartName: null,
        value: themeChange
      })
    },
    setBigScreen(name) {
      let chartName = !this.bigScreen[name]

      this.$webSocket.sendData({
        action: 'fullScreen',
        socketType: 'fullScreen',
        chartName: name,
        value: chartName
      })
    }
  }
}
</script>

<style lang="less" scoped>
.screen-wrapper {
  background-color: rgb(254, 248, 239);
  height: 100%;
  width: 100%;
  overflow: hidden;
  .header {
    background-size: cover;
    background-repeat: no-repeat;
    width: 100%;
    height: 75px;
    position: relative;
    .logo {
      position: absolute;
      left: 20px;
      top: 0px;
      height: 54px;
      img {
        height: 100%;
      }
    }
    .text-title {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 30px;
    }
    .change-btn {
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
      img {
        vertical-align: center;
      }
      span {
        font-size: 20px;
        line-height: 40px;
        padding: 0 20px;
      }
    }
  }
  .screen-body {
    width: 100%;
    height: 100%;
    display: flex;
    margin-top: 10px;
    .screen-left {
      height: 100%;
      width: 27.6%;
      #left-top {
        height: 53%;
        position: relative;
      }
      #left-bottom {
        height: 31%;
        margin-top: 25px;
        position: relative;
      }
    }
    .screen-middle {
      height: 100%;
      width: 41.5%;
      margin-left: 1.6%;
      margin-right: 1.6%;
      #middle-top {
        width: 100%;
        height: 56%;
        position: relative;
      }
      #middle-bottom {
        margin-top: 25px;
        width: 100%;
        height: 28%;
        position: relative;
      }
    }
    .screen-right {
      height: 100%;
      width: 27.6%;
      #right-top {
        height: 46%;
        position: relative;
      }
      #right-bottom {
        height: 38%;
        margin-top: 25px;
        position: relative;
      }
    }
  }
  .resize {
    position: absolute;
    right: 6%;
    top: 3%;
    cursor: pointer;
    span {
      font-size: 2em;
      color: pink;
    }
    span:active {
      color: black;
    }
  }
}
.theme-color {
  background-color: rgb(51, 51, 51);
}
.show-big-screen {
  position: fixed !important;
  right: 0 !important;
  left: 0 !important;
  bottom: 0 !important;
  //  top: 0 !important;
  height: 100% !important;
  z-index: 999;
}
</style>
