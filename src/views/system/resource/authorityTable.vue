<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <el-input v-model="filterText" placeholder="Filter keyword" style="margin-bottom:30px;" />
      </el-header>

      <el-container>
        <el-aside v-loading="treeloading" width="300px" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.1)">
          <el-tree
            ref="tree2"
            class="filter-tree"
            :data="dataNodes"
            node-key="id"
            :default-expanded-keys="[0,1,2,3]"
            :props="defaultProps"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            @node-click="selectNode"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span>
                <el-button
                  v-show="data.id==0"
                  type="text"
                  size="mini"
                  @click="($event) => loadData(data,$event)"
                >
                  <i class="el-icon-refresh" />
                </el-button>
                <el-button
                  v-show="hasAuthority('sysmgr.resource.authority.save')"
                  type="text"
                  size="mini"
                  @click="($event) => append(data,$event)"
                >
                  <i class="el-icon-plus" />
                </el-button>
                <el-button
                  v-if="data.id!=0 && hasAuthority('sysmgr.resource.authority.delete')"
                  type="text"
                  size="mini"
                  @click="($event) => remove(node, data,$event)"
                >
                  <i class="el-icon-close" />
                </el-button>
              </span>
            </span>
          </el-tree>
        </el-aside>

        <el-main>
          <transition name="el-fade-in">
            <el-form v-show="modifyVisible" ref="authorityForm" :rules="rules" :model="formData" label-width="100px" size="small" style="width: 400px;">
              <el-form-item label="权限编码" prop="code">
                <el-input v-model="formData.code" placeholder="请输入..." />
              </el-form-item>
              <el-form-item label="权限名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入..." />
              </el-form-item>
              <el-form-item label="排序" prop="sort">
                <el-input-number v-model="formData.sort" controls-position="right" :min="1" style="width: 100%;" />
                <!-- <el-input v-model.number="formData.sort" placeholder="请输入..."></el-input> -->
              </el-form-item>
              <el-form-item label="描述" prop="description">
                <el-input v-model="formData.description" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入..." />
              </el-form-item>
              <el-form-item label="类型" prop="type">
                <el-radio-group v-model="formData.type">
                  <el-radio :label="0">目录</el-radio>
                  <el-radio :label="1">菜单</el-radio>
                  <el-radio :label="2">按钮</el-radio>
                  <el-radio :label="3">链接</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="是否隐藏" prop="status">
                <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item>
                <el-button v-show="hasAuthority('sysmgr.resource.authority.save')" type="primary" size="small" @click="submitForm">保存</el-button>
                <el-button v-show="nodeDeleteVisible && hasAuthority('sysmgr.resource.authority.delete')" type="danger" size="small" @click="drop">删除</el-button>
              </el-form-item>
            </el-form>
          </transition>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { getList, save, drop } from '@/api/system/authority'
import { Message, MessageBox } from 'element-ui'
export default {
  name: 'Sysmgrauthority',
  data() {
    return {
      filterText: '', // 过滤条件
      dataNodes: [], // tree-data
      defaultProps: {
        children: 'children',
        label: 'name'
      },

      treeloading: false,
      formData: { // 明细表单
        code: null,
        name: null,
        pid: null,
        path: null,
        sort: null,
        description: null,
        type: ''
      },
      modifyVisible: false, // 表单是否显示
      nodeDeleteVisible: false,
      rules: {
        name: [{ required: true, message: '名称是必填项', trigger: 'blur' }]
      },

      currentNodeData: null, // 缓存当前操作的节点
      currentNodeId: null,
      tempNodePrefix: 'temp', // 新增节点临时id前缀
      tempNodeIndex: 1 // 新增节点临时id序号

    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    },
    currentNodeId() {
      this.nodeDeleteVisible = !this.isTempNodeId(this.currentNodeId)
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    isTempNodeId(nodeId) {
      // 是否临时节点ID
      return (nodeId + '').indexOf(this.tempNodePrefix) >= 0
    },
    newTempNodId() {
      // 生成临时节点ID
      return this.tempNodePrefix + this.tempNodeIndex++
    },

    loadData() {
      this.treeloading = true
      getList().then(res => {
        var node = {
          id: 0,
          name: '所有权限',
          children: res.data
        }
        this.dataNodes = [node]
        this.treeloading = false
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },

    append(data, event) {
      this.clear()

      const newChild = {
        'id': this.newTempNodId(),
        'name': '新增权限',
        'parentId': data.id,
        'parentName': data.label,
        'children': [],
        'code': '',
        'type': '',
        'description': '',
        'path': '',
        'pathId': '',
        'status': '',
        'sort': ''
      }

      if (!data.children) {
        this.$set(data, 'children', [])
      }
      data.children.push(newChild)
      this.modifyVisible = true

      this.selectNode(newChild)
      event.stopPropagation()
    },
    remove(node, data, event) {
      this.drop(data)
      event.stopPropagation()
    },
    clear() {
      // 清理未保存的node
      if (this.currentNodeData && this.isTempNodeId(this.currentNodeData.id)) {
        this.$refs.tree2.remove(this.currentNodeData)
      }
    },
    selectNode(data) {
      if (data.id) {
        // if(this.currentNodeData && data.id==this.currentNodeData.id ){
        //   return;
        // }

        this.clear()

        this.currentNodeId = data.id
        this.currentNodeData = data

        this.modifyVisible = true

        Object.assign(this.formData, { ...data })

        // this.formData.id = data.id;
        // this.parentName= data.parentName;
        // this.formData.name = data.label;
        // this.formData.code = data.code;
        // this.formData.pid = data.parentId;
        // this.formData.fullId=data.fullId;
        // this.formData.showOrder = data.showOrder;
        // this.formData.authorityDesc = data.authorityDesc;
      } else {
        this.modifyVisible = false
      }
    },
    modify() {

    },
    submitForm() {
      this.$refs['authorityForm'].validate((valid) => {
        if (valid) {
          const param = this.formData
          // 新增节点，则清除临时ID
          if (this.isTempNodeId(param.id)) {
            param.id = null
          }
			    save(param).then((res) => {
            this.modifyVisible = false
            Message({
              message: '保存成功',
              type: 'success',
              duration: 5 * 1000
            })
            this.loadData()
			  	})
        } else {
          return false
        }
      })
    },
    drop(node) {
      this.$confirm('您确定要删除该数据吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const id = node.id || this.currentNodeData.id
        if (this.isTempNodeId(id)) {
          // tree中移除
          this.$refs.tree2.remove(this.currentNodeData)
        } else {
          if (this.currentNodeData) {
            node = this.currentNodeData
          }
          drop(id).then((res) => {
            if (res.code == 20000) {
              this.$refs.tree2.remove(node)
            }
          })
        }
        if (this.currentNodeData && this.currentNodeData.id == id) {
          this.currentNodeData = {}
          this.currentNodeId = null
          this.modifyVisible = false
        }
        // let id= node.id || this.currentNodeData.id
        // let params={};
        // if(id){
        //   params.id= id;
        //   drop(params).then((res) => {
        //     //tree中移除
        //     if(node.id){
        //       this.$refs.tree2.remove(node);
        //     }else{
        //       this.$refs.tree2.remove(this.currentNodeData);
        //     }

        //     if(this.currentNodeData.id==id){
        //       this.currentNodeData={};
        //       this.currentNodeId=null;

        //       this.modifyVisible=false;
        //     }
        //   });
        // }
      })
    }
  }
}
</script>

<style>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    padding-right: 8px;

  }

  .custom-tree-node .el-button{
    color:#606266;
    display:none;
  }
  .el-tree-node__content:hover .el-button {
    display:inline-block;
  }
</style>
