const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
let isProduction = process.env.NODE_ENV
// 引入打包报告
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin
module.exports = {
  devServer: {
    // 配置默认打开端口号
    open: true
  },
  configureWebpack: (config) => {
    // 生产环境相关配置
    if (isProduction == 'production') {
      // 代码压缩
      config.plugins.push(
        new UglifyJsPlugin({
          uglifyOptions: {
            //生产环境自动删除 console
            warnings: false,
            compress: {
              // warnings: false, // 若打包错误，则注释这行
              drop_debugger: true,
              drop_console: true,
              pure_funcs: ['console.log']
            }
          },
          parallel: true
        })
      )
    }

    config.plugins.push(
      // 打包报告
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerHost: '127.0.0.1',
        analyzerPort: 8889,
        reportFilename: 'report.html',
        defaultSizes: 'parsed',
        openAnalyzer: true,
        generateStatsFile: false,
        statsFilename: 'stats.json',
        statsOptions: null,
        logLevel: 'info'
      })
    )
  },
  // 此配置防止生成无用的 source map文件，有了map就可以像未加密的代码一样，准确的输出是哪一行哪一列有错。
  productionSourceMap: process.env.NODE_ENV === 'production' ? false : true,

  // 发布模式externals托管
  chainWebpack: (config) => {
    config.when(process.env.NODE_ENV === 'production', (config) => {
      config.set('externals', {
        echarts: 'echarts',
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios'
      })
    })
  },
  // 改变打包后文件的绝对路径
  publicPath: './'
}
