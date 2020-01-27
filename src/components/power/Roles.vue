<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoles">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="rolseList" stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['dbbottom',i1===0?'dbtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2===0?'':'dbtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="角色操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="redactRigth(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-edit"
              size="mini"
              @click="deleteRigth(scope.row)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRigthDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--权限分配对话框-->
    <el-dialog title="分配权限" :visible.sync="SetRigthDialogVisible" width="50%" @close="closeRigth">
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRigthDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRigths()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑权限对话框 -->
    <el-dialog title="角色权限编辑" :visible.sync="redactRigthDialogVisible" width="50%">
      <div>
        <p>
          权限名称
          <el-input v-model="saveRedactRigth.roleName" placeholder="请输入内容"></el-input>
        </p>
        <p>
          权限描述相关
          <el-input v-model="saveRedactRigth.roleDesc" placeholder="请输入内容"></el-input>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="redactRigthDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="presentNewRigth">确 定</el-button>
      </span>
    </el-dialog>
    <!--  删除角色指定权限对话框 -->
    <el-dialog title="权限删除" :visible.sync="deleteRigthDialogVisible" width="50%">
      <span>您确定要删除当前角色权限吗?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteRigthDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteDialogVisible">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="30%">
      <div>
        <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRel">
          <el-form-item label="活动名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色相关描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有的角色列表
      rolseList: [],
      //  分配权限对话框的显示与隐藏
      SetRigthDialogVisible: false,
      //   索引权限的数据
      rightsList: [],
      //   树形控件属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      //  默认选择中的节点id值数组
      defKeys: [],
      // 当前点击用户权限的角色id
      roleId: '',
      // 编辑权限的显示与隐藏
      redactRigthDialogVisible: false,
      // 编辑权限暂存对象
      saveRedactRigth: {},
      // 编辑权限当前角色暂存id
      redactRolrRigthId: '',
      // 删除角色指定权限对话框显示与隐藏
      deleteRigthDialogVisible: false,
      // 点击删除角色暂存id
      saverdeleteRigthId: '',
      // 添加角色对话框显示与隐藏
      addRoleDialogVisible: false,
      // 添加角色暂存表单
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色的验证对象
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 7, message: '长度在 3 到 7 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入当前角色描述', trigger: 'blur' },
          { min: 3, max: 35, message: '长度在 3 到 35 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolseList()
  },
  methods: {
    //   获取所有的角色列表
    getRolseList: async function() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限角色失败')
      }
      this.rolseList = res.data
    },
    // 移除角色权限
    removeRightById: async function(role, rightId) {
      const confirmRest = await this.$confirm(
        '此操作将永久删除用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmRest !== 'confirm') return this.$message.info('删除已取消')
      //   确认删除角色指定权限
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除权失败')
      // 此处不建议重新查询数，只需要把原来角色用户权限覆盖成最新返回的权限即可
      //   this.getRolseList()
      role.children = res.data
    },
    // 分配权限的对话框
    showSetRigthDialog: async function(role) {
      // 获取所有的权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('权限获取失败')
      this.rightsList = res.data
      // 递归获取第三节点的id
      this.getLeafKeys(role, this.defKeys)
      this.roleId = role.id
      // 点击显示对话框
      this.SetRigthDialogVisible = true
    },
    // 通过递归的的形式获取角色所有三级权限的id,并保存到数组中
    getLeafKeys: function(node, arr) {
      // 三级节点下没有children元素
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 分配权限对话框关闭时清楚数组数据
    closeRigth: function() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    allotRigths: async function() {
      // 全选
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$message.error('权限分配失败')
      this.$message.success('权限分配成功')
      //   刷新数据
      this.getRolseList()
      //   关闭对话框
      this.SetRigthDialogVisible = false
    },
    // 分配权限按钮
    redactRigth: async function(role) {
      const { data: res } = await this.$http.put(`roles/${role.id}`, {
        roleName: role.roleName,
        roleDesc: role.roleDesc
      })
      if (res.meta.status !== 200) {
        return this.$message.error('权限信息获取失败')
      }
      this.saveRedactRigth = res.data
      // 显示对话框
      this.redactRigthDialogVisible = true
    },
    // 确认提交更新权限
    presentNewRigth: async function() {
      const { data: res } = await this.$http.put(
        `roles/${this.saveRedactRigth.roleId}`,
        {
          roleName: this.saveRedactRigth.roleName,
          roleDesc: this.saveRedactRigth.roleDesc
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('权限编辑修改提交失败')
      }
      this.$message.success('权限修改成功')
      this.getRolseList()
      // 关闭对话框
      this.redactRigthDialogVisible = false
    },
    // 删除权限
    deleteRigth: function(role) {
      this.saverdeleteRigthId = role.id
      this.deleteRigthDialogVisible = true
    },
    // 确认删除角色权限
    deleteDialogVisible: async function() {
      const { data: res } = await this.$http.delete(
        `roles/${this.saverdeleteRigthId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('角色权限删除失败')
      }
      this.$message.success('角色权限删除成功')
      this.deleteRigthDialogVisible = false
      this.getRolseList()
    },
    // 点击添加角色对话框
    addRoles: function() {
      this.addRoleDialogVisible = true
    },
    // 确认提交角色
    addRoleDialog: function() {
      // 验表单
      this.$refs.addRoleFormRel.validate(async valid => {
        if (valid === false) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('角添加失败')
        this.$message.success('角添加成功')
        this.getRolseList()
        this.addRoleDialogVisible = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.dbtop {
  border-top: 1px solid #eee;
}
.dbbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
