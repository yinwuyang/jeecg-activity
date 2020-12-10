<template>
  <a-card class="mainContentHeight TableCardClass" :bodyStyle="{height:'100%'}" :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="12">
          <a-col :md="7" :sm="8">
            <a-form-item label="字典名称" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
              <a-input placeholder="请输入字典名称" v-model="queryParam.dictName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="7" :sm="8">
            <a-form-item label="字典编号" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
              <a-input placeholder="请输入字典编号" v-model="queryParam.dictCode"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="7" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 操作按钮区域 -->
    <div class="table-operator" style="border-top: 5px">
      <a-button @click="handleAdd" type="primary" icon="plus">添加</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('字典信息')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-button type="primary" icon="sync" @click="refleshCache()">刷新缓存</a-button>

      <a-button type="primary" icon="hdd" @click="openDeleteList">回收站</a-button>
    </div>

    <div class="table-cont">
      <a-table
        :scroll="{ y: scrollY }"
        ref="table"
        rowKey="id"
        size="middle"
        bordered
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange">
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">
            <a-icon type="edit"/>
            编辑
          </a>
          <a-divider type="vertical"/>
          <a @click="editDictItem(record)"><a-icon type="setting"/> 字典配置</a>
          <a-divider type="vertical"/>
          <a-popconfirm title="确定删除吗?" @confirm="() =>handleDelete(record.id)">
            <a>删除</a>
          </a-popconfirm>
        </span>
      </a-table>
    </div>
    <dict-modal ref="modalForm" @ok="modalFormOk"></dict-modal>
    <dict-item-list ref="dictItemList"></dict-item-list>
    <dict-delete-list ref="dictDeleteList" @refresh="() =>loadData()"></dict-delete-list>
  </a-card>
</template>

<script>
  import { filterObj } from '@/utils/util';
  import { hwdzListMixin } from '@/mixins/hwdzListMixin'
  import DictModal from './modules/DictModal'
  import DictItemList from './DictItemList'
  import DictDeleteList from './DictDeleteList'
  import { getAction } from '@/api/manage'
  import { UI_CACHE_DB_DICT_DATA } from "@/store/mutation-types"
  import Vue from 'vue'

  export default {
    name: "DictList",
    mixins:[hwdzListMixin],
    components: {DictModal, DictItemList,DictDeleteList},
    data() {
      return {
        description: '这是数据字典页面',
        visible: false,
        // 查询条件
        queryParam: {
          dictCode: "",
          dictName: "",
        },
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 120,
            align: "center",
            customRender: function (t, r, index) {
              return parseInt(index) + 1;
            }
          },
          {
            title: '字典名称',
            align: "left",
            dataIndex: 'dictName',
          },
          {
            title: '字典编号',
            align: "left",
            dataIndex: 'dictCode',
          },
          {
            title: '描述',
            align: "left",
            dataIndex: 'description',
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: "center",
            scopedSlots: {customRender: 'action'},
          }
        ],
        scrollY: 500,
        dict: "",
        labelCol: {
          xs: {span: 8},
          sm: {span: 5},
        },
        wrapperCol: {
          xs: {span: 16},
          sm: {span: 19},
        },
        url: {
          list: "/sys/dict/list",
          delete: "/sys/dict/delete",
          exportXlsUrl: "sys/dict/exportXls",
          importExcelUrl: "sys/dict/importExcel",
          refleshCache: "sys/dict/refleshCache",
          queryAllDictItems: "sys/dict/queryAllDictItems",
        },
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    mounted: function(){
      let that = this
      that.$nextTick(function(){
        that.scrollY = document.getElementsByClassName("table-cont")[0].clientHeight-46
      })
      window.onresize = () => {
        return (() => {
          that.scrollY = document.getElementsByClassName("table-cont")[0].clientHeight-46
        })()
      }
    },
    methods: {
      getQueryParams() {
        var param = Object.assign({}, this.queryParam, this.isorter);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        if (this.superQueryParams) {
          param['superQueryParams'] = encodeURI(this.superQueryParams)
          param['superQueryMatchType'] = this.superQueryMatchType
        }
        return filterObj(param);
      },
      //取消选择
      cancelDict() {
        this.dict = "";
        this.visible = false;
        this.loadData();
      },
      //编辑字典数据
      editDictItem(record) {
        this.$refs.dictItemList.edit(record);
      },
      // 重置字典类型搜索框的内容
      searchReset() {
        var that = this;
        that.queryParam.dictName = "";
        that.queryParam.dictCode = "";
        that.loadData(this.ipagination.current);
      },
      openDeleteList(){
        this.$refs.dictDeleteList.show()
      },
      refleshCache(){
        getAction(this.url.refleshCache).then((res) => {
          if (res.success) {
            //重新加载缓存
            getAction(this.url.queryAllDictItems).then((res) => {
              if (res.success) {
                Vue.ls.remove(UI_CACHE_DB_DICT_DATA)
                Vue.ls.set(UI_CACHE_DB_DICT_DATA, res.result, 7 * 24 * 60 * 60 * 1000)
              }
            })
            this.$message.success("刷新缓存完成！");
          }
        }).catch(e=>{
          this.$message.warn("刷新缓存失败！");
          console.log("刷新失败",e)
        })
      }
    },
    watch: {
      openKeys(val) {
        console.log('openKeys', val)
      },
      scrollY: function(){
        let that = this
        this.$nextTick(function(){
          that.scrollY= document.getElementsByClassName("table-cont")[0].clientHeight-46
        })
      }
    },
  }
</script>
<style scoped>
.table-cont{
  height: calc(100% - 145px);
}
</style>
<style lang="less">
@import '~@assets/less/common.less';
</style>