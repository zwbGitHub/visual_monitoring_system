<template>
  <div class="chart-wrapper">
    <div
      class="select-container"
    >
      <span  :style="{
          fontSize: titleFontSize,
          color: theme === 'dark' ? 'white' : ''
        }">┃</span>
      <select
        v-model="selectValue"
        class="select-wrapper"
        :style="{
          fontSize: titleFontSize,
          color: theme === 'dark' ? 'white' : ''
        }"
      >
        <option
          v-for="item of chartData.type"
          :key="item.key"
          :value="item.key"
          :style="{
          color: theme === 'dark' ? 'black' : ''
        }"
        >
          {{ item.text }}
        </option>
      </select>
    </div>
    <div class="chart" ref="chart"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Trend',
  data() {
    return {
      myChart: {},
      chartData: [],
      selectValue: 'map',
      chartItemColor: [
        { first: 'rgb(128, 255, 165)', last: 'rgb(1, 191, 236)' },
        { first: 'rgb(0, 221, 255)', last: 'rgb(77, 119, 255)' },
        { first: 'rgb(55, 162, 255)', last: 'rgb(116, 21, 219)' },
        { first: 'rgb(116, 21, 219)', last: 'rgb(135, 0, 157)' },
        { first: 'rgb(255, 191, 0)', last: 'rgb(224, 62, 76)' }
      ],
      adapterFont: 0
    }
  },
  created() {
    // websocket 数据获取
    this.$webSocket.registerCallback('trendData', this.getData)
    this.$webSocket.sendData({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    })
  },
  mounted() {
    // await this.getData()
    if (this.chartData.length !== 0) {
      this.initChart()
      window.addEventListener('resize', this.screenAdapter)
      this.screenAdapter()
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.screenAdapter)
    this.$webSocket.removeRegisterCallback('trendData')
  },
  watch: {
    selectValue() {
      this.makeChart()
    },
    theme() {
      // 销毁当前图标，重新挂载新主题的图标
      this.myChart.dispose()
      this.initChart()
      this.screenAdapter()
    }
  },
  computed: {
    titleFontSize() {
      return this.adapterFont / 1.3 + 'px'
    },
    ...mapState(['theme'])
  },
  methods: {
    getData(data) {
      // const { data } = await this.$request.get('/trend')
      this.chartData = data
      // console.log(data)
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
      const initOption = {
        color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
        legend: {
          icon: 'circle',
          left: '5%',
          top: '11%'
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
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false, // 轴线紧挨y轴
          data: !this.chartData.common ? '' : this.chartData.common.month
        },
        yAxis: {
          type: 'value',
          scale: true
        }
      }
      this.myChart.setOption(initOption)
      this.makeChart()
    },
    makeChart() {
      let { data } = this.chartData[this.selectValue]
      const legendData = data.map((item) => {
        return item.name
      })
      const seriesData = data.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          stack: 'all', // 设置堆叠图
          smooth: true, // 设置平滑的曲线
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: this.chartItemColor[index].first
              },
              {
                offset: 1,
                color: this.chartItemColor[index].last
              }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: item.data
        }
      })
      const dataOption = {
        color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
        legend: {
          data: legendData
        },
        series: seriesData
      }
      this.myChart.setOption(dataOption)
    },
    screenAdapter() {
      this.adapterFont = this.$refs.chart.offsetWidth / 29
      const adapterOption = {
        legend: {
          itemWidth: this.adapterFont / 2,
          itemHeight: this.adapterFont / 2,
          itemGap: this.adapterFont / 2, // icon 间距
          textStyle: {
            fontSize: this.titleFontSize / 2 // 图例文字
          }
        }
      }
      this.myChart.setOption(adapterOption)
      this.myChart.resize()
    }
  }
}
</script>

<style lang="less" scoped>
.select-container {
  position: absolute;
  z-index: 999;
  left: 3%;
  top: 3%;
  .select-wrapper {
    border: none;
    background-color: transparent;
    outline: none;
    option {
      font-size: 1em;
    }
  }
}
</style>
