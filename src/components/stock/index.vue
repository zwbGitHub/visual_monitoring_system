<template>
  <div class="chart-wrapper">
    <div class="chart" ref="chart"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'StockProduct',
  data() {
    return {
      stockData: [],
      myChart: {},
      showData: [],
      timer: null,
      timerIdx: 0
    }
  },
  created() {
    // websocket 数据获取
    this.$webSocket.registerCallback('stockData', this.getData)
    this.$webSocket.sendData({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      value: ''
    })
  },
  mounted() {
    // await this.getData()
    if (this.stockData.length !== 0) {
      this.initChart()
      window.addEventListener('resize', this.screenAdapter)
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timer)
    this.$webSocket.removeRegisterCallback('stockData')
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
      // const { data } = await this.$request.get('/stock')
      this.stockData = data
      if (this.$refs.chart) {
        this.initChart()
        window.addEventListener('resize', this.screenAdapter)
      }
    },
    initChart() {
      this.myChart = this.$echarts.init(
        this.$refs.chart,
        this.theme === 'dark' ? 'dark-blue' : 'vintage'
      )
      this.showData = this.stockData.slice(
        this.timerIdx * 5,
        (this.timerIdx + 1) * 5
      )
      this.makeChart()
      this.makeInterval()
    },
    makeChart() {
      const centerPosition = [
        ['20%', '40%'],
        ['50%', '40%'],
        ['80%', '40%'],
        ['35%', '75%'],
        ['65%', '75%']
      ]
      const itemColor = [
        {
          color: '#80FFA5'
        },
        {
          color: '#00DDFF'
        },
        {
          color: '#37A2FF'
        },
        {
          color: '#FF0087'
        },
        {
          color: '#FFBF00'
        }
      ]
      const seriesData = this.showData.map((item, index) => {
        return {
          type: 'pie',
          data: [
            {
              value: item.sales,
              itemStyle: {
                color: '#bbb'
              }
            },
            {
              name: item.name + '\n \n' + item.stock,
              value: item.stock,
              itemStyle: itemColor[index]
            }
          ],
          label: {
            position: 'center',
            color: itemColor[index].color,
            fontSize: 25
          },
          labelLine: {
            show: false
          },
          emphasis: {
            scale: false,
            focus: 'series'
          },
          hoverAnimation: false,
          // radius: [100, 110],
          center: centerPosition[index]
        }
      })
      this.myChart.setOption({
        title: {
          text: '┃ 商家库存统计'
        },
        series: seriesData
      })
      this.screenAdapter()
    },
    makeInterval() {
      if (this.timer) clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.timerIdx++
        if (this.timerIdx >= Math.ceil(this.stockData.length / 5)) {
          this.timerIdx = 0
        }
        this.showData = this.stockData.slice(
          this.timerIdx * 5,
          (this.timerIdx + 1) * 5
        )
        this.makeChart()
      }, 3000)
    },
    // 设置屏幕自适应
    screenAdapter() {
      let adapterFont = this.$refs.chart.offsetWidth / 29
      let seriesItem = []
      for (let i = 0; i < 5; i++) {
        seriesItem[i] = {
          radius: [adapterFont * 2.75, adapterFont * 3],
          label: {
            fontSize: adapterFont / 2.1
          }
        }
      }
      this.myChart.setOption({
        title: {
          textStyle: {
            fontSize: adapterFont
          },
          left: adapterFont / 2,
          top: adapterFont / 2
        },
        series: seriesItem
      })
      this.myChart.resize()
    }
  }
}
</script>

<style></style>
