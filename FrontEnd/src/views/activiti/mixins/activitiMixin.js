import { filterObj } from '@/utils/util'
import { deleteAction, getAction, downFile } from '@/api/manage'
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import JEllipsis from '@/components/hwdz/JEllipsis'
export const activitiMixin = {
  components: {
    JEllipsis
  },
  data() {
    return {
      //token header
      code: '',
      tokenHeader: { 'X-Access-Token': Vue.ls.get(ACCESS_TOKEN) },
      allFormComponent: []
    }
  },
  created() {
    this.getFormComponent()
  },
  computed: {
    /*所有的流程表单，组件化注册，在此维护*/
    // allFormComponent: function() {
    //   return [

    //     {
    //       text: '示例表单',
    //       routeName: '@/views/activiti/form/demoForm',
    //       component: () => import(`@/views/activiti/form/demoForm`),
    //       businessTable: 'test_demo'
    //     },
    //     {
    //       text: '事项申请表单',
    //       routeName: '@/views/activiti/form/testForm',
    //       component: () => import(`@/views/activiti/form/testForm`),
    //       businessTable: 'test_demo01'
    //     }
    //   ]
    // },
    historicDetail: function() {
      return () => import(`@/views/activiti/historicDetail`)
    }
  },
  methods: {
    //表但数据公用方法
    detail(r, isView) {
      var that = this
      console.log('r============>', r)
      that.code = r.routeName
      if (!r.routeName) {
        that.$message.warning('该流程信息未配置表单，请联系开发人员！')
        return
      }
      getAction(`/online/cgform/api/getColumns/${r.routeName}`).then(res => {
        //异步请求这个参数~，不然第一次会报错点不开
        //表单数据
        let formTemplate = res.result.formTemplate
        setTimeout(() => {
          //优先级往后，解决报错
          if (!isView) {
            that.$refs.modal.detail(formTemplate, r.tableId) //表单modle
          } else {
            that.$refs.modal.edit(formTemplate, r.tableId)
          }
        }, 30)
      })
    },
    getFormComponent() {
      getAction('/online/cgform/head/list', { pageNo: 1, pageSize: 99 }).then(res => {
        this.allFormComponent = res.result.records
        console.log('this.allFormComponent', this.allFormComponent)
      })
    },
    // getFormComponent(routeName) {
    //   return _.find(this.allFormComponent, { routeName: routeName }) || {}
    // },
    millsToTime(mills) {
      if (!mills) {
        return ''
      }
      let s = mills / 1000
      if (s < 60) {
        return s.toFixed(0) + ' 秒'
      }
      let m = s / 60
      if (m < 60) {
        return m.toFixed(0) + ' 分钟'
      }
      let h = m / 60
      if (h < 24) {
        return h.toFixed(0) + ' 小时'
      }
      let d = h / 24
      if (d < 30) {
        return d.toFixed(0) + ' 天'
      }
      let month = d / 30
      if (month < 12) {
        return month.toFixed(0) + ' 个月'
      }
      let year = month / 12
      return year.toFixed(0) + ' 年'
    },
    handleTableChange(pagination, filters, sorter) {
      //分页、排序、筛选变化时触发
      //TODO 筛选
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = 'ascend' == sorter.order ? 'asc' : 'desc'
      }
      this.ipagination = pagination
      // this.loadData();
    }
  }
}
