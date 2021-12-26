<template>
  <div class="chart-wrapper">
    <div class="chart" ref="chart"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
// import { throttle } from 'lodash'
import pinyin from 'pinyin'
export default {
  name: 'MapChart',
  data() {
    return {
      myChart: {},
      mapData: [],
      allMap: {},
      nowMap: 'china',
      clearTimer: null
    }
  },
  created() {
    // websocket 数据获取
    this.$webSocket.registerCallback('mapData', this.getData)
    this.$webSocket.sendData({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      value: ''
    })
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme() {
      // 销毁当前图标，重新挂载新主题的图标
      this.myChart.dispose()
      this.initChart()
      this.screenAdapter()
    }
  },
  mounted() {
    // await this.getData()
    if (this.mapData.length !== 0) {
      this.initChart()
      window.addEventListener('resize', this.screenAdapter)
      this.screenAdapter()
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.screenAdapter)
    this.$webSocket.removeRegisterCallback('mapData')
  },
  methods: {
    getData(data) {
      // const { data } = await this.$request.get('/map')
      this.mapData = data
      if (this.$refs.chart) {
        this.initChart()
        // await this.getData()
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
      }
    },
    async initChart() {
      this.myChart = this.$echarts.init(
        this.$refs.chart,
        this.theme === 'dark' ? 'dark-blue' : 'vintage'
      )
      // 点击地图放大具体省的地图
      this.myChart.on('click', (e) => {
        clearTimeout(this.clearTimer)
        if (this.nowMap === 'china') {
          this.clearTimer = setTimeout(() => {
            this.updataAllMap(e.name)
          }, 500)
        }
      })

      // 双击返回中国地图
      this.myChart.on('dblclick', () => {
        if (this.nowMap !== 'china') {
          this.makeChinaMap()
        }
      })
      // 在获取数据前，显示加载loading
      this.myChart.showLoading()
      const { data } = await axios.get('/static/map/china.json')
      this.allMap.china = data
      // 请求获取数据后影藏loading加载
      this.myChart.hideLoading()
      this.$echarts.registerMap('china', this.allMap.china)
      this.myChart.setOption({
        title: {
          text: '┃ 商家分布'
          /*  textStyle: {
            fontSize: 66
          },
          left: 30,
          top: 35 */
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          label: {
            show: true // 展示标签
          },
          itemStyle: {
            areaColor: 'pink', // 省份背景
            borderColor: '#fff' // 省份间隔颜色
          }
        },
        color: ['#37A2FF', '#FF0087', '#FFBF00'], // 配置legend颜色
        // 顶部分类选择
        legend: {
          left: '5%',
          bottom: '5%',
          icon: 'circle',
          orient: 'vertical' // 竖向排列legend
        },
        // 点击提示
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
        }
      })
      this.makeChart()
    },
    makeChart() {
      const legendData = this.mapData.map((item) => {
        return item.name
      })
      const seriesList = this.mapData.map((item) => {
        return {
          data: item.children,
          name: item.name,
          type: 'effectScatter',
          coordinateSystem: 'geo', // 指明散点的坐标系统
          rippleEffect: {
            scale: 7, // 设置散点的大小
            brushType: 'stroke' // 设置空心涟漪效果
          }
        }
      })
      this.myChart.setOption({
        legend: {
          data: legendData
        },
        series: seriesList
      })
    },
    makeChinaMap() {
      this.$echarts.registerMap('china', this.allMap.china)
      this.myChart.setOption({
        geo: {
          type: 'map',
          map: 'china'
        }
      })
      this.nowMap = 'china'
    },
    async updataAllMap(name) {
      const pinyinArr = pinyin(name, {
        style: pinyin.STYLE_NORMAL // 设置拼音风格
      })
      let provincePinyin = ''
      pinyinArr.forEach((item) => {
        item[0] = item[0] === 'cang' ? 'zang' : item[0]
        item[0] = item[0] === 'zhong' ? 'chong' : item[0]
        provincePinyin = provincePinyin + item[0]
      })
      // 在获取数据前，显示加载loading
      this.myChart.showLoading()
      if (!this.allMap[provincePinyin] && this.nowMap === 'china') {
        try {
          const { data } = await axios.get(
            `/static/map/province/${provincePinyin}.json`
          )
          this.allMap[provincePinyin] = data
        } catch (error) {
          console.log(error)
        }
      }
      // 请求获取数据后影藏loading加载
      this.myChart.hideLoading()
      this.$echarts.registerMap(provincePinyin, this.allMap[provincePinyin])
      this.myChart.setOption({
        geo: {
          type: 'map',
          map: provincePinyin
        }
      })
      this.nowMap = provincePinyin
    },
    screenAdapter() {
      let adapterFont = this.$refs.chart.offsetWidth / 29
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: adapterFont / 1.3
          },
          left: adapterFont / 2,
          top: adapterFont / 2
        },
        legend: {
          itemWidth: adapterFont / 2.2,
          itemHeight: adapterFont / 2.2,
          itemGap: adapterFont / 2.2, // 竖向排列间距
          textStyle: {
            fontSize: adapterFont / 2.2 // 图例文字
          }
        }
      }
      this.myChart.setOption(adapterOption)
      this.myChart.resize()
    }
  }
}
</script>

<style lang="less" scoped></style>
