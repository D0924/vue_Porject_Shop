<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 表单搜索区 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表表格 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time | dataFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress()"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 7, 9, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 编辑的对话款 -->
    <el-dialog title="提示" :visible.sync="EditDialogVisible" width="50%" @close="EditDialogClose">
      <el-form
        :model="addRessForm"
        :rules="addRessFormrules"
        ref="addRessFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityDate" v-model="addRessForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addRessForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="ProgressDialogVisible"
      width="50%"
      @close="ProgressDialogClose"
    >
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityDate from './citydata'
export default {
  data() {
    return {
      // 查询对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 7
      },
      //   总条数据
      total: 0,
      //    总数据
      orderList: [],
      //   编辑对话框显示与隐藏
      EditDialogVisible: false,
      //   编辑对话框
      addRessForm: {
        address1: [],
        address2: ''
      },
      //   编辑验证规则
      addRessFormrules: {
        address1: [
          { required: true, message: '请选择省市区', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      //   地址信息
      cityDate,
      //   控制物流对话款显示与隐藏
      ProgressDialogVisible: false,
      //   物流信息数据
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    //   获取订单数据列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取订单列表数据失败')
      }
      this.total = res.data.total
      this.orderList = res.data.goods
      console.log(this.orderList)
    },
    // 每页条数发生变化
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getOrderList()
    },
    // 当前页发生变化
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getOrderList()
    },
    // 点击编辑按钮
    showEditDialog: function(row) {
      this.EditDialogVisible = true
    },
    // 编辑对话框关闭事件
    EditDialogClose() {
      this.$refs.addRessFormRef.resetFields()
    },
    // 点击操查物流
    async showProgress() {
      this.ProgressDialogVisible = true
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.progressInfo = res.data
      console.log(res.data)
    },
    // 物流进度对话款被关闭
    ProgressDialogClose() {}
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
.el-cascader {
  width: 100%;
}
</style>
