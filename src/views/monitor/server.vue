<template>
  <div v-loading="!show" element-loading-text="数据加载中..." :style="!show ? 'height: 500px' : 'height: 100%'" class="app-container">
    <div v-if="show">
      <el-card class="box-card">
        <div style="color: #666;font-size: 13px;">
          <svg-icon icon-class="system" style="margin-right: 5px" />
          <span>
            系统：{{ data.system.os }}
          </span>
          <span>
            IP：{{ data.system.ip }}
          </span>
          <span>
            项目运行时长：{{ data.system.runTime }}
          </span>
          <i class="el-icon-refresh" style="margin-left: 40px" @click="init" />
        </div>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold;color: #666;font-size: 15px">状态</span>
        </div>
        <div>
          <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6" style="margin-bottom: 10px">
            <div class="title">CPU使用率</div>
            <el-tooltip placement="top-end">
              <div slot="content" style="font-size: 12px;">
                <div style="padding: 3px;">
                  {{ data.cpu.name }}
                </div>
                <div style="padding: 3px">
                  {{ data.cpu.package }}
                </div>
                <div style="padding: 3px">
                  {{ data.cpu.core }}
                </div>
                <div style="padding: 3px">
                  {{ data.cpu.logic }}
                </div>
              </div>
              <div class="content">
                <el-progress type="dashboard" :percentage="parseFloat(data.cpu.used)" />
              </div>
            </el-tooltip>
            <div class="footer">{{ data.cpu.coreNumber }} 核心</div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6" style="margin-bottom: 10px">
            <div class="title">内存使用率</div>
            <el-tooltip placement="top-end">
              <div slot="content" style="font-size: 12px;">
                <div style="padding: 3px;">
                  总量：{{ data.memory.total }}
                </div>
                <div style="padding: 3px">
                  已使用：{{ data.memory.used }}
                </div>
                <div style="padding: 3px">
                  空闲：{{ data.memory.available }}
                </div>
              </div>
              <div class="content">
                <el-progress type="dashboard" :percentage="parseFloat(data.memory.usageRate)" />
              </div>
            </el-tooltip>
            <div class="footer">{{ data.memory.used }} / {{ data.memory.total }}</div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6" style="margin-bottom: 10px">
            <div class="title">交换区使用率</div>
            <el-tooltip placement="top-end">
              <div slot="content" style="font-size: 12px;">
                <div style="padding: 3px;">
                  总量：{{ data.swap.total }}
                </div>
                <div style="padding: 3px">
                  已使用：{{ data.swap.used }}
                </div>
                <div style="padding: 3px">
                  空闲：{{ data.swap.available }}
                </div>
              </div>
              <div class="content">
                <el-progress type="dashboard" :percentage="parseFloat(data.swap.usageRate)" />
              </div>
            </el-tooltip>
            <div class="footer">{{ data.swap.used }} / {{ data.swap.total }}</div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6" style="margin-bottom: 10px">
            <div class="title">磁盘使用率</div>
            <div class="content">
              <el-tooltip placement="top-end">
                <div slot="content" style="font-size: 12px;">
                  <div style="padding: 3px">
                    总量：{{ data.disk.total }}
                  </div>
                  <div style="padding: 3px">
                    空闲：{{ data.disk.available }}
                  </div>
                </div>
                <div class="content">
                  <el-progress type="dashboard" :percentage="parseFloat(data.disk.usageRate)" />
                </div>
              </el-tooltip>
            </div>
            <div class="footer">{{ data.disk.used }} / {{ data.disk.total }}</div>
          </el-col>
        </div>
      </el-card>
    
      <div>
        <el-row :gutter="6">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" style="margin-bottom: 10px">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span style="font-weight: bold;color: #666;font-size: 15px">CPU使用率监控</span>
              </div>
              <div>
                <v-chart :options="cpuInfo" />
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" style="margin-bottom: 10px">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span style="font-weight: bold;color: #666;font-size: 15px">内存使用率监控</span>
              </div>
              <div>
                <v-chart :options="memoryInfo" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div>
        <el-row :gutter="6">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" style="margin-bottom: 10px">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span style="font-weight: bold;color: #666;font-size: 15px">CPU</span>
              </div>
              <div class="el-table el-table--enable-row-hover el-table--medium">
              <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="is-leaf"><div class="cell">属性</div></th>
                  <th class="is-leaf"><div class="cell">值</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div class="cell">核心数</div></td>
                  <td><div class="cell" v-if="data.cpu">{{ data.cpu.coreNumber }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">用户使用率</div></td>
                  <td><div class="cell" v-if="data.cpu">{{ data.cpu.userUsed }}%</div></td>
                </tr>
                <tr>
                  <td><div class="cell">系统使用率</div></td>
                  <td><div class="cell" v-if="data.cpu">{{ data.cpu.sysUsed }}%</div></td>
                </tr>
                <tr>
                  <td><div class="cell">当前空闲率</div></td>
                  <td><div class="cell" v-if="data.cpu">{{ data.cpu.free }}%</div></td>
                </tr>
              </tbody>
            </table>
          </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" style="margin-bottom: 10px">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span style="font-weight: bold;color: #666;font-size: 15px">内存</span>
              </div>
              <div class="el-table el-table--enable-row-hover el-table--medium">
              <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="is-leaf"><div class="cell">属性</div></th>
                  <th class="is-leaf"><div class="cell">内存</div></th>
                  <th class="is-leaf"><div class="cell">JVM</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div class="cell">总内存</div></td>
                  <td><div class="cell" v-if="data.memory">{{ data.memory.total }}</div></td>
                  <td><div class="cell" v-if="data.jvm">{{ data.jvm.total }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">已用内存</div></td>
                  <td><div class="cell" v-if="data.memory">{{ data.memory.used}}</div></td>
                  <td><div class="cell" v-if="data.jvm">{{ data.jvm.used}}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">剩余内存</div></td>
                  <td><div class="cell" v-if="data.memory">{{ data.memory.available }}</div></td>
                  <td><div class="cell" v-if="data.jvm">{{ data.jvm.free }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">使用率</div></td>
                  <td><div class="cell" v-if="data.memory" :class="{'text-danger': data.memory.usageRate > 80}">{{ data.memory.usageRate }}%</div></td>
                  <td><div class="cell" v-if="data.jvm" :class="{'text-danger': data.jvm.usageRate > 80}">{{ data.jvm.usageRate }}%</div></td>
                </tr>
              </tbody>
            </table>
          </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold;color: #666;font-size: 15px">服务器信息</span>
        </div>
        <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <tbody>
                <tr>
                  <td><div class="cell">服务器名称</div></td>
                  <td><div class="cell" v-if="data.system">{{ data.system.os }}</div></td>
                  <td><div class="cell">操作系统</div></td>
                  <td><div class="cell" v-if="data.system">{{ data.system.osName }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">服务器IP</div></td>
                  <td><div class="cell" v-if="data.system">{{ data.system.ip }}</div></td>
                  <td><div class="cell">系统架构</div></td>
                  <td><div class="cell" v-if="data.system">{{ data.system.osArch }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold;color: #666;font-size: 15px">Java虚拟机信息</span>
        </div>
        <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <tbody>
                <tr>
                  <td><div class="cell">Java名称</div></td>
                  <td><div class="cell" v-if="data.jvm">{{ data.jvm.name }}</div></td>
                  <td><div class="cell">Java版本</div></td>
                  <td><div class="cell" v-if="data.jvm">{{ data.jvm.version }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">启动时间</div></td>
                  <td><div class="cell" v-if="data.system">{{ data.system.startTime }}</div></td>
                  <td><div class="cell">运行时长</div></td>
                  <td><div class="cell" v-if="data.system">{{ data.system.runTime }}</div></td>
                </tr>
                <tr>
                  <td colspan="1"><div class="cell">安装路径</div></td>
                  <td colspan="3"><div class="cell" v-if="data.jvm">{{ data.jvm.home }}</div></td>
                </tr>
                <tr>
                  <td colspan="1"><div class="cell">项目路径</div></td>
                  <td colspan="3"><div class="cell" v-if="data.system">{{ data.system.dir }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/polar'
import { getServerData } from '@/api/monitor'
export default {
  name: 'ServerMonitor',
  components: {
    'v-chart': ECharts
  },
  data() {
    return {
      show: false,
      monitor: null,
      data: {},
      cpuInfo: {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          interval: 20
        },
        series: [{
          data: [],
          type: 'line',
          areaStyle: {
            normal: {
              color: 'rgb(32, 160, 255)' // 改变区域颜色
            }
          },
          itemStyle: {
            normal: {
              color: '#6fbae1',
              lineStyle: {
                color: '#6fbae1' // 改变折线颜色
              }
            }
          }
        }]
      },
      memoryInfo: {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          interval: 20
        },
        series: [{
          data: [],
          type: 'line',
          areaStyle: {
            normal: {
              color: 'rgb(32, 160, 255)' // 改变区域颜色
            }
          },
          itemStyle: {
            normal: {
              color: '#6fbae1',
              lineStyle: {
                color: '#6fbae1' // 改变折线颜色
              }
            }
          }
        }]
      }
    }
  },
  created() {
    this.init()
    this.monitor = window.setInterval(() => {
      setTimeout(() => {
        this.init()
      }, 2)
    }, 3500)
  },
  destroyed() {
    clearInterval(this.monitor)
  },
  methods: {
    init() {
      getServerData().then(response => {
        this.data = response.data
        this.show = true
        if (this.cpuInfo.xAxis.data.length >= 8) {
          this.cpuInfo.xAxis.data.shift()
          this.memoryInfo.xAxis.data.shift()
          this.cpuInfo.series[0].data.shift()
          this.memoryInfo.series[0].data.shift()
        }
        this.cpuInfo.xAxis.data.push(this.data.time)
        this.memoryInfo.xAxis.data.push(this.data.time)
        this.cpuInfo.series[0].data.push(parseFloat(this.data.cpu.used))
        this.memoryInfo.series[0].data.push(parseFloat(this.data.memory.usageRate))
      })
    }
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
  .cpu, .memory, .swap, .disk  {
    width: 20%;
    float: left;
    padding-bottom: 20px;
    margin-right: 5%;
  }
 .title {
   text-align: center;
   font-size: 15px;
   font-weight: 500;
   color: #999;
   margin-bottom: 16px;
 }
 .footer {
    text-align: center;
    font-size: 15px;
    font-weight: 500;
    color: #999;
    margin-top: -5px;
    margin-bottom: 10px;
  }
  .content {
    text-align: center;
    margin-top: 5px;
    margin-bottom: 5px;
  }
</style>
