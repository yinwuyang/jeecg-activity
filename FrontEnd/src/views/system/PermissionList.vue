<template>
  <a-card class="mainContentHeight TableCardClass" :bodyStyle="{ height: '100%' }" :bordered="false">
    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button @click="batchDel" v-if="selectedRowKeys.length > 0" ghost type="primary" icon="delete"
        >批量删除
      </a-button>
    </div>
    <div class="ant-alert ant-alert-info">
      <i class="anticon anticon-info-circle ant-alert-icon"></i>已选择&nbsp;<a style="font-weight: 600">{{
        selectedRowKeys.length
      }}</a
      >项&nbsp;&nbsp;
      <a style="margin-left: 24px" @click="onClearSelected">清空</a>
    </div>

    <!-- table区域-begin -->
    <div class="table-cont">
      <a-table
        :scroll="{ y: scrollY }"
        :columns="columns"
        ref="table"
        size="middle"
        bordered
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :expandedRowKeys="expandedRowKeys"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @expandedRowsChange="handleExpandedRowsChange"
        @change="handleTableChange"
      >
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="handleAddSub(record)">添加下级</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="handleDataRule(record)">数据规则</a>
              </a-menu-item>

              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
        <!-- 字符串超长截取省略号显示 -->
        <span slot="url" slot-scope="text">
          <j-ellipsis :value="text" :length="25" />
        </span>
        <!-- 字符串超长截取省略号显示-->
        <span slot="component" slot-scope="text">
          <j-ellipsis :value="text" />
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <permission-modal ref="modalForm" @ok="modalFormOk"></permission-modal>
    <permission-data-rule-list ref="PermissionDataRuleList" @ok="modalFormOk"></permission-data-rule-list>
  </a-card>
</template>

<script>
import PermissionModal from './modules/PermissionModal'
import { getPermissionList } from '@/api/api'
import { hwdzListMixin } from '@/mixins/hwdzListMixin'
import PermissionDataRuleList from './PermissionDataRuleList'
import JEllipsis from '@/components/hwdz/JEllipsis'

const columns = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '菜单类型',
    dataIndex: 'menuType',
    key: 'menuType',
    customRender: function(text) {
      if (text == 0) {
        return '菜单'
      } else if (text == 1) {
        return '菜单'
      } else if (text == 2) {
        return '按钮/权限'
      } else {
        return text
      }
    }
  },
  /*{
      title: '权限编码',
      dataIndex: 'perms',
      key: 'permissionCode',
    },*/ {
    title: 'icon',
    dataIndex: 'icon',
    key: 'icon'
  },
  {
    title: '组件',
    dataIndex: 'component',
    key: 'component',
    scopedSlots: { customRender: 'component' }
  },
  {
    title: '路径',
    dataIndex: 'url',
    key: 'url',
    scopedSlots: { customRender: 'url' }
  },
  {
    title: '排序',
    dataIndex: 'sortNo',
    key: 'sortNo'
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    scopedSlots: { customRender: 'action' },
    align: 'center',
    width: 150
  }
]

export default {
  name: 'PermissionList',
  mixins: [hwdzListMixin],
  components: {
    PermissionDataRuleList,
    PermissionModal,
    JEllipsis
  },
  data() {
    return {
      description: '这是菜单管理页面',
      // 表头
      columns: columns,
      loading: false,
      scrollY: 500,
      // 展开的行，受控属性
      expandedRowKeys: [],
      url: {
        list: '/sys/permission/list',
        delete: '/sys/permission/delete',
        deleteBatch: '/sys/permission/deleteBatch'
      }
    }
  },
  mounted: function() {
    let that = this
    this.$nextTick(function() {
      that.scrollY = document.getElementsByClassName('table-cont')[0].clientHeight - 46
    })
    window.onresize = () => {
      return (() => {
        that.scrollY = document.getElementsByClassName('table-cont')[0].clientHeight - 46
      })()
    }
  },
  methods: {
    loadData() {
      this.dataSource = []
      getPermissionList().then(res => {
        if (res.success) {
          console.log(res.result)
          this.dataSource = res.result
        }
      })
    },
    // 打开数据规则编辑
    handleDataRule(record) {
      this.$refs.PermissionDataRuleList.edit(record)
    },
    handleAddSub(record) {
      this.$refs.modalForm.title = '添加子菜单'
      this.$refs.modalForm.localMenuType = 1
      this.$refs.modalForm.disableSubmit = false
      this.$refs.modalForm.edit({ status: '1', permsType: '1', route: true, parentId: record.id })
    },
    handleExpandedRowsChange(expandedRows) {
      this.expandedRowKeys = expandedRows
    }
  },
  watch: {
    scrollY: function() {
      let that = this
      this.$nextTick(function() {
        that.scrollY = document.getElementsByClassName('table-cont')[0].clientHeight - 46
      })
    }
  }
}
</script>
<style scoped>
.table-cont {
  height: calc(100% - 145px);
}
</style>
<style lang="less">
@import '~@assets/less/common.less';
</style>
