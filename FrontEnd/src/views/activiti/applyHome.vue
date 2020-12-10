<template>
  <a-card :bordered="false">
    <!--流程申请选择-->
    <a-input-search
      style="margin-bottom: 10px;margin-right:10px;width: 200px"
      v-model="searchProcessKey"
      placeholder="输入流程名称"
      @search="onSearchProcess"
    />
    <a-button @click="onSearchProcess(searchProcessKey)" type="primary">查询</a-button>
    <a-button @click="onSearchProcess('')">重置</a-button>
    <a-button @click="handleToApplyList" type="primary" style="float: right;">前往我的申请列表</a-button>
    <a-empty description="无流程可供选择" v-if="activeKeyAll.length==0" />
    <div v-else>
      <a-collapse v-model="activeKey">
        <a-collapse-panel
          v-for="(value, index)  in activeKeyAll"
          :header="filterDictText(dictOptions,value)||'未分类'"
          :key="value"
        >
          <a-list :grid="{ gutter: 10,column:4}" :dataSource="processDataMap[value]">
            <a-list-item slot="renderItem" slot-scope="item">
              <a-card>
                <div slot="title">
                  <a-row>
                    <a-col span="12" :title="item.name">{{item.name}}</a-col>
                    <a-col span="12" style="text-align: right;">
                      <a href="javascript:void (0)" @click="chooseProcess(item)">发起申请</a>
                    </a-col>
                  </a-row>
                </div>
                <b>版本：</b>
                v.{{item.version}}
                <br />
                <b>说明：</b>
                {{item.description}}
              </a-card>
            </a-list-item>
          </a-list>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <!--流程表单-->
    <!-- <a-modal
      :title="lcModa.title"
      v-model="lcModa.visible"
      :footer="null"
      :maskClosable="false"
      width="80%"
    >-->
    <!-- <component
        :disabled="lcModa.disabled"
        v-if="lcModa.visible"
        :is="lcModa.formComponent"
        :processData="lcModa.processData"
        :isNew="lcModa.isNew"
        @afterSubmit="afterSub"
        @close="lcModa.visible=false,lcModa.disabled = false"
    ></component>-->
    <!-- </a-modal> -->

    <onl-cgform-auto-modal v-if="code" @success="handleFormSuccess" ref="modal" :code="code"></onl-cgform-auto-modal>
  </a-card>
</template>

<script>
import { activitiMixin } from '@/views/activiti/mixins/activitiMixin'
import JEllipsis from '@/components/hwdz/JEllipsis'
import JTreeSelect from '@/components/hwdz/JTreeSelect'
import { initDictOptions, filterDictText } from '@/components/dict/JDictSelectUtil'
import historicDetail from '@/views/activiti/historicDetail'
import { getAction, postFormAction, postAction } from '@/api/manage'
export default {
  name: 'applyHome',
  mixins: [activitiMixin],
  components: {
    JEllipsis,
    JTreeSelect,
    historicDetail
  },
  data() {
    return {
      description: '所有',
      dictOptions: [],
      url: {
        getProcessDataList: '/activiti_process/listData',
        getFirstNode: '/actProcessIns/getFirstNode',
        applyBusiness: '/actBusiness/apply'
      },
      // 查询条件
      queryParam: {
        createTimeRange: [],
        keyWord: ''
      },
      // 表头
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 20 },
        sm: { span: 20 }
      },
      processModalVisible: null,
      activeKeyAll: [],
      activeKey: [],
      processDataMap: {},
      searchProcessKey: null,
      addApplyLoading: false,
      code: '', // 表单id

      formTemplate: '99' //表单需要，不知道啥
      // lcModa: {
      //   title: '',
      //   disabled: false,
      //   visible: false,
      //   formComponent: null,
      //   isNew: false
      // }
    }
  },
  computed: {},
  mounted() {
    this.initDictConfig()
    this.getProcessList()
  },
  methods: {
    initDictConfig() {
      //初始化字典 - 流程分类
      initDictOptions('bpm_process_type').then(res => {
        if (res.success) {
          this.dictOptions = res.result
        }
      })
    },
    filterDictText(dictOptions, text) {
      if (dictOptions instanceof Array) {
        for (let dictItem of dictOptions) {
          if (text === dictItem.value) {
            return dictItem.text
          }
        }
      }
      return text || text == 'null' ? '' : text
    },
    /*加载流程列表*/
    getProcessList() {
      this.addApplyLoading = true
      getAction(this.url.getProcessDataList, { status: 1, roles: true })
        .then(res => {
          this.activeKeyAll = []
          if (res.success) {
            var result = res.result || []
            if (result.length > 0) {
              let searchProcessKey = this.searchProcessKey
              if (searchProcessKey) {
                //过滤条件
                result = _.filter(result, function(o) {
                  return o.name.indexOf(searchProcessKey) > -1
                })
              }
              this.processDataMap = _.groupBy(result, 'categoryId')
              for (const categoryId in this.processDataMap) {
                this.activeKeyAll.push(categoryId)
              }
              this.activeKey = this.activeKeyAll
            }
            this.processModalVisible = true
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => (this.addApplyLoading = false))
    },
    onSearchProcess(value) {
      this.searchProcessKey = value
      this.getProcessList()
    },
    async chooseProcess(v) {
      // console.log('v=============>', v)
      // this.code = ''
      this.code = v.routeName
      if (!v.routeName) {
        this.$message.warning('该流程信息未配置表单，请联系开发人员！')
        return
      }
      await getAction(`/online/cgform/api/getColumns/${v.routeName}`).then(res => {
        this.formTemplate = res.result.formTemplate
      })

      setTimeout(() => {
        //优先级往后，解决报错
        this.$refs.modal.add(this.formTemplate)
      }, 30)

      let formD = {
        //另一个接口数据
        procDefId: v.id,
        procDeTitle: v.name,
        tableName: v.businessTable
      }
      let that = this
      let comp = this.$refs.modal
      // this.$refs.modal.add = function (obj){
      //   this.modal = Object.assign({}, record)
      // }
      comp.handleSubmit = () => {
        //被逼无奈重写了方法
        comp.$refs.onlineForm.form.validateFields((err, values) => {
          for (var key in values) {
            if (Array.isArray(values[key])) {
              if (values[key].length == 0) {
                values[key] = ''
              } else {
                let dataArr = []
                values[key].forEach(el => {
                  dataArr.push(el.response.message)
                })

                values[key] = dataArr.join(',')
              }
            }
          }
          if (!err) {
            postAction(`/online/cgform/api/form/${this.code}`, values).then(res => {
              if (res.success) {
                formD.tableId = res.result
                postFormAction('/actBusiness/add', formD).then(res => {
                  if (res.success) {
                    this.$message.success('申请成功!请前往我的申请列表提交审批！')
                  } else {
                    this.$message.warning('申请失败！')
                  }
                })
              } else {
                this.$message.warning('申请失败！')
              }
            })
          }
          comp.close() //关闭窗口
        })
      }

      // this.lcModa.formComponent = this.getFormComponent(v.routeName).component
      // this.lcModa.title = '发起流程：' + v.name
      // this.lcModa.isNew = true
      // this.lcModa.processData = v
      // this.lcModa.visible = true
      // console.log('发起', v)
    },

    /*提交成功申请后*/
    handleFormSuccess() {
      // http://192.168.0.130:8080/jeecg-boot/online/cgform/api/form/
      // console.log('formData===============>', formData)
    },
    /*前往我的申请页面*/
    handleToApplyList() {
      this.$router.push({ path: '/activiti/applyList' })
    }
  }
}
</script>
<style >
.jeecg-online-moda .ant-modal {
  width: 1200px !important;
  /* top: 100px !important; */
  /* transform-origin: -161px 71px; */
}
</style>
<style scoped>
@import '~@assets/less/common.less';
</style>