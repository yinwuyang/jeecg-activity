<template>
  <a-card class="mainContentHeight" style="margin:0" :bodyStyle="{height:'100%',padding: '0 .15rem'}" :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <!-- 搜索区域 -->
      <a-form layout="inline">
        <a-row>
          <a-col :md="10" :sm="12">
            <a-form-item label="部门角色名称">
              <a-input placeholder="请输入部门角色" v-model="queryParam.roleName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-button type="primary" @click="searchQuery" icon="search" style="margin-left: 18px">查询</a-button>
            <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator" :md="24" :sm="24">
      <a-button @click="handleAdd" type="primary" icon="plus">新建部门角色</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>
    <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
      <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">
        {{selectedRowKeys.length }}</a>项
      <a style="margin-left: 24px" @click="onClearSelected">清空</a>
    </div>

    <!-- table区域-begin -->
    <div class="table-cont">
      <a-table
        :scroll="{ y: scrollY }"
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handlePerssion(record)">授权</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
             </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->
    <!-- 表单区域 -->
    <sys-depart-role-modal ref="modalForm" @ok="modalFormOk"/>
    <dept-role-auth-modal ref="modalDeptRole" />
  </a-card>
</template>

<script>
  import {hwdzListMixin} from '@/mixins/hwdzListMixin'
  import {getAction} from '@/api/manage'
  import SysDepartRoleModal from './SysDepartRoleModal'
  import DeptRoleAuthModal from './DeptRoleAuthModal'

  export default {
    name: 'DeptRoleInfo',
    components: { DeptRoleAuthModal, SysDepartRoleModal },
    mixins: [hwdzListMixin],
    data() {
      return {
        description: '部门角色信息',
        currentDeptId: '',
        // 表头
        columns: [
          {
            title: '部门角色名称',
            align: "center",
            dataIndex: 'roleName'
          },
          {
            title: '部门角色编码',
            align: "center",
            dataIndex: 'roleCode'
          },
          {
            title: '部门',
            align: "center",
            dataIndex: 'departId_dictText'
          },
          {
            title: '备注',
            align: "center",
            dataIndex: 'description'
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: {customRender: 'action'},
            align: "center",
            width: 170
          }
        ],
        scrollY: 500,
        url: {
          list: "/sys/sysDepartRole/list",
          delete: "/sys/sysDepartRole/delete",
          deleteBatch: "/sys/sysDepartRole/deleteBatch",
        }
      }
    },
    created() {
    },
    mounted: function(){
      let that = this
      this.$nextTick(function(){
        that.scrollY = document.getElementsByClassName("table-cont")[0].clientHeight-46
      })
      window.onresize = () => {
        return (() => {
          that.scrollY = document.getElementsByClassName("table-cont")[0].clientHeight-46
        })()
      }
    },
    methods: {
      searchReset() {
        this.queryParam = {}
        this.loadData(1);
      },
      loadData(arg) {
        if (!this.url.list) {
          this.$message.error("请设置url.list属性!")
          return
        }
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        let params = this.getQueryParams();//查询条件
        params.deptId = this.currentDeptId;
        getAction(this.url.list, params).then((res) => {
          if (res.success && res.result) {
            this.dataSource = res.result.records;
            this.ipagination.total = res.result.total;
          }
        })
      },
      open(record) {
        this.currentDeptId = record.id;
        this.loadData(1);
      },
      clearList() {
        this.currentDeptId = '';
        this.dataSource = [];
      },
      hasSelectDept() {
        if (this.currentDeptId == '') {
          this.$message.error("请选择一个部门!")
          return false;
        }
        return true;
      },
      handleEdit: function (record) {
        this.$refs.modalForm.title = "编辑";
        this.$refs.modalForm.departDisabled = true;
        this.$refs.modalForm.disableSubmit = false;
        this.$refs.modalForm.edit(record,record.departId);
      },
      handleAdd: function () {
        if (this.currentDeptId == '') {
          this.$message.error("请选择一个部门!")
        } else {
          this.$refs.modalForm.departDisabled = true;
          this.$refs.modalForm.add(this.currentDeptId);
          this.$refs.modalForm.title = "新增";
        }
      },
      handlePerssion: function(record){
        this.$refs.modalDeptRole.show(record.id,record.departId);
      },
    },
    watch: {
      scrollY: function(){
        let that = this
        this.$nextTick(function(){
          that.scrollY= document.getElementsByClassName("table-cont")[0].clientHeight-46
        })
      }
    }
  }
</script>

<style scoped>
/** Button按钮间距 */
.ant-btn {
  margin-left: 3px;
}
.table-cont{
  height: calc(100% - 215px);
}
</style>
<style lang="less">
@import '~@assets/less/common.less';
</style>