<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="流程名称">
              <a-input placeholder="请输入搜索关键词" v-model="queryParam.lcmc"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="流程标识">
              <a-input placeholder="请输入搜索关键词" v-model="queryParam.lckey"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="是否最新">
              <a-switch
                checkedChildren="是"
                unCheckedChildren="否"
                defaultChecked
                v-model="queryParam.zx"
              />
            </a-form-item>
          </a-col>
          <!--<a-col :md="6" :sm="10">
            <a-form-item label="创建时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-range-picker
                style="width: 210px"
                v-model="queryParam.createTimeRange"
                format="YYYY-MM-DD"
                :placeholder="['开始时间', '结束时间']"
                @change="onDateChange"
                @ok="onDateOk"
              />
            </a-form-item>
          </a-col>-->

          <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="12">
              <a-button type="primary" style="left: 10px" @click="searchQuery" icon="search">查询</a-button>
              <a-button
                type="primary"
                @click="searchReset"
                icon="reload"
                style="margin-left: 8px;left: 10px"
              >重置</a-button>
            </a-col>
          </span>
          <span style="float: right;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="12" :sm="12">
              <!--                <a-button type="primary"  style="left: 10px" @click="createObj.visible=true" icon="search">创建流程模型</a-button>-->
            </a-col>
          </span>
        </a-row>
      </a-form>
    </div>

    <!-- table区域-begin -->
    <a-table
      :scroll="{x:2200,y:500}"
      bordered
      ref="table"
      size="middle"
      rowKey="id"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      @change="handleTableChange"
    >
      <a-table-column title="#" :width="50" fixed="left" key="a">
        <template slot-scope="t,r,i">
          <span>{{i+1}}</span>
        </template>
      </a-table-column>
      <a-table-column title="流程名称" data-index="name" :width="200" align="center" fixed="left">
        <template slot-scope="t,r,i">
          <span>{{t}}</span>
        </template>
      </a-table-column>
      <a-table-column title="流程标识" data-index="processKey" :width="200" align="center">
        <template slot-scope="t,r,i">
          <span>{{t}}</span>
        </template>
      </a-table-column>
      <a-table-column
        title="版本"
        data-index="version"
        key="asa"
        :width="100"
        align="center"
        :sorter="(a, b) => a.version - b.version"
      >
        <template slot-scope="t,r,i">
          <span>v.{{t}}</span>
        </template>
      </a-table-column>
      <a-table-column
        title="所属分类"
        data-index="categoryId"
        :width="200"
        align="center"
        key="categoryId_"
        :filters="lcTypeF"
        @filter="filter_categoryId"
      >
        <template slot-scope="t,r,i">
          <span>{{filterDictText(dictOptions, t)}}</span>
        </template>
      </a-table-column>
      <a-table-column title="流程图片" data-index="diagramName" :width="200" align="center">
        <template slot-scope="t,r,i">
          <span @click="showResource(r)" style="color: blue;cursor: pointer;">{{t}}</span>
        </template>
      </a-table-column>
      <!-- <a-table-column title="表单名称" data-index="routeName" :width="200" align="center">
        <template slot-scope="t,r,i">
          <span
            @click="viewForm(t)"
            style="color: blue;cursor: pointer;"
          ></span> 
        </template>
      </a-table-column>-->
      <a-table-column title="状态" data-index="status" :width="200" align="center">
        <template slot-scope="t,r,i">
          <span v-if="t==1" style="color: #00A0E9;">已启用</span>
          <span v-if="t!=1" style="color: #999;">未启用</span>
        </template>
      </a-table-column>
      <a-table-column title="备注说明" data-index="description" :width="200" align="center">
        <template slot-scope="t,r,i">
          <j-ellipsis :value="t" :length="10" />
        </template>
      </a-table-column>
      <a-table-column title="部署时间" data-index="createTime" :width="200" align="center">
        <template slot-scope="t,r,i">
          <span>{{t}}</span>
        </template>
      </a-table-column>
      <a-table-column title="更新时间" data-index="updateTime" :width="200" align="center">
        <template slot-scope="t,r,i">
          <span>{{t}}</span>
        </template>
      </a-table-column>
      <a-table-column title="操作" data-index align="center" :width="250" fixed="right">
        <template slot-scope="t,r,i">
          <a
            href="javascript:void(0);"
            v-if="r.status!=1"
            @click="editStatus(1,r)"
            style="color: rgb(144,96,255);"
          >启用</a>
          <a
            href="javascript:void(0);"
            v-if="r.status==1"
            @click="editStatus(0,r)"
            style="color: #cb892d"
          >禁用</a>
          <a-divider type="vertical" />
          <a href="javascript:void(0);" @click="getNodeData(r)">节点设置</a>
          <a-divider type="vertical" />
          <a href="javascript:void(0);" @click="convertToModel(r)">转为模型</a>
          <br />
          <a href="javascript:void(0);" @click="edit(r)">编辑</a>
          <a-divider type="vertical" />
          <a href="javascript:void(0);" style="color: red;" @click="remove(r)">删除</a>
        </template>
      </a-table-column>
    </a-table>
    <!-- table区域-end -->
    <!--编辑-->
    <a-modal
      :confirmLoading="confirmLoading"
      title="编辑流程"
      :visible="editObj.visible"
      @ok="editObjOk"
      @cancel="editObj.visible = false"
    >
      <a-form :form="editForm" v-if="editObj.visible">
        <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="流程分类">
          <component
            :is="LcDict"
            :trigger-change="true"
            v-decorator="[ 'categoryId', {initialValue:editObj.categoryId, rules: [{ required: true, message: '不能为空' }] },]"
            placeholder="请选择流程分类"
            dictCode="bpm_process_type"
          ></component>
        </a-form-item>
        <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="关联表单">
          <a-select
            @change="change_routeName"
            placeholder="请选择关联表单"
            :trigger-change="true"
            v-decorator="[ 'routeName', {initialValue:editObj.routeName, rules: [{ required: true, message: '不能为空' }] },]"
          >
            <a-select-option value>请选择</a-select-option>
            <a-select-option v-for="(item) in allFormComponent" :key="item.id" :value="item.id">
              <span
                style="display: inline-block;width: 100%"
                :title=" item.tableTxt"
              >{{ item.tableTxt}}</span>
            </a-select-option>
          </a-select>
          <a href="javascrip:void(0)" @click="viewForm">预览表单</a>
        </a-form-item>
        <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="角色授权">
          <j-select-role
            placeholder="不选择则所有人可用"
            v-decorator="[ 'roles', {initialValue:editObj.roles, rules: []}]"
          />
        </a-form-item>
        <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="备注描述">
          <a-textarea
            v-decorator="[ 'description', {initialValue:editObj.description, rules: []}]"
            placeholder="备注描述"
            :autoSize="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <!--节点设置-->
    <a-modal
      title="编辑流程节点"
      width="900px"
      :maskClosable="false"
      :confirmLoading="confirmLoading"
      :visible="showProcessNodeEdit"
      :footer="null"
      @cancel="closeNode"
    >
      <a-row>
        <a-col :md="4" :sm="4" style="border-right: 1px solid #999">
          <!--          选择流程节点-->
          <a-steps direction="vertical" :current="current" size="small">
            <template v-for="item,i in nodeList">
              <a-step
                style="cursor: pointer;"
                :title="item.title"
                :description="item.description"
                :status="i==current?'process':'wait'"
                @click="change_steps(item,i)"
              />
            </template>
          </a-steps>
        </a-col>
        <a-col :md="20" :sm="20">
          <a-alert message="温馨提示：若流程运行至未分配审批人员的审批节点时，流程将自动中断取消！" banner />
          <span></span>
          <a-form :form="nodeForm" v-if="showProcessNodeEdit">
            <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="节点名称">
              <span class="nodespan">{{editNode.title}}</span>
            </a-form-item>
            <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="节点类型">
              <span class="nodespan">{{dictNodeType[editNode.type]}}</span>
            </a-form-item>
            <a-alert type="info" message="每个节点设置，如有修改都请保存一次，跳转节点后数据不会自动保存！" banner />
            <br />
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="审批人员"
              v-show="editNode.type==1"
            >
              <a-checkbox-group @change="spryType" v-model="spryTypes">
                <!-- 0角色 1用户 2部门 3发起人 4发起人的部门负责人-->
                <a-checkbox value="0">根据角色选择</a-checkbox>
                <a-checkbox value="1">直接选择人员</a-checkbox>
                <a-checkbox value="2">部门负责人</a-checkbox>
                <a-checkbox value="3">
                  发起人
                  <a-tooltip placement="topLeft" title="自动获取发起人">
                    <a-icon type="exclamation-circle" />
                  </a-tooltip>
                </a-checkbox>
                <a-checkbox value="4">
                  发起人的部门负责人
                  <a-tooltip
                    placement="topLeft"
                    title="自动获取发起人所在部门的负责人，即其上级领导。（如果其本身就是部门负责人，则指向发起人自己。）"
                  >
                    <a-icon type="exclamation-circle" />
                  </a-tooltip>
                </a-checkbox>
                <a-checkbox value="5">发起人部门</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            <!--            0角色 1用户 2部门 3发起人 4发起人的部门负责人-->
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="选择角色"
              v-if="spryTypes.indexOf('0')>-1"
            >
              <j-select-role v-model="spry.roleIds" />
            </a-form-item>
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="选择人员"
              v-if="spryTypes.indexOf('1')>-1"
            >
              <!--  通过部门选择用户控件 -->
              <j-select-user-by-dep v-model="spry.userIds" :multi="true"></j-select-user-by-dep>
            </a-form-item>
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="选择部门"
              v-if="spryTypes.indexOf('2')>-1"
            >
              <j-select-depart v-model="spry.departmentIds" :multi="true"></j-select-depart>
            </a-form-item>
            <!--btn-->
            <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
              <a-button
                @click="sprySubmit"
                type="primary"
                html-type="submit"
                :disabled="editNode.type==0||editNode.type==2||confirmLoading"
              >提交并保存</a-button>

              <a-button @click="closeNode" style="margin-left: 10px">关闭</a-button>
            </a-form-item>
          </a-form>
        </a-col>
      </a-row>
    </a-modal>
    <!--查看图片-->
    <a-modal
      :title="viewTitle"
      width="90%"
      :visible="viewImage"
      :footer="null"
      @cancel="viewImage = false"
    >
      <div style="min-height: 400px">
        <img :src="diagramUrl" :alt="viewTitle" />
      </div>
    </a-modal>
    <!--流程表单 预览-->
    <a-modal
      :title="lcModa.title"
      v-model="lcModa.visible"
      :footer="null"
      :maskClosable="false"
      width="80%"
    >
      <component :is="lcModa.formComponent" :disabled="true"></component>
    </a-modal>
    <onl-cgform-auto-modal ref="modal" :code="editObj.routeName"></onl-cgform-auto-modal>
    <!--  表单预览组件 -->
  </a-card>
</template>

<script>
import { filterObj } from '@/utils/util'
import { hwdzListMixin } from '@/mixins/hwdzListMixin'
import { activitiMixin } from '@/views/activiti/mixins/activitiMixin'
import JEllipsis from '@/components/hwdz/JEllipsis'
import { deleteAction, getAction, downFile, postFormAction, postAction } from '@/api/manage'
import pick from 'lodash.pick'
import JTreeSelect from '@/components/hwdz/JTreeSelect'
import { initDictOptions, filterDictText } from '@/components/dict/JDictSelectUtil'
import JSelectUserByDep from '@/components/hwdzbiz/JSelectUserByDep'
import JSelectRole from '@/components/hwdzbiz/JSelectRole'
import JSelectDepart from '@/components/hwdzbiz/JSelectDepart'

export default {
  name: 'ProcessModelList',
  mixins: [activitiMixin, hwdzListMixin],
  components: {
    JEllipsis,
    JSelectUserByDep,
    JSelectRole,
    JSelectDepart,
    JTreeSelect
  },

  data() {
    return {
      FormList: [],
      viewImage: false,
      viewTitle: '',
      diagramUrl: '',
      /*编辑流程*/
      editObj: {
        visible: false
      },
      editForm: this.$form.createForm(this),

      description: '已部署模型',
      // 查询条件
      queryParam: {
        createTimeRange: [],
        keyWord: ''
      },
      tabKey: '1',
      // 表头
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 20 },
        sm: { span: 20 }
      },
      confirmLoading: false,
      current: 0,
      nodeForm: this.$form.createForm(this),
      dictOptions: [],
      nodeList: [],
      editNode: {},
      showProcessNodeEdit: false,
      dictNodeType: {
        '0': '开始节点',
        '1': '审批节点',
        '2': '结束节点'
      },
      spryTypes: [],
      url: {
        list: '/activiti_process/listData',
        img: '/activiti/models/export',
        updateStatus: '/activiti_process/updateStatus',
        delByIds: '/activiti_process/delByIds',
        convertToModel: '/activiti_process/convertToModel',
        updateInfo: '/activiti_process/updateInfo',
        getProcessNode: '/activiti_process/getProcessNode',
        editNodeUser: '/activiti_process/editNodeUser'
      },
      spry: {
        //选中的用户
        userIds: '',
        roleIds: '',
        departmentIds: '',
        chooseSponsor: false,
        chooseDepHeader: false,
        chooseDep: false
      },
      lcModa: {
        title: '流程表单预览',
        visible: false,
        formComponent: null
      },
      lcTypeF: [],
      dataList: []
    }
  },

  computed: {
    //可行性测试，根据文件路径动态加载组件
    LcDict: function() {
      var myComponent = () => import(`@/components/dict/JDictSelectTag`)
      return myComponent
    }
  },
  methods: {
    initDictConfig() {
      //初始化字典 - 流程分类
      initDictOptions('bpm_process_type').then(res => {
        if (res.success) {
          var lcTypes = []
          this.dictOptions = res.result || []
          for (const dict of this.dictOptions) {
            lcTypes.push({ text: dict.text, value: dict.value })
          }
          this.lcTypeF = lcTypes
          console.log(lcTypes)
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
      return text
    },
    closeNode() {
      ;(this.showProcessNodeEdit = false), (this.current = 0), (this.spryTypes = []), (this.spry = {})
    },
    /*编辑流程节点*/

    change_steps(node, index) {
      this.spryTypes = []
      console.log('onChange:', node)
      this.current = index
      this.editNode = node
      /* 0角色 1用户 2部门 3发起人 4发起人的部门负责人 5发起人部门*/
      this.spry.chooseDep = node.chooseDep || false
      if (this.spry.chooseDep) this.spryTypes.push('5')
      this.spry.chooseDepHeader = node.chooseDepHeader || false
      if (this.spry.chooseDepHeader) this.spryTypes.push('4')
      this.spry.chooseSponsor = node.chooseSponsor || false
      if (this.spry.chooseSponsor) this.spryTypes.push('3')
      var userIds = []
      for (const user of node.users || []) {
        userIds.push(user.username)
      }
      this.spry.userIds = userIds.join(',')
      if (userIds.length > 0) this.spryTypes.push('1')
      var roleIds = []
      for (const role of node.roles || []) {
        roleIds.push(role.roleCode)
      }
      this.spry.roleIds = roleIds.join(',')
      if (roleIds.length > 0) this.spryTypes.push('0')
      var departmentIds = []
      for (const department of node.departments || []) {
        departmentIds.push(department.id)
      }
      this.spry.departmentIds = departmentIds.join(',')
      if (departmentIds.length > 0) this.spryTypes.push('2')
      console.log('回显this.spry', this.spry)
    },
    spryType(types) {
      /* 0角色 1用户 2部门 3发起人 4发起人的部门负责人*/
      // this.spryTypes = types;
      if (this.spryTypes.indexOf('0') == -1) this.spry.roleIds = ''
      if (this.spryTypes.indexOf('1') == -1) this.spry.userIds = ''
      if (this.spryTypes.indexOf('2') == -1) this.spry.departmentIds = ''
      //是否选中发起人
      this.spry.chooseSponsor = this.spryTypes.indexOf('3') > -1
      //是否选中发起人的部门领导
      this.spry.chooseDepHeader = this.spryTypes.indexOf('4') > -1
      //是否选中发起人的部门
      this.spry.chooseDep = this.spryTypes.indexOf('5') > -1
      console.log('this.spry', this.spry)
    },
    sprySubmit() {
      var _this = this
      if (this.spryTypes.length == 0) {
        _this.$message.error('必须选择审批人！')
        return
      }
      _this.confirmLoading = true
      this.spry.nodeId = this.editNode.id
      // console.log(this.spry)
      postFormAction(_this.url.editNodeUser, this.spry)
        .then(res => {
          if (res.success) {
            _this.$message.success('操作成功')
            // _this.getData();
          } else {
            _this.$message.error(res.message)
          }
        })
        .finally(() => (_this.confirmLoading = false))
    },
    getNodeData(row) {
      var _this = this

      postFormAction(_this.url.getProcessNode, {
        id: row.id
      }).then(res => {
        if (res.success) {
          // 转换null为""
          _this.nodeList = res.result || []
          console.log('_this.nodeList', _this.nodeList)
          if (_this.nodeList.length > 0) {
            _this.editNode = _this.nodeList[0]
            _this.showProcessNodeEdit = true
          }
        } else {
          _this.$message.error(res.message)
        }
      })
    },
    /*编辑流程信息*/
    edit(row) {
      this.editObj = Object.assign(this.editObj, row)

      this.editObj.visible = true
    },
    editObjOk() {
      var _this = this
      this.editForm.validateFields((err, values) => {
        if (!err) {
          console.log(this.editObj)
          let formData = Object.assign(this.editObj, values)
          let node = this.allFormComponent.find(el => {
            return el.id == formData.routeName
          })
          console.log(node)
          formData.businessTable = node.tableName
          console.log('formData', formData)
          this.confirmLoading = true
          postAction(this.url.updateInfo, formData)
            .then(res => {
              if (res.success) {
                _this.$message.success('操作成功')
                _this.loadData()
                _this.editObj.visible = false
              } else {
                _this.$message.error(res.message)
              }
            })
            .finally(() => (_this.confirmLoading = false))
        }
      })
    },
    change_routeName(val, row) {
      // console.log('val==================。',val,row)
      this.editObj.routeName = val
      // this.$nextTick(() => {
      //   let routeName = this.editForm.getFieldValue('routeName')
      //   console.log('routeName', routeName)
      //   var route = this.getFormComponent(routeName)
      //   this.editObj.businessTable = route.businessTable
      //   this.editObj.routeName = route.routeName
      //   console.log('this.editObj', this.editObj)
      // })
    },
    viewForm() {
      let routeName = this.editObj.routeName
      // console.log('routeName==========================>', routeName)
      if (!routeName) {
        this.$message.warning('该流程信息未配置表单，请联系开发人员！')
        return
      }
      getAction(`/online/cgform/api/getColumns/${routeName}`).then(res => {
        //异步请求这个参数~，不然第一次会报错点不开
        //表单数据
        let formTemplate = res.result.formTemplate
        setTimeout(() => {
          //优先级往后，解决报错
          this.$refs.modal.detail(formTemplate) //表单modle
        }, 10)
      })
    },
    convertToModel(row) {
      let that = this
      this.$confirm({
        title: '确认转化',
        content: '您确认要转化流程 ' + row.name + ' 为模型?',
        loading: true,
        onOk: () => {
          postFormAction(`${that.url.convertToModel}`, { id: row.id }).then(res => {
            if (res.success) {
              setTimeout(function() {
                that.$message.success('转化成功')
              }, 300)
            } else {
              that.$message.error(res.message)
            }
          })
        }
      })
    },
    remove(row) {
      var _this = this
      _this.$confirm({
        title: '确认删除',
        content: '您确认要删除流程 ' + row.name + ' ?',
        loading: true,
        onOk: () => {
          postFormAction(_this.url.delByIds, { ids: row.id }).then(res => {
            if (res.success) {
              _this.$message.success('操作成功')
              _this.loadData()
            } else {
              _this.$message.error(res.message)
            }
          })
        }
      })
    },
    editStatus(status, row) {
      var _this = this
      let operation = ''
      if (status == 0) {
        operation = '不启用'
      } else {
        operation = '启用'
      }
      this.$confirm({
        title: '确认' + operation + '?',
        content: `您确认要${operation}流程${row.name}?`,
        onOk() {
          let params = {
            status: status,
            id: row.id
          }
          postFormAction(_this.url.updateStatus, params).then(res => {
            if (res.success) {
              _this.$message.success('操作成功')
              _this.loadData()
            } else {
              _this.$message.error(res.message)
            }
          })
        },
        onCancel() {}
      })
    },
    /*查看流程图片*/
    showResource(row) {
      this.viewTitle = '流程图片预览(' + row.diagramName + ')'
      this.diagramUrl = `${window._CONFIG['domianURL']}${this.url.img}?id=${row.id}`
      this.viewImage = true
    },
    /*删除模型*/
    deletelc(y, row) {
      console.log(y, row)
      if (y) {
        getAction(this.url.delete + row.id).then(res => {
          if (res.success) {
            this.$message.success(res.message)
          } else {
            this.$message.error(res.message)
          }
          this.loadData()
        })
      }
    },
    handleTableChange(pagination, filters, sorter) {
      //分页、排序、筛选变化时触发
      //TODO 筛选
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = 'ascend' == sorter.order ? 'asc' : 'desc'
      }
      this.ipagination = pagination
      console.log(pagination, filters, sorter)
      /*if (Object.keys(filters).length>0&&this.dataList.length>0){
          for (const filterField in filters) {
            let fiterVals = filters[filterField]||[];

          }
        }*/
      // this.loadData();
    },
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }
      var params = this.getQueryParams() //查询条件
      this.loading = true
      getAction(this.url.list, params).then(res => {
        if (res.success) {
          let records = res.result || []
          this.dataSource = records
          this.dataList = records
          this.ipagination.total = records.length
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
        this.loading = false
      })
    },
    getQueryParams() {
      var param = Object.assign({}, this.queryParam, this.isorter)
      delete param.createTimeRange // 时间参数不传递后台
      return filterObj(param)
    },

    // 重置
    searchReset() {
      var that = this
      var logType = that.queryParam.logType
      that.queryParam = {} //清空查询区域参数
      that.queryParam.logType = logType
      that.loadData(this.ipagination.current)
    },
    onDateChange: function(value, dateString) {
      console.log(dateString[0], dateString[1])
      this.queryParam.createTime_begin = dateString[0]
      this.queryParam.createTime_end = dateString[1]
    },
    onDateOk(value) {
      console.log(value)
    },

    filter_categoryId(v, r) {
      // console.log(v,r)
      return r.categoryId == v
    }
  }
}
</script>

<style scoped>
@import '~@assets/less/common.less';
.nodespan {
  color: #999;
}
.ant-checkbox-wrapper + .ant-checkbox-wrapper {
  margin-left: 0;
  margin-right: 8px;
}
</style>