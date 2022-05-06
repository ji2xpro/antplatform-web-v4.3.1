<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <el-input v-model="filterText" placeholder="Filter keyword/输入关键字进行过滤" style="margin-bottom:30px;"/>
      </el-header>

      <el-container>
        <el-aside width="300px" v-loading="treeloading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.1)">
          <el-tree 
            ref="tree2"
            class="filter-tree"
            :data="dataNodes" 
            node-key="id"
            default-expand-all
            :props="defaultProps"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            @node-click="selectNode" >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span><svg-icon :icon-class="data.icon" /> {{ node.label }}</span>
              <span>
                <el-button
                  v-show="data.id==0"
                  type="text"
                  size="mini"
                  @click="($event) => loadData(data,$event)">
                  <i class="el-icon-refresh" />
                </el-button>
                <el-button
                  type="text"
                  size="mini"
                  v-show="hasAuthority('sysmgr.resource.menu.save')"
                  @click="($event) => append(data,$event)">
                  <i class="el-icon-plus" />
                </el-button>
                <el-button
                  type="text"
                  size="mini"
                  v-if="data.id!=0 && hasAuthority('sysmgr.resource.menu.delete')"
                  @click="($event) => remove(node, data, $event)">
                  <i class="el-icon-close" />
                </el-button>
              </span>
            </span>
          </el-tree>
        </el-aside>

        <el-main>
          <transition name="el-fade-in">
            <el-form ref="menuForm" :rules="rules" :model="formData" v-show="modifyVisible" label-width="100px" size="small" style="width: 400px;">
              <el-form-item label="权限编码" prop="code">
                <el-cascader :options="options" :show-all-levels="false" :props="props_auth" style="width: 100%;" v-model="auth_path">
                </el-cascader>
              </el-form-item>
              <el-form-item label="菜单名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入..."></el-input>
              </el-form-item>
              <el-form-item label="菜单描述" prop="description">
                <el-input v-model="formData.description" placeholder="请输入..."></el-input>
              </el-form-item>

              <el-form-item label="图标" prop="icon">
                <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()" >
                  <IconSelect ref="iconSelect" @selected="selected" />
                  <el-input slot="reference" v-model="formData.icon" placeholder="点击选择图标" readonly>
                    <svg-icon v-if="formData.icon" slot="prefix" :icon-class="formData.icon" class="el-input__icon" style="height: 32px;width: 16px;" />
                    <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                  </el-input>
                </el-popover>
              </el-form-item>
              <!-- <el-form-item label="图标" prop="icon">
                <el-input v-model="formData.icon" placeholder="请输入..."></el-input>
              </el-form-item> -->
              <el-form-item label="菜单路径" prop="path">
                <el-input v-model="formData.path" placeholder="请输入..."></el-input>
              </el-form-item>
              <el-form-item label="页面路径" prop="url">
                <el-input v-model="formData.url" placeholder="请输入..."></el-input>
              </el-form-item>
              <el-form-item label="是否隐藏" prop="status">
                <el-switch v-model="formData.status" :active-value=1 :inactive-value=0></el-switch>
              </el-form-item>
              <el-form-item label="排序" prop="sort">
                <!-- <el-input v-model.number="formData.sort" placeholder="请输入..."></el-input> -->
                <el-input-number v-model="formData.sort" controls-position="right" :min="1" style="width: 100%;"></el-input-number>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitForm" size="small" v-show="hasAuthority('sysmgr.resource.menu.save')">保存</el-button>
                <el-button type="danger" v-show="nodeDeleteVisible && hasAuthority('sysmgr.resource.menu.delete')" @click="drop" size="small" >删除</el-button>
              </el-form-item>
            </el-form>
          </transition>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { getList,save,drop } from "@/api/system/menu";
import { getList as getAuthList} from "@/api/system/authority";
import { Message, MessageBox } from 'element-ui'
import IconSelect from "@/components/IconSelect";
export default {
  name:"sysmgrmenu",
  components: { IconSelect },
  data() {
    return {
      filterText: "",           //过滤条件
      dataNodes: [],            //tree-data
      defaultProps: {
        children: 'children',
        label: 'name'
      },

      treeloading:false,

      formData:{                //明细表单
        name:'',
        description:'',
        icon:'',
        path:null,
        parentId:null,
        pathId:null,
        url:null,
        status:null,
        sort:null
      },
      modifyVisible:false,      //表单是否显示
      nodeDeleteVisible:false,
      rules: {
        name: [{ required: true, message: '名称是必填项', trigger: 'blur' }]
      },

      options:[],
      props_auth: {             // 权限选择项配置
        value: 'id',
        label: 'name',
        children: 'children',
        // expandTrigger: 'hover'
      },
      auth_path: [],
      auth_find_flag:false,

      currentNodeData:null,     //缓存当前操作的节点
      currentNodeId:null,
      tempNodePrefix:"temp",    //新增节点临时id前缀
      tempNodeIndex:1           //新增节点临时id序号

    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val);
    },
    currentNodeId(){
      this.nodeDeleteVisible = !this.isTempNodeId(this.currentNodeId);
    }
  },
  methods: {
    // 选择图标
    selected(name) {
      this.formData.icon = name;
    },
    isTempNodeId(nodeId){
      //是否临时节点ID
      return (nodeId+"").indexOf(this.tempNodePrefix)>=0
    },
    newTempNodId(){
      //生成临时节点ID
      return this.tempNodePrefix + this.tempNodeIndex++;
    },
    loadAuth(){
      //加载权限列表
      getAuthList().then(res => {
        this.recursiveCheckChildren(res.data);
        this.options = res.data;
      });
    },
    // 递归查询combo列表中的子元素
    recursiveCheckChildren(arr) {
      // 循环遍历arr数据
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].children && arr[i].children.length > 0) {
          // children若不为空数组，则继续递归调用本方法
          this.recursiveCheckChildren(arr[i].children);
        } else {
          // children若为空数组，则将children设为null
          arr[i].children = null;
        }
      }
    },

    loadData() {
      //加载树节点
      this.treeloading = true;
      getList().then(res => {
        var node = {
          id:0,
          name:'所有菜单',
          icon:'tree',
          children:res.data
        }
        this.dataNodes = [node];
        this.treeloading = false;
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },

    append(data,event) {
      this.clear();

      const newChild = {
        'id': this.newTempNodId(),
        'name': '新增菜单',
        'parentId': data.id,
        'parentName':data.label,
        'children': [],
        'description':'',
        'icon':'',
        'path':'',
        'pathId':'',
        'url':'',
        'status':'',
        'sort':''
      };

      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
      this.modifyVisible=true;

      this.selectNode(newChild);
      event.stopPropagation();
    },
    remove(node, data,event) {
      this.drop(data);
      event.stopPropagation();
    },
    clear(){
      //清理未保存的node
      if(this.currentNodeData && this.isTempNodeId(this.currentNodeData.id)){
        this.$refs.tree2.remove(this.currentNodeData);
      }
    },
    selectNode(data){
      if(data.id){
        // if(this.currentNodeData && data.id==this.currentNodeData.id ){
        //   return;
        // }

        this.clear();

        this.currentNodeId=data.id;
        this.currentNodeData=data;

        this.auth_find_flag = false;
        this.auth_path = [];
        this.recursiveFindPath(data.authorityId, this.options);
        // this.auth_path.push(data.authorityId);

        this.modifyVisible=true;
        Object.assign(this.formData,{...data})

        // this.formData.id = data.id;
        // // this.formData.pathId = data.pathId;
        // this.parentName= data.parentName;
        // this.formData.name = data.name;
        // this.formData.description = data.description;
        // this.formData.icon = data.icon;
        // this.formData.sort = data.sort;
        // this.formData.url = data.url;
        // this.formData.path= data.path;
        // this.formData.parentId = data.parentId;
        // this.formData.authorityId= data.authorityId;
        // this.formData.status = data.status=='1'?true:false;

      }else{
        this.modifyVisible=false;
      }
    },

    // 递归查找当前选择的菜单的权限节点id路径
    recursiveFindPath(authid, auths) {
      for (var i = 0; i < auths.length; i++) {
        if (auths[i].id === authid) {
          this.auth_path.push(auths[i].id)
          return true;
        } else if (auths[i].children) {
          let isPath=this.recursiveFindPath(authid, auths[i].children);
          if(isPath){
             this.auth_path.splice(0,0,auths[i].id);
             return true;
          }
        }
      }
    },
    submitForm() {
      this.$refs["menuForm"].validate((valid) => {
        if (valid) {
          let param = this.formData;
          //新增节点，则清除临时ID
          if(this.isTempNodeId(param.id)){
            param.id= null
          }
          param.authorityId = this.auth_path[this.auth_path.length - 1];
          // param.status=param.status?"1":"0";
			    save(param).then((res) => {
            this.modifyVisible = false
            Message({
              message: '保存成功',
              type: 'success',
              duration: 5 * 1000
            })
            this.loadData()
			  	});
        } else {
          return false;
        }
      });
    },
    drop(node){
      this.$confirm('您确定要删除该数据吗?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
          let id= node.id || this.currentNodeData.id
          if(this.isTempNodeId(id)){
            //tree中移除
            this.$refs.tree2.remove(this.currentNodeData);
          }else{
            if(this.currentNodeData){
              node = this.currentNodeData
            }
            drop(id).then((res) => {
              if (res.code == 20000) {
                this.$refs.tree2.remove(node);
              }
            });
          }
          if(this.currentNodeData && this.currentNodeData.id==id){
              this.currentNodeData={};
              this.currentNodeId=null;
              this.modifyVisible=false;
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
				});
    }
  },
  mounted() {
    this.loadAuth();
    this.loadData();
  }
};
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
