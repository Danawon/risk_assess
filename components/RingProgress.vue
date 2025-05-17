<template>
    <svg viewBox="0 0 100 100" style="transform: rotate(-35deg);">
        <defs>
            <linearGradient :id="idName" x1="100%" y1="100%" x2="18%" y2="18%">
                <stop offset="0%" :style="`stop-color: ${color[0]}`" stop-opacity=".3" />
                <stop offset="100%" :style="`stop-color: ${color[1]}`" stop-opacity="1" />
            </linearGradient>
        </defs>
        <path class="el-progress-circle__track" d="M 50 50 m 0 46 a 46 46 0 1 1 0 -92 a 46 46 0 1 1 0 92" stroke="rgba(255,255,255,.1)" stroke-linecap="round" stroke-width="8" fill="none" style="stroke-dasharray: 236px, 289.027px; " />
        <path class="el-progress-circle__path" d="M 50 50 m 0 46 a 46 46 0 1 1 0 -92 a 46 46 0 1 1 0 92" :stroke="`url(#${ idName })`" fill="none" opacity="1" stroke-linecap="round" stroke-width="8" :style="`stroke-dasharray: ${ offset * 236 }px, 289.027px; transition: stroke-dasharray 0.15s;`">
        </path>
    </svg>
</template>
<script>
export default {
  name: "RingProgress",
  //参数注入
  props: ['color', 'status', 'idName'],
  data() {
    return {
        offset: 1,
        timer: null
    };
  },
  watch: {
    status(val) {
        if(val) {
            this.offset = 0
            this.timer = setInterval(() => {
                this.offset = ((this.offset % 1) + 0.1).toFixed(2)
                console.log(this.offset)
            }, 150)
        } else {
            this.offset = 1
            this.timer && clearInterval(this.timer)
        }
    }
  },
  mounted() {
  },
  methods: {
  }
};
</script>
<style lang="scss" scoped>
</style>
