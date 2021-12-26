<template>
  <div class="chart-wrapper">
    <div class="chart" ref="chart"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Rank',
  data() {
    return {
      myChart: {},
      rankData: [],
      showData: [],
      intervalTimer: null,
      index: 10
    }
  },
  created() {
    // websocket 数据获取
    this.$webSocket.registerCallback('rankData', this.getData)
    this.$webSocket.sendData({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    })
  },
  mounted() {
    // await this.getData()
    if (this.rankData.length !== 0) {
      this.initChart()
      window.addEventListener('resize', this.screenAdapter)
      this.screenAdapter()
    }
  },
  beforeDestroy() {
    clearInterval(this.intervalTimer)
    window.removeEventListener('resize', this.screenAdapter)
    this.$webSocket.removeRegisterCallback('rankPage')
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
      // const { data } = await this.$request.get('/rank')
      this.rankData = data.sort((a, b) => {
        return b.value - a.value
      })
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
      this.myChart.setOption({
        title: {
          text: '┃ 地区销售排行'
          /*   textStyle: {
            fontSize: 66
          },
          left: 30,
          top: 35 */
        },
        // 图表的边框
        grid: {
          show: true,
          top: '20%',
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
            type: 'shadow'
          },
          triggerOn: 'mousemove'
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            fontSize: 15
          }
        },
        yAxis: {
          type: 'value',
          // name: '销售金额（love you）',
          axisLabel: {
            fontSize: 15
          },
          nameTextStyle: {
            fontSize: 15,
            align: 'left'
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: 66,
            // 柱体右侧字体设置
            label: {
              show: true,
              position: 'top',
              textStyle: {
                color: {}
              }
            },
            // 设置线性渐变及不同柱子的颜色
            itemStyle: {
              color: (arg) => {
                if (arg.value > 300) {
                  return {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: 'rgb(255, 191, 0)' //渐变开始颜色
                      },
                      {
                        offset: 1,
                        color: 'rgb(224, 62, 76)' // 渐变结束时的颜色
                      }
                    ]
                  }
                } else if (arg.value > 200) {
                  return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: 'rgb(55, 162, 255)' //渐变开始颜色
                    },
                    {
                      offset: 1,
                      color: 'rgb(116, 21, 219)' // 渐变结束时的颜色
                    }
                  ])
                } else {
                  return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: 'rgb(128, 255, 165)' //渐变开始颜色
                    },
                    {
                      offset: 1,
                      color: 'rgb(1, 191, 236)' // 渐变结束时的颜色
                    }
                  ])
                }
              },
              // 柱体圆角设定
              barBorderRadius: [33, 33, 0, 0]
            }
          }
        ]
      })
      this.showData = this.rankData.slice(0, this.index)
      this.makeChart()
      this.startInterval()
      this.myChart.on('mouseover', () => {
        clearInterval(this.intervalTimer)
      })
      this.myChart.on('mouseout', () => {
        this.startInterval()
      })
    },
    makeChart() {
      const rankName = this.showData.map((item) => {
        return item.name
      })
      const rankValue = this.showData.map((item) => {
        return item.value
      })
      this.myChart.setOption({
        xAxis: {
          type: 'category',
          data: rankName
        },

        series: [
          {
            type: 'bar',
            data: rankValue
          }
        ]
      })
    },
    // 设置屏幕自适应
    screenAdapter() {
      let adapterFont = this.$refs.chart.offsetWidth / 29
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: adapterFont / 2
          },
          left: adapterFont / 2,
          top: adapterFont / 2
        },
        series: [
          {
            barWidth: adapterFont,
            // 设置线性渐变及不同柱子的颜色
            itemStyle: {
              // 柱体圆角设定
              barBorderRadius: [adapterFont / 2, adapterFont / 2, 0, 0]
            }
          }
        ]
      }
      this.myChart.setOption(adapterOption)
      this.myChart.resize()
    },
    startInterval() {
      if (this.intervalTimer) clearInterval(this.intervalTimer)
      this.intervalTimer = window.setInterval(() => {
        if (this.index === this.rankData.length) {
          this.index = 0
        }
        this.showData.shift()
        this.showData.push(this.rankData[this.index])
        this.index++
        this.makeChart()
      }, 3000)
    }
  }
}
</script>

<style></style>
