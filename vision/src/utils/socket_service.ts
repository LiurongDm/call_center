export default class SocketService {
    /**
     * 单例
     */
    static instance: SocketService | null = null;

    static get getintance(): SocketService {
        if (!this.instance) {
            this.instance = new SocketService();
        }
        return this.instance;
    }

    ws: WebSocket | null = null;

    // 存储回调函数
    private callBackMapping: { [key: string]: any } = {};

    // 标识是否连接成功
    connected = false

    // 记录重试的次数
    sendRetryCount = 0

    // 重新连接尝试的次数
    connectRetryCount = 0


    connect(): void {
        // 连接服务器
        if (!window.WebSocket) {
            return console.log("您的浏览器不支持web socket");
        }
        this.ws = new WebSocket('ws://localhost:9998');

        // 连接成功的事件
        this.ws.onopen = () => {
            console.log('连接成功')
            this.connected = true
            this.connectRetryCount = 0
        }

        this.ws.onclose = ()=>{
            console.log('连接服务端失败')
            this.connected = false
            this.connectRetryCount++
            setTimeout(() => {
                this.connect()
            }, 500 * this.connectRetryCount)
        }

        this.ws.onmessage = (msg)=>{
            // 对服务器发送过来的消息进行监听
            const recvData = JSON.parse(msg.data)
            // 拿到过来的消息的socketType
            const socketType = recvData.socketType
            console.log(this.callBackMapping)
            if (this.callBackMapping[socketType]) {
                const action = recvData.action
                // action为getData时，拿到对应的data数据，传给对应的回调函数
                if (action === 'getData') {
                  const realData = JSON.parse(recvData.data)
                  this.callBackMapping[socketType].call(this, realData)
                } else if (action === 'fullScreen') {
                    
                     // action为fullScreen时，传给回调函数源数据
                  console.log('进去回调函数赋值fullScreen')
                  this.callBackMapping[socketType].call(this, recvData)
                } else if (action === 'themeChange') {
                    // action为themeChange时，传给回调函数源数据
                  this.callBackMapping[socketType].call(this, recvData)
                }
              }else{
                console.log('进不去')
              }
            

        }
        
    }
    



    registerCallBack(socketType: string | number, callback: any) {
        // 将 socketType 转换为字符串
        this.callBackMapping[String(socketType)] = callback;
    }

    unRegisterCallBack(socketType: string | number) {
        // 同样将 socketType 转换为字符串
        delete this.callBackMapping[String(socketType)];
    }
      // 发送数据的方法
    send (data:any) {
        
        // 判断此时此刻有没有连接成功
        if (this.connected) {
            this.sendRetryCount = 0
            this.ws?.send(JSON.stringify(data))
        } else {
        this.sendRetryCount++
        setTimeout(() => {
            this.send(data)
        }, this.sendRetryCount * 500)
        }
    }
}
