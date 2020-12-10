<template>
  <a-skeleton active :loading="loading" :paragraph="{ rows: 17 }">
    <a-card class="TableCardClass card-area" :bodyStyle="{ height: '100%' }" :bordered="false">
      <a-alert type="info" :showIcon="true">
        <div slot="message">
          共追踪到 {{ dataSource.length }} 条近期HTTP请求记录
          <a-divider type="vertical" />
          <a @click="handleClickUpdate">立即刷新</a>
        </div>
      </a-alert>

      <!-- 表格区域 -->
      <div class="table-cont">
        <a-table
          size="middle"
          :scroll="{ y: scrollY }"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="pagination"
          :loading="tableLoading"
          style="margin-top: 20px;"
          @change="handleTableChange"
        >
          <template slot="timeTaken" slot-scope="text">
            <a-tag v-if="text < 500" color="green">{{ text }} ms</a-tag>
            <a-tag v-else-if="text < 1000" color="cyan">{{ text }} ms</a-tag>
            <a-tag v-else-if="text < 1500" color="orange">{{ text }} ms</a-tag>
            <a-tag v-else color="red">{{ text }} ms</a-tag>
          </template>

          <template slot="responseStatus" slot-scope="text">
            <a-tag v-if="text < 200" color="pink">{{ text }} </a-tag>
            <a-tag v-else-if="text < 201" color="green">{{ text }} </a-tag>
            <a-tag v-else-if="text < 399" color="cyan">{{ text }} </a-tag>
            <a-tag v-else-if="text < 403" color="orange">{{ text }} </a-tag>
            <a-tag v-else-if="text < 501" color="red">{{ text }} </a-tag>
            <span v-else>{{ text }}</span>
          </template>

          <template slot="requestMethod" slot-scope="text">
            <a-tag v-if="text === 'GET'" color="#87d068">{{ text }}</a-tag>
            <a-tag v-else-if="text === 'POST'" color="#2db7f5">{{ text }}</a-tag>
            <a-tag v-else-if="text === 'PUT'" color="#ffba5a">{{ text }}</a-tag>
            <a-tag v-else-if="text === 'DELETE'" color="#f50">{{ text }}</a-tag>
            <span v-else>{{ text }} ms</span>
          </template>
        </a-table>
      </div>
    </a-card>
  </a-skeleton>
</template>

<script>
import moment from 'moment'
import { getAction } from '@/api/manage'
import { hwdzListMixin } from '@/mixins/hwdzListMixin'
moment.locale('zh-cn')

export default {
  name: 'HttpTrace',
  mixins: [hwdzListMixin],
  data() {
    return {
      scrollY: 500,
      advanced: false,
      dataSource: [],
      pagination: {
        defaultPageSize: 10,
        defaultCurrent: 1,
        pageSizeOptions: ['10', '20', '30', '40', '100'],
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: (total, range) => `显示 ${range[0]} ~ ${range[1]} 条记录，共 ${total} 条记录`
      },
      loading: true,
      tableLoading: true
    }
  },
  computed: {
    columns() {
      return [
        {
          title: '请求时间',
          dataIndex: 'timestamp',
          customRender(text) {
            return moment(text).format('YYYY-MM-DD HH:mm:ss')
          }
        },
        {
          title: '请求方法',
          dataIndex: 'request.method',
          scopedSlots: { customRender: 'requestMethod' },
          filters: [
            { text: 'GET', value: 'GET' },
            { text: 'POST', value: 'POST' },
            { text: 'PUT', value: 'PUT' },
            { text: 'DELETE', value: 'DELETE' }
          ],
          filterMultiple: true,
          onFilter: (value, record) => record.request.method.includes(value)
        },
        {
          title: '请求URL',
          dataIndex: 'request.uri',
          customRender(text) {
            return text.split('?')[0]
          }
        },
        {
          title: '响应状态',
          dataIndex: 'response.status',
          scopedSlots: { customRender: 'responseStatus' }
        },
        {
          title: '请求耗时',
          dataIndex: 'timeTaken',
          scopedSlots: { customRender: 'timeTaken' }
        }
      ]
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    loadData() {},
    handleClickUpdate() {
      this.fetch()
    },

    handleTableChange() {
      this.fetch()
    },

    fetch() {
      this.tableLoading = true
      getAction('actuator/httptrace')
        .then(data => {
          let filterData = []
          for (let d of data.traces) {
            if (d.request.method !== 'OPTIONS' && d.request.uri.indexOf('httptrace') === -1) {
              filterData.push(d)
            }
          }
          this.dataSource = filterData
        })
        .catch(e => {
          console.error(e)
          this.$message.error('获取HTTP信息失败')
        })
        .finally(() => {
          this.loading = false
          this.tableLoading = false
          var that = this
          that.$nextTick(that.resizeEvent)
          window.addEventListener('resize', that.resizeEvent)
        })
    }
  }
}
</script>
<style></style>
<style scoped>
.table-cont {
  height: calc(100% - 96px);
}
</style>
<style lang="less">
@import '~@assets/less/common.less';
</style>
