<template>
  <div class="chart-wrapper">
    <div class="chart" ref="chart"></div>
    <span
      class="iconfont icon-xiangzuojiantou left-btn"
      @click="circleAnimate('left')"
    ></span>
    <span
      class="iconfont icon-xiangyoujiantou right-btn"
      @click="circleAnimate('left')"
    ></span>
  </div>
</template>

<script>
import '@/assets/iconfont/iconfont.css'
import { mapState } from 'vuex'
export default {
  name: 'HotProduct',
  data() {
    return {
      myChart: {},
      productData: [],
      currentIndex: 0
    }
  },
  created() {
    // websocket 数据获取
    this.$webSocket.registerCallback('hotData', this.getData)
    this.$webSocket.sendData({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hotproduct',
      value: ''
    })
  },
  mounted() {
    // await this.getData()
    if (this.productData.length !== 0) {
      this.initChart()
      window.addEventListener('resize', this.screenAdapter)
      this.screenAdapter()
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.screenAdapter)
    this.$webSocket.removeRegisterCallback('hotData')
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
  methods: {
    getData(data) {
      // const { data } = await this.$request.get('/hotproduct')
      this.productData = data
      if (this.$refs.chart) {
        this.initChart()
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
      }
    },
    initChart() {
      this.myChart = this.$echarts.init(
        this.$refs.chart,
        this.theme === 'dark' ? 'dark-blue' : 'vintage'
      )
      this.makeChart()
    },
    makeChart() {
      const legendData = this.productData[this.currentIndex].children.map(
        (item) => {
          return item.name
        }
      )
      const seriesData = this.productData[this.currentIndex].children.map(
        (item) => {
          return {
            name: item.name,
            value: item.value,
            children: item.children
          }
        }
      )
      this.myChart.setOption({
        title: {
          text: '┃ 热销' + this.productData[this.currentIndex].name + '产品'
        },
        tooltip: {
          show: true,
          // hover展示三级分类
          formatter: (arg) => {
            const thirdCategory = arg.data.children
            let total = 0
            thirdCategory.forEach((item) => {
              total += item.value
            })
            let retStr = ''
            thirdCategory.forEach((item) => {
              retStr += `
                  ${item.name}: ${
                ((item.value / total) * 100).toFixed(2) + '%'
              }<br/>
                  `
            })
            return retStr
          }
        },
        legend: {
          data: legendData,
          icon: 'circle',
          top: '12%'
        },
        series: [
          {
            type: 'pie',
            data: seriesData,
            label: {
              show: false
            },
            // 高亮模式下的各种配置
            emphasis: {
              label: {
                show: true
              },
              labelLine: {
                show: false
              }
            }
          }
        ]
      })
    },
    circleAnimate(direction) {
      if (direction === 'left') {
        this.currentIndex--
        this.currentIndex =
          this.currentIndex < 0
            ? this.productData.length - 1
            : this.currentIndex
      } else {
        this.currentIndex++
        this.currentIndex =
          this.currentIndex > this.productData.length - 1
            ? 0
            : this.currentIndex
      }
      this.makeChart()
    },
    screenAdapter() {
      let adapterFont = this.$refs.chart.offsetWidth / 29
      this.myChart.setOption({
        title: {
          textStyle: {
            fontSize: adapterFont
          },
          left: adapterFont / 2,
          top: adapterFont / 2
        },
        legend: {
          itemWidth: adapterFont / 2.3,
          itemHeight: adapterFont / 2.3,
          itemGap: adapterFont / 2.3,
          textStyle: {
            fontSize: adapterFont / 1.5
          }
        },
        series: [
          {
            type: 'pie',
            radius: adapterFont * 5.7, //饼图半径大小
            center: ['50%', '60%'] // 饼图圆心位置
          }
        ]
      })
      this.myChart.resize()
    }
  }
}
</script>

<style lang="less" scoped>
span {
  position: absolute;
  z-index: 99;
  font-size: 40px;
  transform: translateY(-50%);
}
.left-btn {
  left: 10%;
  top: 60%;
  color: pink;
}
.right-btn {
  right: 10%;
  top: 60%;
  color: pink;
}
</style>
