<template>
  <div class="chart-wrapper">
    <div class="chart" ref="chart"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Seller',
  data() {
    return {
      myChart: {},
      chartData: [],
      showChartData: [],
      intervalIdx: 0,
      maxIntervalIdx: 0,
      intervalTimer: null
    }
  },
  created() {
    // websocket 数据获取
    this.$webSocket.registerCallback('sellerData', this.getData)
    this.$webSocket.sendData({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    })
  },
  mounted() {
    // await this.getData()
    if (this.chartData.length !== 0) {
      this.initChart()
      // 设置自适应
      window.addEventListener('resize', this.screenAdapter)
      this.screenAdapter()
    }
  },
  destroyed() {
    clearInterval(this.intervalTimer)
    window.removeEventListener('resize', this.screenAdapter)
    this.$webSocket.removeRegisterCallback('sellerData')
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
      // const { data } = await this.$request.get('seller')
      this.chartData = data
      this.chartData.sort((a, b) => {
        return a.value - b.value
      })
      let dataLength = this.chartData.length
      this.maxIntervalIdx = dataLength % 5 ? dataLength / 5 + 1 : dataLength / 5
      this.startInterval()
      if (this.$refs.chart) {
        this.initChart()
        // 设置自适应
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
      }
    },
    // 初始化图表
    initChart() {
      this.myChart = this.$echarts.init(
        this.$refs.chart,
        this.theme === 'dark' ? 'dark-blue' : 'vintage'
      )
      this.setMouseEvent(this.myChart)
      const initOption = {
        title: {
          text: '┃ 商家销售统计'
          /*     textStyle: {
            fontSize: 66
          },
          left: 30,
          top: 35 */
        },
        // 图表的边框
        grid: {
          show: true,
          top: '17%',
          left: '3%',
          right: '6%',
          bottom: '6%',
          //包含文字
          containLabel: true
        },
        // 点击提示
        tooltip: {
          trigger: 'axis',
          // 配置 白色阴影条
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: 'rgba(255, 255, 229, 0.671)',
              width: 66
            }
          },
          triggerOn: 'mousemove'
        },
        xAxis: {
          type: 'value',
          // 坐标轴列表字体大小
          axisLabel: {
            fontSize: 15
          },
          max: 250
        },
        yAxis: {
          type: 'category',
          axisLabel: {
            fontSize: 15
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: 66,
            // 柱体右侧字体设置
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: {}
              }
            },
            // 设置线性渐变
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgb(128, 255, 165)' //渐变开始颜色
                  },
                  {
                    offset: 1,
                    color: 'rgb(1, 191, 236)' // 渐变结束时的颜色
                  }
                ]
              },
              // 柱体圆角设定
              barBorderRadius: [0, 33, 33, 0]
            }
          }
        ]
      }
      this.myChart.setOption(initOption)
      this.makeChart()
    },
    // 更新图表的数据
    makeChart() {
      this.showChartData = this.chartData.slice(
        this.intervalIdx * 5,
        this.intervalIdx * 5 + 5
      )
      const xAxisData = this.showChartData.map((item) => {
        return item.value
      })
      const yAxisData = this.showChartData.map((item) => {
        return item.name
      })
      const dataOption = {
        yAxis: {
          data: yAxisData
        },
        series: [
          {
            type: 'bar',
            data: xAxisData
          }
        ]
      }
      this.myChart.setOption(dataOption)
    },
    // 设置定时器，来更新图表的数据
    startInterval() {
      if (this.intervalTimer) {
        clearInterval(this.intervalTimer)
      }
      this.intervalTimer = setInterval(() => {
        this.intervalIdx++
        if (this.intervalIdx >= this.maxIntervalIdx) {
          this.intervalIdx = 0
        }
        this.makeChart()
      }, 5000)
    },
    // 图表绑定鼠标事件来确定定时器的暂停与开启
    setMouseEvent() {
      this.myChart.on('mouseover', () => {
        clearInterval(this.intervalTimer)
      })
      this.myChart.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 设置屏幕自适应
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
        // 点击提示
        tooltip: {
          // 配置 白色阴影条
          axisPointer: {
            lineStyle: {
              width: adapterFont
            }
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: adapterFont,
            // 设置线性渐变
            itemStyle: {
              // 柱体圆角设定
              barBorderRadius: [0, adapterFont / 2, adapterFont / 2, 0]
            }
          }
        ]
      }
      this.myChart.setOption(adapterOption)
      this.myChart.resize()
    }
  }
}
</script>

<style lang="less"></style>
