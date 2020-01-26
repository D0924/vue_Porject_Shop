<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索区与添加区 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryIfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
              active-color="#13ce66"
              inactive-color="#ff4949"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserByid(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <!-- 分配角色按钮 -->
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryIfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryIfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加新用户" :visible.sync="addDialogVisible" width="50%" @close="addDialoged">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialoged">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo(editForm.id)">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClose"
    >
      <div>
        <p>当前用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>
          分配新角色
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义校验规则
    // eslint-disable-next-line no-unused-vars
    const checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
      // 验证邮箱的正则
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 自定义
    var checkMobile = (rule, value, cb) => {
      const Mobile = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/
      // 验证邮箱的正则
      if (Mobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户参数列表的对象
      queryIfo: {
        query: '',
        // 当前页
        pagenum: 1,
        // 一页显示多少条数据
        pagesize: 2
      },
      userList: [],
      // 总数
      total: 0,
      // 控制添对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户表单
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改用户的表单
      editForm: {},
      // 修改表单验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配角色的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色用户信息
      userInfo: {},
      // 所有的角色的信息
      rolesList: [],
      // 已选择的角色id值
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 使用axios发生请求获取用户信息
    getUserList: async function() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryIfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pageSize发生改变
    handleSizeChange: function(newSize) {
      this.queryIfo.pagesize = newSize
      this.getUserList()
    },
    // 页码页码值发生切换
    handleCurrentChange: function(newPage) {
      this.queryIfo.pagenum = newPage
      this.getUserList()
    },
    // 手动改变状态发生请求
    userStateChanged: async function(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状成功')
    },
    // 监听添加用户对话框关闭
    addDialoged: function() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加新用户
    addUser: function() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        // 关闭对话款
        this.addDialogVisible = false
      })
    },
    // 修改用户对话框
    showEditDialog: async function(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户修改信息列表失败')
      }

      this.editForm = res.data
    },
    // 监听修改表单的关闭
    editDialoged: function() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户并提交
    editUserInfo: function(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('新增用户验证失败')
        const { data: res } = await this.$http.put('users/:' + id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (!res.meta.status !== 200) {
          return this.$message.error('修改用户失败:' + res.meta.msg)
        }

        // 关闭对话框 提示更新成功 刷新数据
        this.editDialogVisible = false
        this.$message.suc('修改用户成功')
        this.getUserList()
      })
    },
    // 根据id删除用户
    removeUserByid: async function(id) {
      // 弹款
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 确认删除 confirm
      // 取消删除 cancel
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('users/' + id)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    // 点击分配角色按钮
    setRole: async function(userInfo) {
      this.userInfo = userInfo
      // 在展示对话框前查询所有的角色
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.message.error('角色列表获取失败')
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    //  点击按钮分配角色
    saveRoleInfo: async function() {
      if (!this.selectRoleId) return this.$message.error('请选择用户角色')
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectRoleId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配用户角色失败')
      }
      this.$message.success('成功')
      this.getUserList()
    },
    // 分配权限对话框关闭
    setRoleDialogClose: function() {
      this.setRoleDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
</style>
