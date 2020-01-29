<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!--提示区域 -->
      <el-alert title="注意:只允许第三级分类设置参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 级联选择框 -->
          <el-cascader
            :options="cateList"
            :props="cascaderProps"
            v-model="selectedCateKeys"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab标签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态属性" name="many">
          <el-button
            type="primary"
            size="small"
            :disabled="isbtnDisabled"
            @click="dialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableDate" border strpie>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag -->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输出文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteCate(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="small"
            :disabled="isbtnDisabled"
            @click="dialogVisible=true"
          >添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableDate" border strpie>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag -->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输出文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteCate(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 提交参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="dialogVisible"
      width="50%"
      @close="addDialogColes"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      title="修改参数"
      :visible.sync="showEditDialogVisible"
      width="50%"
      @close="editDialogColes"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联配置信息
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 级联选择框双向数据绑定的数组
      selectedCateKeys: [],
      //   被激活页签名称
      activeName: 'many',
      //   按钮是否能使用
      isDisabled: '',
      //   动态属性
      manyTableDate: [],
      //   静态属性
      onlyTableDate: [],
      // 添加属性对话框的显示与隐藏
      dialogVisible: false,
      //   验证表单双向数据绑定
      addForm: {
        attr_name: ''
      },
      //   验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入属性名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ]
      },
      // 修改参数对话框显示与隐藏
      showEditDialogVisible: false,
      //   修改表单数据绑定
      editForm: {
        attr_name: ''
      },
      //   修改表单验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入属性名称', trigger: 'blur' },
          { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   获取所有的分类信息
    getCateList: async function() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      }
      this.cateList = res.data
    },
    // 级联选择框值发生变化的时触发的事件
    handleChange: function() {
      // 只能添加二级框
      if (this.selectedCateKeys.length < 3) {
        return (this.selectedCateKeys = '')
      }
      this.handleTabClick()
    },
    // tab页签被点击的处理函数
    handleTabClick: async function() {
      // 根据点击的不同发的请求
      if (this.selectedCateKeys.length === 3) {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: this.activeName }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          //   控制文本框的显示与隐藏
          item.inputVisible = false
          //   文本框输入的值
          item.inputValue = ''
        })
        // many动态属性 many静态属性
        if (this.activeName === 'many') {
          this.manyTableDate = res.data
        } else {
          this.onlyTableDate = res.data
        }
      }
    },
    // 添加表单的关闭事件
    addDialogColes: function() {
      this.$refs.addFormRef.resetFields()
    },
    // 确认添加属性按钮被点击
    addParams: function() {
      // 进行表单验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('属性添加失败')
        }
        this.$message.success('属性添加成功')
        this.handleTabClick()
        this.dialogVisible = false
      })
    },
    // 修改对话框被关闭
    editDialogColes: function() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击修改按钮展开对话框
    showEditDialog: function(row) {
      this.editFormObj = row
      this.editForm.attr_name = row.attr_name
      this.showEditDialogVisible = true
    },
    //   修改属性对话框点击确定按钮
    editParams: function() {
      //   表单验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const {
          data: res
        } = await this.$http.put(
          `categories/${this.editFormObj.cat_id}/attributes/${this.editFormObj.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑参数失败')
        }
        this.$message.success('编辑参数成功')
        this.showEditDialogVisible = false
        this.handleTabClick()
      })
    },
    // 点击删除分类
    deleteCate: async function(attrid) {
      const result = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        if (err === 'cancel') return this.$message.info('删除已取消')
      })

      if (result === 'confirm') {
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${attrid}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        this.handleTabClick()
      }
    },
    // 文本框事件
    handleInputConfirm: async function(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //   后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ' '
      //   需要发生请求保存到数据库
      this.saveAttrValues(row)
    },
    saveAttrValues: async function(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      row.inputVisible = false
      this.$message.success('修改参数成功')
    },
    showInput: function(row) {
      row.inputVisible = true
      //   文本框自动获得焦点
      //   this.$nextTick方法作用，
      //   当页面的元素重新被渲染的时候在去执行回调函数
      //    如果不等待证规世纪，会获取不到证规DON对象
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // tag删除事件
    handleClose: function(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrValues(row)
    }
  },
  // 巧用计算属性
  computed: {
    //   是否禁用按钮
    isbtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 选择中的分类id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'only') {
        return '静态属性'
      }
      return '动态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-cascader {
  margin-left: 10px;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 80px;
}
</style>
