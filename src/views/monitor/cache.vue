<template>
  <div v-loading="!show" element-loading-text="数据加载中..." :style="!show ? 'height: 500px' : 'height: 100%'" class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold;color: #666;font-size: 15px">基本信息</span>
        <i class="el-icon-refresh" style="margin-left: 40px" @click="getList" />
      </div>
      <div class="el-table el-table--enable-row-hover el-table--medium">
        <table cellspacing="0" style="width: 100%">
          <tbody>
            <tr>
              <td><div class="cell">Redis版本</div></td>
              <td><div v-if="cache.info" class="cell">{{ cache.info.redis_version }}</div></td>
              <td><div class="cell">运行模式</div></td>
              <td><div v-if="cache.info" class="cell">{{ cache.info.redis_mode == "standalone" ? "单机" : "集群" }}</div></td>
              <td><div class="cell">端口</div></td>
              <td><div v-if="cache.info" class="cell">{{ cache.info.tcp_port }}</div></td>
              <td><div class="cell">客户端数</div></td>
              <td><div v-if="cache.info" class="cell">{{ cache.info.connected_clients }}</div></td>
            </tr>
            <tr>
              <td><div class="cell">运行时间(天)</div></td>
              <td><div v-if="cache.info" class="cell">{{ cache.info.uptime_in_days }}</div></td>
              <td><div class="cell">使用内存</div></td>
              <td><div v-if="cache.info" class="cell">{{ cache.info.used_memory_human }}</div></td>
              <td><div class="cell">使用CPU</div></td>
              <td><div v-if="cache.info" class="cell">{{ parseFloat(cache.info.used_cpu_user_children).toFixed(2) }}</div></td>
              <td><div class="cell">内存配置</div></td>
              <td><div v-if="cache.info" class="cell">{{ cache.info.maxmemory_human }}</div></td>
            </tr>
            <tr>
              <td><div class="cell">AOF是否开启</div></td>
              <td><div v-if="cache.info" class="cell">{{ cache.info.aof_enabled == "0" ? "否" : "是" }}</div></td>
              <td><div class="cell">RDB是否成功</div></td>
              <td><div v-if="cache.info" class="cell">{{ cache.info.rdb_last_bgsave_status }}</div></td>
              <td><div class="cell">Key数量</div></td>
              <td><div v-if="cache.dbSize" class="cell">{{ cache.dbSize }} </div></td>
              <td><div class="cell">网络入口/出口</div></td>
              <td><div v-if="cache.info" class="cell">{{ cache.info.instantaneous_input_kbps }}kps/{{ cache.info.instantaneous_output_kbps }}kps</div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-card>

    <div>
      <el-row :gutter="6">
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" style="margin-bottom: 10px">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span style="font-weight: bold;color: #666;font-size: 15px">命令统计</span>
            </div>

            <div class="el-table el-table--enable-row-hover el-table--medium">
              <div ref="commandstats" style="height: 420px" />
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" style="margin-bottom: 10px">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span style="font-weight: bold;color: #666;font-size: 15px">内存信息</span>
            </div>
            <div class="el-table el-table--enable-row-hover el-table--medium">
              <div ref="usedmemory" style="height: 420px" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { getCacheData as getCache } from '@/api/monitor'
import echarts from 'echarts'
export default {
  name: 'Server',
  data() {
    return {
      show: false,
      monitor: null,
      // 加载层信息
      loading: [],
      // 统计命令信息
      commandstats: null,
      // 使用内存
      usedmemory: null,
      // cache信息
      cache: {}
    }
  },
  created() {
    this.getList()
    // this.openLoading()
    this.monitor = window.setInterval(() => {
      setTimeout(() => {
        this.getList()
      }, 2)
    }, 3500)
  },
  destroyed() {
    clearInterval(this.monitor)
  },
  methods: {
    getList() {
      getCache().then((response) => {
        this.cache = response.data
        // this.loading.close();
        this.show = true
        this.commandstats = echarts.init(this.$refs.commandstats, 'macarons')
        this.commandstats.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          series: [
            {
              name: '命令',
              type: 'pie',
              roseType: 'radius',
              radius: [15, 95],
              center: ['50%', '38%'],
              data: response.data.commandStats,
              animationEasing: 'cubicInOut',
              animationDuration: 1000
            }
          ]
        })
        this.usedmemory = echarts.init(this.$refs.usedmemory, 'macarons')
        this.usedmemory.setOption({
          tooltip: {
            formatter: '{b} <br/>{a} : ' + this.cache.info.used_memory_human
          },
          series: [
            {
              name: '峰值',
              type: 'gauge',
              min: 0,
              max: 1000,
              detail: {
                formatter: this.cache.info.used_memory_human
              },
              data: [
                {
                  value: parseFloat(this.cache.info.used_memory_human),
                  name: '内存消耗'
                }
              ]
            }
          ]
        })
      })
    }
    // // 打开加载层
    // openLoading() {
    //   this.loading = this.$loading({
    //     lock: true,
    //     text: "拼命读取中",
    //     spinner: "el-icon-loading",
    //     background: "rgba(0, 0, 0, 0.7)",
    //   });
    // },
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .box-card {
    margin-bottom: 5px;
    span {
      margin-right: 28px;
    }
    .el-icon-refresh {
      margin-right: 10px;
      float: right;
      cursor:pointer;
    }
  }
</style>
