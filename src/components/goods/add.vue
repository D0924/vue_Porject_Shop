<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品添加</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <!-- tab栏区域 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="catelist"
                :props="catProps"
                v-model="addForm.goods_cat"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTabDate" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item"
                  v-for="(item) in item.attr_vals"
                  :key="item.attr_id"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabDate" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              list-type="picture"
              :on-success="handleSuccess"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headers"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="30%"
      @close="previewDialogClose"
    >
      <img :src="previewUrl" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
// 运依赖深度克隆对象
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      // 添加商品表单对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_introduce: '',
        // 商品所属的分类数据
        goods_cat: [],
        // 上传图片临时保存的路径数组
        pics: [],
        attrs: []
      },
      //   验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品名重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      //   商品分类列表
      catelist: [],
      //   级联选择器配置对象
      catProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //   动态属性
      manyTabDate: [],
      //   静态属性
      onlyTabDate: [],
      //   图片上床加token信息
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //   预览图片地址
      previewUrl: '',
      //   预览对话款显示与隐藏
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有分类数据
    getCateList: async function() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('分类加载失败')
      }
      this.catelist = res.data
    },
    // 级联选择器发生变化
    handleChange: function() {
      if (this.addForm.goods_cat.length !== 3) {
        return (this.addForm.goods_cat = [])
      }
      this.catId = this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
    },
    // 标签页的切换
    beforeTabLeave: function(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择分类')
        return false
      }
    },
    tabClicked: async function() {
      // 动态参数模板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.getCatId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        this.manyTabDate = res.data
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.getCatId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性信息失败')
        }
        this.onlyTabDate = res.data
      }
    },
    //   图片成功上传的回调函数
    handleSuccess: function(response, file, fileList) {
      this.addForm.pics.push(response.data.tmp_path)
    },
    // 图片列表被移除的函数
    handleRemove: function(file, fileList) {
      var i = this.addForm.pics.findIndex(item => {
        if (item === file.response.data.tmp_path) {
          return true
        }
      })
      this.addForm.pics.splice(i, 1)
    },
    // 点击预览回调
    handlePreview: function(file) {
      this.previewUrl = file.url
      this.previewDialogVisible = true
    },
    // 关闭预览对话框
    previewDialogClose: function() {
      this.previewDialogVisible = false
    },
    // 点击按钮添加商品
    add: function() {
      // 进行表单验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请输入必要的参数项')
        }
        // 准备发生请求提交数据
        // this.addForm.goods_cat = this.addForm.goods_cat.join(' ')  无效
        // 进行深拷贝 lodash cloneDeep(obj) 深度克隆对象
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理静态参数和动态属性
        this.manyTabDate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })

        this.onlyTabDate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 请求参数处理完毕发送请求
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败' + res.meta.msg)
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    getCatId: function() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2] - 0
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-bottom: 25px;
}
.el-form-item {
  margin-bottom: 5px;
}
.el-checkbox {
  margin: 0 5px 0 !important;
}
.previewImg {
  padding: 0px;
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
