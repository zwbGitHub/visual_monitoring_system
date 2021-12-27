export default class SocketService {
  //  单例模式
  static instance = null
  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }
  ws = null
  callbackMapData = {}
  serverStart = false
  // 定义链接服务器的方法
  connect() {
    if (!window.WebSocket) {
      console.log('浏览器不支持websocket')
      return
    }
    this.ws = new WebSocket('ws://localhost:9998')

    // 连接成功事件
    this.ws.onopen = () => {
      console.log('服务端连接成功')
      this.serverStart = true
    }
    // 链接失败的事件
    this.ws.onclose = () => {
      this.serverStart = false
      setTimeout(() => {
        this.connect()
      }, 3000)
    }
    // 接收数据的事件
    this.ws.onmessage = (msg) => {
      //  console.log(msg)
      const recvData = JSON.parse(msg.data)
      const socketType = recvData.socketType
      if (this.callbackMapData[socketType]) {
        const action = recvData.action
        if (action === 'getData') {
          const realData = JSON.parse(recvData.data)
          // console.log(this)
          this.callbackMapData[socketType].call(this, realData) // 此处可以不使用call调用，直接调用也可以，应为传过来的getData中的this始终为vc实例对象
        } else if (action === 'fullScreen') {
          this.callbackMapData[socketType].call(this, recvData)
        } else if (action === 'themeChange') {
          this.callbackMapData[socketType].call(this, recvData)
        }
      }
    }
  }
  // 注册回调函数
  registerCallback(socketType, callback) {
    this.callbackMapData[socketType] = callback
  }
  // 取消回调函数
  removeRegisterCallback(socketType) {
    this.callbackMapData[socketType] = null
  }
  // 发送数据
  sendData(data) {
    // 判断服务器是否开启，重新发送数据
    if (this.serverStart === false) {
      setTimeout(() => {
        this.sendData(data)
      }, 1000)
    } else {
      this.ws.send(JSON.stringify(data))
    }
  }
}
