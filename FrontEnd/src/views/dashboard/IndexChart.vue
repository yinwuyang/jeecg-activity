<template>
  <div class="page-header-index-wide">
    <a-row :gutter="12">
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '15px' }">
        <chart-card :loading="loading" title="总故障数" total="126,560">
          <a-tooltip title="总故障数" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <trend flag="up" style="margin-right: 16px;">
              <span slot="term">周同比</span>
              12%
            </trend>
            <trend flag="down">
              <span slot="term">日同比</span>
              11%
            </trend>
          </div>
          <template slot="footer">日均故障数<span> 234.56</span></template>
        </chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '15px' }">
        <chart-card :loading="loading" title="备品备件总出入量" :total="8846 | NumberFormat">
          <a-tooltip title="备品备件总出入量" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <mini-area />
          </div>
          <template slot="footer">日订出入量<span> {{ '1234' | NumberFormat }}</span></template>
        </chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '15px' }">
        <chart-card :loading="loading" title="设备报警数" :total="6560 | NumberFormat">
          <a-tooltip title="设备报警数" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <mini-bar :height="40" />
          </div>
          <template slot="footer">转化率 <span>60%</span></template>
        </chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '15px' }">
        <chart-card :loading="loading" title="维保">
          <a-tooltip title="维保" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div class="card-flex">
            <div>
              <p style="color:#52c41a">
                <img src="@/assets/weixiu.png">维修</p>
              <p class="total">3,200</p>
            </div>
            <div>
              <p style="color:#faad14">
                <img src="@/assets/anquanhuang.png">保养</p>
              <p class="total">3,200</p>
            </div>
            <div>
              <p style="color:#1890ff">
                <img src="@/assets/xingchenglan.png">巡检</p>
              <p class="total">3,200</p>
            </div>
          </div>
          <template slot="footer">
            <trend flag="down" style="margin-right: 16px;">
              <span slot="term">同周比</span>
              12%
            </trend>
            <trend flag="up">
              <span slot="term">日环比</span>
              80%
            </trend>
          </template>
        </chart-card>
      </a-col>
    </a-row>

    <a-card :loading="loading" :bordered="false" :body-style="{padding: '0'}">
      <div class="salesCard" v-if="userIdentity == 2">
        <a-tabs default-active-key="1" size="large" :tab-bar-style="{marginBottom: '24px', paddingLeft: '16px'}">
          <a-tab-pane loading="true" tab="故障数（年）" key="1">
            <a-row>
              <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
                <bar title="故障数（年）" :dataSource="barData"/>
              </a-col>
              <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
                <rank-list title="故障类型排行榜" :list="rankList"/>
              </a-col>
            </a-row>
          </a-tab-pane>
          <a-tab-pane tab="故障数（站）" key="2">
            <a-row>
              <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
                <bar title="故障数（年）" :dataSource="barData2"/>
              </a-col>
              <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
                <rank-list title="故障数排行榜（站）" :list="rankList2"/>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </div>
      <div class="salesCard" v-if="userIdentity == 1">
        <a-tabs default-active-key="1" size="large" :tab-bar-style="{marginBottom: '24px', paddingLeft: '16px'}">
          <a-tab-pane loading="true" tab="故障数（年）" key="1">
            <a-row>
              <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">
                <bar title="故障数（年）" :dataSource="barData"/>
              </a-col>
              <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">
                <rank-list title="故障类型排行榜" :list="rankList"/>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-card>

    <a-row :gutter="12" style="margin-bottom:15px">
      <a-col :sm="24" :md="12">
        <a-card :loading="loading" :bordered="false" title="通知公告" :style="{ marginTop: '15px' }" :body-style="{padding: '20px 20px 5px'}">
          <a-table
            :columns="columns"
            :data-source="data"
            ref="table"
            size="middle"
            bordered
          >
            <span slot="action" slot-scope="text, record">
              <a href="javascript:;" @click="handleDetail(record)">详情</a>
            </span>
          </a-table>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="12">
        <a-card :loading="loading" :bordered="false" title="系统消息" :style="{ marginTop: '15px' }" :body-style="{padding: '20px 20px 5px'}">
          <a-table
            :columns="columns"
            :data-source="data"
            ref="table"
            size="middle"
            bordered
          >
            <span slot="action" slot-scope="text, record">
              <a href="javascript:;" @click="handleDetail(record)">详情</a>
            </span>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {USER_INFO} from "@/store/mutation-types"
  import ChartCard from '@/components/ChartCard'
  import ACol from "ant-design-vue/es/grid/Col"
  import ATooltip from "ant-design-vue/es/tooltip/Tooltip"
  import MiniArea from '@/components/chart/MiniArea'
  import MiniBar from '@/components/chart/MiniBar'
  import MiniProgress from '@/components/chart/MiniProgress'
  import RankList from '@/components/chart/RankList'
  import Bar from '@/components/chart/Bar'
  import LineChartMultid from '@/components/chart/LineChartMultid'
  import HeadInfo from '@/components/tools/HeadInfo.vue'
  import Trend from '@/components/Trend'

  const barData = []
  for (let i = 0; i < 12; i += 1) {
    barData.push({
      x: `${i + 1}月`,
      y: Math.floor(Math.random() * 1000) + 200
    })
  }
  export default {
    name: "IndexChart",
    components: {
      ATooltip,
      ACol,
      ChartCard,
      MiniArea,
      MiniBar,
      MiniProgress,
      RankList,
      Bar,
      Trend,
      LineChartMultid,
      HeadInfo
    },
    data() {
      return {
        loading: true,
        center: null,
        userIdentity: 2,
        rankList: [
          {
            name: '站台单元控制器故障',
            total: 500
          },
          {
            name: '安全回路故障',
            total: 480
          },
          {
            name: '驱动电源故障',
            total: 420
          },
          {
            name: '绝缘故障',
            total: 360
          },
          {
            name: '其他故障',
            total: 200
          },
          {
            name: '其他故障',
            total: 200
          },
          {
            name: '其他故障',
            total: 200
          }
        ],
        barData,
        barData2: [
          {
            x: '河南工业大学站',
            y: Math.floor(Math.random() * 1000) + 200
          },
          {
            x: '郑大科技园站',
            y: Math.floor(Math.random() * 1000) + 200
          },
          {
            x: '郑州大学站',
            y: Math.floor(Math.random() * 1000) + 200
          },
          {
            x: '梧桐街站',
            y: Math.floor(Math.random() * 1000) + 200
          },
          {
            x: '兰寨站',
            y: Math.floor(Math.random() * 1000) + 200
          },
          {
            x: '铁炉站',
            y: Math.floor(Math.random() * 1000) + 200
          },
          {
            x: '市民中心站',
            y: Math.floor(Math.random() * 1000) + 200
          },
          {
            x: '西流湖站',
            y: Math.floor(Math.random() * 1000) + 200
          },
          {
            x: '西三环站',
            y: Math.floor(Math.random() * 1000) + 200
          },
          {
            x: '秦岭路站',
            y: Math.floor(Math.random() * 1000) + 200
          },
          {
            x: '五一公园站',
            y: Math.floor(Math.random() * 1000) + 200
          },
          {
            x: '碧沙岗站',
            y: Math.floor(Math.random() * 1000) + 200
          }
        ],
        rankList2: [
          {
            name: '河南工业大学站',
            total: 500
          },
          {
            name: '郑大科技园站',
            total: 480
          },
          {
            name: '郑州大学站',
            total: 420
          },
          {
            name: '梧桐街站',
            total: 360
          },
          {
            name: '兰寨站',
            total: 200
          },
          {
            name: '铁炉站',
            total: 180
          },
          {
            name: '五一公园站',
            total: 160
          }
        ],
        columns: [
          {
            title: '序号',
            dataIndex: 'num',
            align: 'center',
            key: 'num',
            width: 80
          },
          {
            title: '标题',
            dataIndex: 'name',
            key: 'name'
          },
          {
            title: '时间',
            dataIndex: 'time',
            align: 'center',
            key: 'time',
            width: 180
          },
          {
            title: '操作',
            dataIndex: 'action',
            fixed: 'right',
            scopedSlots: { customRender: 'action' },
            align: 'center',
            width: 80
          }
        ],
        data: [
          {
            num: '01',
            name: '公告测试',
            time: '2020-06-09 10:23:36'
          },
          {
            num: '02',
            name: '公告测试',
            time: '2020-06-09 10:23:36'
          },
          {
            num: '03',
            name: '公告测试',
            time: '2020-06-09 10:23:36'
          },
          {
            num: '04',
            name: '公告测试',
            time: '2020-06-09 10:23:36'
          },
          {
            num: '05',
            name: '公告测试',
            time: '2020-06-09 10:23:36'
          }
        ]
      }
    },
    created() {
      setTimeout(() => {
        this.loading = !this.loading
      }, 1000)
      // 获取用户类型 userIdentity 1:站用户 2:线用户
      const userinfo = Vue.ls.get(USER_INFO);
      this.userIdentity = userinfo.userIdentity
    },
    methods: {
    }
  }
</script>

<style lang="less" scoped>
  .circle-cust{
    position: relative;
    top: 28px;
    left: -100%;
  }
  /* 首页访问量统计 */
  .head-info {
    position: relative;
    text-align: left;
    padding: 0 32px 0 0;
    min-width: 125px;

    &.center {
      text-align: center;
      padding: 0 32px;
    }

    span {
      color: rgba(0, 0, 0, .45);
      display: inline-block;
      font-size: .95rem;
      line-height: 42px;
      margin-bottom: 4px;
    }
    p {
      line-height: 42px;
      margin: 0;
      a {
        font-weight: 600;
        font-size: 1rem;
      }
    }
  }
  .ant-table-pagination.ant-pagination{
    margin-bottom: 0;
  }
  .card-flex{
    display:flex;
    justify-content: space-between;
    padding-right: 10%;
    margin-bottom: 10px;
    div{
      img{
        width: 24px;
        margin-right: 5px;
        vertical-align: bottom;
      }
      p{
        font-size: 16px;
        margin-bottom: 0;
      }
      .total{
        font-size: 30px;
        line-height: 38px;
        height: 38px;
        color: #000;
        margin-bottom: 0;
      }
    }
    div:nth-child(1) img{
      width: 20px;
      margin-bottom: 2px;
    }
  }
</style>
