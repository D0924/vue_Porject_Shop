<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效模板 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <!-- 排序模板 -->
        <template slot="order" slot-scope="scope">
          <el-button type="primary" plain size="mini" v-if="scope.row.cat_level===0">一级</el-button>
          <el-button type="success" plain size="mini" v-else-if="scope.row.cat_level===1">二级</el-button>
          <el-button type="warning" plain size="mini" v-else>三级</el-button>
        </template>
        <!-- 操作模板 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="showDeltetCateDialog(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <div>
        <el-form :model="addCateForm" :rules="rules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <el-form ref="ruleForm" label-width="100px" collapse-tags>
          <el-form-item label="父级名称">
            <el-cascader
              v-model="selectKeys"
              :options="ParentCateList"
              :props="cascaderProps"
              @change="parentCateChange"
              clearable
              change-on-select
            ></el-cascader>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog title="修改分类信息" :visible.sync="editCatedialogVisible" width="50%">
      <div>
        <el-input v-model="editCate" placeholder="请输入内容"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateCommit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //   商品分类列表默认为空
      catelist: [],
      //   总记录条数
      total: 0,
      //   指定列的定义
      columns: [
        { label: '分类名称', prop: 'cat_name', width: '400px' },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加新分类对话框显示与隐藏
      addCateDialogVisible: false,
      //   添加分类的表单数据
      addCateForm: {
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级默认是
        cat_level: 0
      },
      //   新增分类表单验证规则
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
        ]
      },
      //   父级分类数据
      ParentCateList: [],
      //   级联选择器配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //   确认选择之后的数据是一个数组
      selectKeys: [],
      //   编辑对话框是否显示与隐藏
      editCatedialogVisible: false,
      // 编辑的暂存名称
      editCate: '',
      //   编辑分类暂存id
      editCteId: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   获取商品分配列表数据
    getCateList: async function() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听pageSize改变
    handleSizeChange: function(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 页码值发生变化
    handleCurrentChange: function(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击添加按钮显示对话框
    showAddCateDialog: function() {
      // 获取父级数据
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表
    getParentCateList: async function() {
      const { data: res } = await this.$http.get('categories', {
        params: { tyepe: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分类数据获取失败')
      }
      this.ParentCateList = res.data
    },
    // 级联选择器发生变法
    parentCateChange: function() {
      // 当值发生变化要更新data中的值
      //   this.addCateForm.
      if (this.selectKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addCateForm.cat_level = this.selectKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击确认添加分类按钮
    addCate: function() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('分类添加成功')
        this.addCateDialogVisible = false
        this.getCateList()
      })
    },
    // 监听添加分类对话框的关闭
    addCateDialogClose: function() {
      this.$refs.addCateFormRef.resetFields()
      this.selectKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 点击编辑
    showEditCateDialog: async function(id) {
      this.editCteId = id
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('分类信息查询失败')
      }
      this.editCate = res.data.cat_name
      this.editCatedialogVisible = true
    },
    // 确认提交编辑分类
    editCateCommit: async function() {
      const { data: res } = await this.$http.put(
        `categories/${this.editCteId}`,
        {
          cat_name: this.editCate
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('编辑分类失败')
      }
      this.$message.success('分类更新成功')
      this.getCateList()
      this.editCatedialogVisible = false
    },
    // 点击删除
    showDeltetCateDialog: async function(id) {
      const result = await this.$confirm(
        '此操作将永久删除分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(() => {
        this.$message.info('删除操作已取消')
      })
      if (result === 'confirm') {
        const { data: res } = await this.$http.delete(`categories/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除分类失败')
        this.$message.success('删除分成功')
        this.getCateList()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
.el-popper {
  height: 200px;
}
</style>
