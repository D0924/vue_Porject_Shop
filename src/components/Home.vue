<template>
  <div>
    <el-button type="info"
               @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    // 实现推出功能
    logout: function () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style>
</style>
