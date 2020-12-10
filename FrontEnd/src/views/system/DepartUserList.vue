<template>
  <a-row class="mainContentHeight" :gutter="12">
    <a-col class="mainContentHeight" :md="8" :sm="24">
      <a-card class="mainContentHeight" :bodyStyle="{height:'100%'}" :bordered="false">
        <div style="background: #fff;height: 100%;">
          <a-input-search @search="onSearch" style="width:100%;" placeholder="请输入部门名称"/>
          <!-- 树-->
          <template v-if="userIdentity === '2' && departTree.length>0">
            <!--组织机构-->
            <a-tree
              showLine
              :selectedKeys="selectedKeys"
              :checkStrictly="true"
              @select="onSelect"
              :dropdownStyle="{maxHeight:'500px',overflow:'auto'}"
              :treeData="departTree"
              :autoExpandParent="autoExpandParent"
              :expandedKeys="iExpandedKeys"
              @expand="onExpand"
            />
          </template>
          <div style="margin-top: 24px;" v-else-if="userIdentity === '2' && departTree.length==0">
            <h3><span>您的部门下暂无有效部门信息</span></h3>
          </div>
          <div style="margin-top: 24px;" v-else><h3>普通员工暂此权限</h3></div>
        </div>
      </a-card>
    </a-col>
    <a-col class="mainContentHeight" :md="16" :sm="24">
      <a-card class="mainContentHeight TableCardClass" :bodyStyle="{height:'100%',padding: '0 .15rem'}" :bordered="false">
        <a-tabs class="mainContentHeight" defaultActiveKey="2" @change="callback">
          <a-tab-pane tab="基本信息" key="1" forceRender>
            <Dept-Base-Info ref="DeptBaseInfo"></Dept-Base-Info>
          </a-tab-pane>
          <a-tab-pane tab="用户信息" key="2">
            <Dept-User-Info ref="DeptUserInfo" @clearSelectedDepartKeys="clearSelectedDepartKeys"></Dept-User-Info>
          </a-tab-pane>
          <a-tab-pane tab="部门角色" key="3" forceRender>
            <dept-role-info ref="DeptRoleInfo" @clearSelectedDepartKeys="clearSelectedDepartKeys"/>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </a-col>
  </a-row>
</template>
<script>
  import DeptBaseInfo from './modules/DeptBaseInfo'
  import DeptUserInfo from './modules/DeptUserInfo'
  import {queryMyDepartTreeList, searchByKeywords} from '@/api/api'
  import {hwdzListMixin} from '@/mixins/hwdzListMixin'
  import DeptRoleInfo from './modules/DeptRoleInfo'

  export default {
    name: 'DepartUserList',
    mixins: [hwdzListMixin],
    components: {
      DeptRoleInfo,
      DeptBaseInfo,
      DeptUserInfo,
    },
    data() {
      return {
        currentDeptId: '',
        iExpandedKeys: [],
        loading: false,
        autoExpandParent: true,
        currFlowId: '',
        currFlowName: '',
        disable: true,
        treeData: [],
        visible: false,
        departTree: [],
        rightClickSelectedKey: '',
        hiding: true,
        model: {},
        dropTrigger: '',
        depart: {},
        disableSubmit: false,
        checkedKeys: [],
        selectedKeys: [],
        autoIncr: 1,
        currSelected: {},
        form: this.$form.createForm(this),
        labelCol: {
          xs: {span: 24},
          sm: {span: 5}
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16}
        },
        graphDatasource: {
          nodes: [],
          edges: []
        },
        userIdentity:"",
      }
    },
    methods: {
      callback(key) {
        //console.log(key)
      },
      loadData() {
        this.refresh();
      },
      clearSelectedDepartKeys() {
        this.checkedKeys = [];
        this.selectedKeys = [];
        this.currentDeptId = '';
        this.$refs.DeptUserInfo.currentDeptId='';
        this.$refs.DeptRoleInfo.currentDeptId='';
      },
      loadTree() {
        var that = this
        that.treeData = []
        that.departTree = []
        queryMyDepartTreeList().then((res) => {
          if (res.success && res.result ) {
            for (let i = 0; i < res.result.length; i++) {
              let temp = res.result[i]
              that.treeData.push(temp)
              that.departTree.push(temp)
              that.setThisExpandedKeys(temp)
              // console.log(temp.id)
            }
            this.loading = false
          }
          that.userIdentity = res.message
        })
      },
      setThisExpandedKeys(node) {
        //只展开一级目录
        if (node.children && node.children.length > 0) {
          this.iExpandedKeys.push(node.key)
          //下方代码放开注释则默认展开所有节点
          /**
          for (let a = 0; a < node.children.length; a++) {
            this.setThisExpandedKeys(node.children[a])
          }
          */
        }
      },
      refresh() {
        this.loading = true
        this.loadTree()
      },

      onExpand(expandedKeys) {
        // console.log('onExpand', expandedKeys)
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        this.iExpandedKeys = expandedKeys
        this.autoExpandParent = false
      },

      onSearch(value) {
        let that = this
        if (value) {
          searchByKeywords({keyWord: value,myDeptSearch:'1'}).then((res) => {
            if (res.success) {
              that.departTree = []
              for (let i = 0; i < res.result.length; i++) {
                let temp = res.result[i]
                that.departTree.push(temp)
              }
            } else {
              that.$message.warning(res.message)
            }
          })
        } else {
          that.loadTree()
        }

      },
      onCheck(checkedKeys, e) {
        let record = e.node.dataRef;
        // console.log('onCheck', checkedKeys, e);
        this.checkedKeys = [];
        // if (e.checked === true) {
        this.currentDeptId = record.id;
        this.checkedKeys.push(record.id);

        this.$refs.DeptBaseInfo.open(record);
        this.$refs.DeptUserInfo.open(record);
        this.$refs.DeptRoleInfo.open(record);
        // }
        // else {
        //   this.checkedKeys = [];
        //   this.$refs.DeptBaseInfo.clearForm();
        //   this.$refs.DeptUserInfo.clearList();
        // }

        this.hiding = false;
        // this.checkedKeys = checkedKeys.checked
      },
      onSelect(selectedKeys, e) {
        if (this.selectedKeys[0] !== selectedKeys[0]) {
          this.selectedKeys = [selectedKeys[0]];
        }
        let record = e.node.dataRef;
        this.checkedKeys.push(record.id);
        this.$refs.DeptBaseInfo.open(record);
        this.$refs.DeptUserInfo.onClearSelected();
        this.$refs.DeptUserInfo.open(record);
        this.$refs.DeptRoleInfo.onClearSelected();
        this.$refs.DeptRoleInfo.open(record);
      },
    },
    created() {
      this.currFlowId = this.$route.params.id
      this.currFlowName = this.$route.params.name
      // this.loadTree()
    },
  }
</script>
<style lang='less' scoped>
  @import '~@assets/less/common.less';
  .mainContentHeight{
    .ant-tabs{
      position:static
    }
  }
</style>
