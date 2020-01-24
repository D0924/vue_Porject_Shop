<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区 -->
      <div class="avater_box">
        <img src="../assets/logo.png"
             alt />
      </div>
      <!-- 登入表表单区 -->
      <el-form ref="loginFormRef"
               class="login_form"
               :model="loginForm"
               :rules="loginRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user"
                    v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-3702mima"
                    v-model="loginForm.password"
                    type="password"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary"
                     @click="validateLoginForm">登入</el-button>
          <el-button type="info"
                     @click="ressetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单的验证规则
      loginRules: {
        // 用户名验证规则
        username: [
          { required: true, message: '请输入登入名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 用户密码验证规则
        password: [
          { required: true, message: '请输入登入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    ressetLoginForm: function () {
      this.$refs.loginFormRef.resetFields()
    },
    validateLoginForm: function () {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登入失败')
        this.$message.success('登入成功')
        // 1.将登入成功之后的token,保存到客户端的sessionStorage中
        // 1.1项目除了登入的API接口以外，全部必须需要登入才能访问
        // 1.2token只在当前网址打开期间有效，所以将token保存到sessionStorage中
        // 2.跳转到后台的home页面
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  // 绝对定位
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avater_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      border-radius: 50%;
      width: 100%;
      height: 100%;
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  // 设置盒模型
  box-sizing: border-box;
}
.btns {
  display: flex;
  // 尾部对其
  justify-content: flex-end;
}
</style>
