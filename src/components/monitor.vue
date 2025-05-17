<template>
<!-- 团课背景图 -->
<img :src="info.background" class="bg" />
<!-- 遮罩层 -->
<div class="cover" />
<!-- 页面 -->
<ScreenAdapter>
  <div class="page">
    <!-- 顶部 -->
    <div class="header flex">
      <img :src="info.logo" height="40px" style="margin-left: 18px;" />
      <div class="time">{{ currentTime }}</div>
      <div>
        <img :src="require(`@/assets/monitor/${info.deviceStatus ? 'device_g' : 'device'}.png`)" height="26px" />
        <img :src="require(`@/assets/monitor/${info.bluetoothStatus ? 'bluetooth_b' : 'bluetooth'}.png`)" height="26px" style="margin-left: 13px;" />
      </div>
    </div>
    <!-- 内容 -->
    <div class="content">
      <div class="left">
        <!-- 左侧内容 -->
        <div class="flex">
          <img src="@/assets/monitor/scan.png" width="19px" />设备扫码
        </div>
        <div class="code">
          <img :src="info.qrcode" width="100%" />
        </div>
        <div class="flex">
          <img src="@/assets/monitor/report.png" width="21px" />查看报告
        </div>
      </div>
      <!-- 中间内容 -->
      <div>
        <div class="centerTop">
          <div class="rate">
            <img src="@/assets/monitor/circle.png" height="420px" />
            <div>
              <img src="@/assets/monitor/icon_rate.png" height="38px" />
              <div>{{ heartlung.heartRate || 0 }}</div>
              <label>bpm</label>
            </div>
          </div>
          <div class="detection flex">
            <div>
              <div>
                <img src="@/assets/monitor/resistance.png" height="21px" />阻力检测
              </div>
              <div class="ring-clip">
                <RingProgress :color="['#FFFFFF', '#FF8D1A']" idName="yellow" :status="heartlung.status && heartlung.resistanceClass" />
                <p>{{ heartlung.resistanceClass || 0 }}</p>
              </div>
            </div>
            <div>
              <div>
                <img src="@/assets/monitor/power.png" height="20px" />功率检测
              </div>
              <div class="ring-clip">
                <RingProgress :color="['#52E2FF', '#35ADE6']" idName="blue" :status="heartlung.status && heartlung.power" />
                <p>{{ heartlung.power || 0 }}</p>
              </div>
            </div>
            <div>
              <div>
                <img src="@/assets/monitor/resistance.png" height="23px" />转速检测
              </div>
              <div class="ring-clip">
                <RingProgress :color="['#52E2FF', '#AC33C1']" idName="purple" :status="heartlung.status && heartlung.cadence" />
                <p>{{ heartlung.cadence || 0 }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="centerBottom">
          <div v-html="info.notes" />
        </div>
      </div>
      <!-- 右侧内容 -->
      <div class="right">
        <!-- 阶段进度条 -->
        <div class="flex" style="gap: 10px;">
          <img src="@/assets/monitor/arrow.png" width="40px" style="transform: rotate(180deg);" />
          <div class="level">
            <div v-for="item, key in info.stageHeartRateRanges" :key="key"> 
              <div v-if="key <= info.currentStage" v-bind:style="{
                background: `linear-gradient(90deg,${item.color[0]} 0%,${item.color[1] || item.color[0]} 100%)`,
                // animationPlayState: 'paused/running'
                animationDuration: `${key < info.currentStage &&   info.seconds}s`,
                // animationDelay: `${key * (info.seconds/5)}s`
              }" />
              <span>{{ item.interval }}</span>
            </div>
          </div>
          <img src="@/assets/monitor/arrow.png" width="40px" />
          <div class="countdown">{{ info.seconds }}</div>
        </div>
        <!-- 阶段文案 -->
        <div class="levelText">
          <div>
            <p v-for="item, key in info.stageHeartRateRanges" :key="key">
              {{ item.name }}
            </p>
          </div>
          <p>倒计时</p>
        </div>
        <!-- 血压值 -->
        <div class="bloodPressure flex" v-for="item, k in info.testData" :key="k">
          <div class="number">{{ item.stage }}</div>
          <div style="margin: 0 49px 0 27px;">
            <span>血压值mmHg</span>
            <p>{{ item.bloodPressure }}</p>
          </div>
          <div class="switch flex">
            <label>摄氧量</label>
            <div>{{ item.oxygenUptake }}ml/kg/min</div>
          </div>
          <img src="@/assets/monitor/check.png" width="40px" />
          <div class="switch flex">
            <label>功率</label>
            <div>{{ item.power }}w</div>
          </div>
        </div>
        <!-- 开始、结束按钮 close-->
        <div :class="['btn', info.testStarted && 'close']" @click="operate(info.testStarted ? 'stop' : 'confirm')">
          <img src="@/assets/monitor/close.png" width="19px" /> {{info.testStarted ? '结束' : '开始'}}
        </div>
        <!-- 初始值 -->
        <div class="flex initial">
          <div>
            <span>开始血压值mmHg</span>
            <p>{{ info.startBloodPressure }}</p>
          </div>
          <div>
            <span>结束血压值mmHg</span>
            <p>{{ info.endBloodPressure }}</p>
          </div>
          <div class="btn">
            <img src="@/assets/monitor/close.png" width="26px" />
          </div>
        </div>
      </div>
    </div>
  </div>
</ScreenAdapter>
</template>
  
<script>
import ScreenAdapter from '../../components/ScreenAdapter';
import RingProgress from '../../components/RingProgress';
import { getInfo, startTest, endTest, stopTest } from '@/api';
import { ElMessageBox } from 'element-plus'
export default {
  name: "HeartRateMonitor",
  components: { ScreenAdapter, RingProgress },
  data() {
    return {
      currentTime: '',
      time: null,
      heartlung: {},
      info: {},
      deviceId: sessionStorage.getItem('deviceId'),
      ws: null,
      heartbeatTimer: null,
      reconnectTimer: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      animationTime: 0
    }
  },
  created() {
    this.getBase()
    this.updateTime()
    this.time = setInterval(this.updateTime, 1000)
  },
  beforeUnmount() {
    clearInterval(this.time)
    this.closeWebSocket();
  },
  mounted() {
    // this.heartlung.status = 1
    // this.heartlung.cadence = 90
  },
  methods: {
    // 获取页面信息
    getBase() {
      getInfo().then(res => {
        // 处理二维码数据
        if(!res.qrcode.includes("data:image")) {
          res.qrcode = `data:image/png;base64,${res.qrcode}`
        }
        this.info = res
      })
    },
    // 开始、结束、终止测试
    operate(type) {
      if(type == 'cancel') {
        endTest()
      } else if (type == 'confirm') {
        startTest().then(() => this.getBase())
      } else {
        stopTest().then(() => this.getBase())
      }
    },
    // 获取实时时间
    updateTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      this.currentTime = `${hours}:${minutes}:${seconds}`;
    },
    // 处理接收到的数据
    handlData(data) {
      const _data = data.data
      switch (data.event) {
        case 'connectFail':
          this.info.deviceStatus = 0
          break;
        case 'connectSuccess':
          this.info.deviceStatus = 1
          break;
        case 'btConnectFail':
          this.info.bluetoothStatus = 0
          break;
        case 'btConnectSuccess':
          this.info.bluetoothStatus = 1 
          break;
        case 'heartLung':
          this.heartlung = _data
          break;
        case 'oxygenUptakeResult':
          if(_data.maxOxygenUptake) {
            ElMessageBox.alert(`最大摄氧量为${_data.maxOxygenUptake}, 测试结果：${_data.name}, 超过${_data.exceed}的人;<br/>${_data.evaluate}`, '测试结束', {
              confirmButtonText: '继续',
              cancelButtonText: '结束',
              showCancelButton: true,
              dangerouslyUseHTMLString: true,
              callback: (res) => this.operate(res)
            })
            return
          }
          this.info.testData[_data.stage - 1].power = _data.power
          this.info.testData[_data.stage - 1].oxygenUptake = _data.oxygenUptake
          break;
        case 'powerStartReady':
          this.info.seconds = _data.seconds
          if(this.info.currentStage != _data.stage) {
            this.info.currentStage = _data.stage
            this.animationTime = _data.seconds
          }
          break;
        case 'powerStart':
          this.info.testData[_data.stage - 1].status = _data.status
          break;
        case 'powerEnd':
          this.info.testData[_data.stage - 1].status = 2
          break;
      }
    },
    // WebSocket连接
    initWebSocket() {
      try {
        this.ws = new WebSocket("wss://devsaas.hansifit.com/JbvZhE?");
        this.ws.onopen = () => {
          console.log("WebSocket连接已建立");
          this.reconnectAttempts = 0;
          this.startHeartbeat();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("收到WebSocket消息:", data);
          if (data.event === "pong") {
            // 处理心跳响应
            console.log("收到心跳响应");
            return
          }
          this.handlData(data)
        };

        this.ws.onclose = () => {
          console.log("WebSocket连接已关闭");
          this.stopHeartbeat();
          this.reconnect();
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket错误:", error);
        };
      } catch (error) {
        console.error("WebSocket初始化错误:", error);
        this.reconnect();
      }
    },
    // 每1秒发送一次心跳
    startHeartbeat() {
      this.heartbeatTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const heartbeat = {
            data: {},
            event: "ping",
            sign: this.deviceId,
          };
          this.ws.send(JSON.stringify(heartbeat));
        }
      }, 1000);
    },
    // 关闭连接
    closeWebSocket() {
      this.stopHeartbeat();
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      if (this.ws) {
        this.ws.close();
      }
    },
    // 关闭心跳
    stopHeartbeat() {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
    },
    // 重新连接
    reconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log( `尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.reconnectTimer = setTimeout(() => {
          this.initWebSocket();
        }, 5000); // 5秒后重试
      } else {
        console.error("达到最大重连次数，停止重连");
      }
    }
  }
};
</script>
  
<style scoped lang="scss">
.bg, .cover {
  width: 100%;
  height: 100%;
  position: absolute;
}
.cover {
  background: rgba(3, 3, 3, 0.8);
}
.page {
  padding: 0 20px;
  color: #fff;
}
.header {
  height: 124px;
  position: relative;
  .time {
    font-size: 36px;
    position: absolute;
    width: 100%;
    text-align: center;
  }
}
.content {
  display: flex;
  gap: 20px;
}
.left, .centerTop, .right, .centerBottom {
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.left {
  width: 163px;
  padding: 18px;
  font-size: 24px;
  background-image: url('@/assets/monitor/left.png');
  .code {
    padding: 6px;
    background: #fff;
    border-radius: 10px;
    font-size: 0;
  }
  .flex {
    margin: 25px 0;
  }
}
.centerTop {
  width: 838px;
  height: 679px;
  background-image: url('@/assets/monitor/centerTop.png');
}
.centerBottom {
  height: 217px;
  margin-top: 20px;
  padding: 20px 30px;
  background-image: url('@/assets/monitor/centerBottom.png');
  :deep(img) {
    max-height: 177px;
    max-width: 778px;
  }
}
.right {
  flex: 1;
  padding: 65px 20px 20px 20px;
  height: 915px;
  background-image: url('@/assets/monitor/right.png');
  > .btn {
    width: 285px;
    line-height: 80px;
    margin: 40px auto 50px auto;
  }
}
.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
// 心率
.rate {
  position: relative;
  font-size: 0;
  width: fit-content;
  padding: 40px 0;
  margin: auto;
  > div {
    position: absolute;
    width: 100%;
    top: 0;
    bottom: 0;
    margin: auto;
    height: fit-content;
    text-align: center;
    div {
      font-size: 130px;
      margin: 9px 0 10px 0;
    }
    label {
      font-size: 36px;
    }
  }
}
// 检测
.detection {
  font-size: 24px;
  padding: 0px 90px 0 100px;
  img {
    margin-right: 10px;
  }
 .ring-clip {
  margin-top: 20px;
  position: relative;
  height: 106px;
  width: 106px;
  margin: 20px auto 0 auto;
  p {
    position: absolute;
    text-align: center;
    width: 100%;
    top: 0;
    bottom: 0;
    font-size: 40px;
    height: fit-content;
    margin: auto;
  }
 }
}
// 阶段进度条
.level {
  flex: 1;
  border-radius: 100px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.46) 0%, rgba(204, 204, 204, 0.5) 100%);
  border: 2px solid #36ABE7;
  box-shadow: 0 2px 8px 0 rgba(255, 255, 255, 0.6) inset;
  padding: 8px;
  display: flex;
  gap: 3px;
  text-align: center;
  span {
    position: relative;
    z-index: 10;
    line-height: 48px;
  }
  > div {
    width: 20%;
    overflow: hidden;
    position: relative;
    div {
      position: absolute;
      height: 100%;
      top: 0;
      left: -100%;
      width: 100%;
      animation-name: myanimation;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
      box-shadow: -6px 7px 7px 0 rgba(255, 255, 255, 0.6) inset;
    }
    &:first-child {
      border-radius: 24px 0px 0px 24px;
    }
    &:last-child {
      border-radius: 0px 24px 24px 0;
    }
  }
}
@keyframes myanimation {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}
// 阶段文案
.levelText {
  display: flex;
  text-align: center;
  gap: 60px;
  padding-left: 50px;
  font-size: 12px;
  margin: 8px 0 45px 0;
  > p {
    width: 97px;
  }
  div {
    padding: 0 8px;
    p {
      width: 20%;
    }
    display: flex;
    gap: 3px;
    flex: 1;
  }
}
// 倒计时按钮
.countdown {
  border-radius: 10px;
  background: linear-gradient(270deg, rgba(0, 213, 255, 0.5) 0%, rgba(41, 128, 227, 0.5) 100%);
  border: 2px solid #00CCFF;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  width: 97px;
  line-height: 48px;
  font-size: 24px;
  text-align: center;
}
// 血压值
.bloodPressure {
  height: 90px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 20px;
  padding: 0 25px;
  background: url('@/assets/monitor/list.png') 0 -5px no-repeat;
  background-size: 100% calc(100% + 15px);
  justify-content: start;
  .number {
    width: 40px;
    border-radius: 50%;
    line-height: 40px;
    background: linear-gradient(90deg, #59B2FF 0%, #344199 100%);
  }
  img {
    margin-right: 25px;
    margin-left: auto;
  }
  .switch {
    width: 182px;
    line-height: 50px;
    background: linear-gradient(90deg, rgba(89, 178, 255, .6) 0%, rgba(52, 65, 153, .6) 100%);
    border-radius: 100px;
    padding-left: 18px;
    &:last-child {
      background: linear-gradient(90deg, rgba(235, 172, 26, .6) 0%, rgba(255, 68, 0, .6) 100%);
      div {
        background: rgba(255, 243, 189, 0.58);
        border: 1px solid #ffbf40;
      }
    }
    div {
      width: 97px;
      border-radius: 100px;
      background: rgba(179, 207, 232, 0.58);
      border: 1px solid #00ccff;
      box-shadow: 0px 2px 4px  rgba(0, 0, 0, 0.25);
      font-size: 14px;
    }
  }
}
.bloodPressure p, .initial p {
  margin-top: 10px;
  background: linear-gradient(0deg, #2980E3 0%, #fff 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
// 初始值
.initial {
  padding: 0 10px;
  .btn {
    width: 123px;
    line-height: 76px;
    margin-left: 10px;
  }
  div:not(.btn) {
    text-align: center;
    font-size: 20px;
    width: 304px;
    padding: 10px 0;
    border-radius: 10px;
    background: linear-gradient(180deg, rgba(133, 133, 133, 0.34) 0%, rgba(60, 89, 174, 0.5) 100%);
  }
}
// 关闭按钮
.btn {
  background: linear-gradient(90deg, #59B2FF 0%, #344199 100%);
  box-shadow: inset 0px 2px 13px  rgba(255, 255, 255, 0.88);
  border-radius: 100px;
  font-size: 20px;
  text-align: center;
  cursor: pointer;
  &.close {
    background: linear-gradient(90deg, #E37749 0%, #B6140D 100%);
  }
  img {
    vertical-align: text-bottom;
  }
}
</style>
  