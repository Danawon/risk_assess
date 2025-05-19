<template>
  <!-- 黑色底色 -->
  <div class="bg" />
  <!-- 蓝色遮罩层 -->
  <div class="blue" />
  <ScreenAdapter>
    <div class="content">
      <!-- 背景图 -->
      <div style="position: relative;">
        <img src="@/assets/box.png" alt="账号" width="672px" />
        <div class="circleBg" :style="`background-image: url(${info.background})`" />
      </div>
      <!-- 表单 -->
      <div class="form">
        <img src="@/assets/formBg.png" alt="账号" width="487px" />
        <div>
          <h3>{{ info.title }}</h3>
          <div class="login-input-wrap">
            <img src="@/assets/account-icon.png" alt="账号" width="24px" />
            <input type="text" v-model.trim="formData.username" placeholder="账号" />
          </div>
          <div class="login-input-wrap">
            <img src="@/assets/password-icon.png" alt="密码" />
            <input type="password" v-model.trim="formData.password" width="29px" placeholder="密码" />
          </div>
          <div class="login-options">
            <input v-model="formData.check" type="checkbox" /> 自动登录
          </div>
          <div class="login-btn" @click="submitForm">登录</div>
        </div>
      </div>
    </div>
  </ScreenAdapter>
</template>

<script>
import ScreenAdapter from '../../components/ScreenAdapter';
import { login, system } from '@/api';
import { ElMessage } from 'element-plus';
export default {
  name: "LoginPage",
  components: { ScreenAdapter },
  data() {
    return {
      formData: {},
      info: {}
    }
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code") || '';
    system({ code }).then(res => this.info = res)
  },
  methods: {
    // 登录
    submitForm() {
      if(!this.formData.username) {
        ElMessage({
          message: '请填写账号信息！',
          type: 'error',
        })
        return
      }
      if(!this.formData.password) {
        ElMessage({
          message: '请填写密码！',
          type: 'error',
        })
        return
      }
      login(this.formData).then(res => {
        sessionStorage.setItem('deviceId', res.deviceId)
        sessionStorage.setItem('monitorToken', res.token)
        this.$router.push('/')
      })
    }
  }
};
</script>

<style scoped lang="scss">
.blue, .bg {
  width: 100%;
  height: 100%;
  position: absolute;
}
.blue {
  background: linear-gradient(90deg, rgba(0, 20, 28, 0.07) 0%, rgba(0, 24, 145, 0.68) 100%);
}
.bg {
  background: #212121;
}
.content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  margin: auto;
  height: fit-content;
  width: fit-content;
  display: flex;
  color: #fff;
  align-items: center;
  gap: 170px;
}
.circleBg {
  width: 618px;
  height: 618px;
  border-radius: 100%;
  position: absolute;
  top: 26px;
  left: 27px;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
.form {
  width: 487px;
  height: 692px;
  border-radius: 10px;
  padding: 43px;
  position: relative;
  > img {
    position: absolute;
    left: 0;
    top: -50px;
    z-index: 2;
  }
  > div {
    position: relative;
    z-index: 3;
  }
}
h3 {
  text-align: center;
  font-size: 30px;
  margin: 40px 0 65px 0;
  user-select: none;
  letter-spacing: 2px;
}
.login-input-wrap {
  height: 60px;
  padding: 0 16px;
  border-radius: 10px;
  background: rgba(69, 82, 130, 0.5);
  margin: 30px 0;
  display: flex;
  align-items: center;
  img {
    margin-right: 9px;
  }
  input {
    flex: 1;
    background: transparent;
    color: #fff;
    font-size: 24px;
    outline: none;
    letter-spacing: 1px;
    border: none;
    &::placeholder {
      color: rgba(105, 115, 150, 1);
    }
  }
}
.login-options {
  display: flex;
  align-items: center;
  font-size: 16px;
  input {
    width: 17px;
    height: 17px;
    border-radius: 4px;
    margin-right: 13px;
  }
}
.login-btn {
  margin-top: 60px;
  border-radius: 10px;
  background: #1D51DE;
  line-height: 60px;
  text-align: center;
  box-shadow: 0px 4px 8px -1px #0C1CAD;
  font-size: 24px;
  cursor: pointer;
}
</style>
