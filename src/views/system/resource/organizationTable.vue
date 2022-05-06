<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model.trim="treeQuery.name" :placeholder="$t('organizationTable.name')" clearable style="width: 150px;" class="filter-item" maxlength="32" />
      <el-input v-model.trim="treeQuery.keypoint" :placeholder="$t('organizationTable.keypoint')" clearable style="width: 150px;" class="filter-item" maxlength="11" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="searchTreeData()">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate(false)">{{ $t('table.add') }}</el-button>
    </div>

    <el-table :data="list" row-key="id" border style="width: 100%;">
      <el-table-column :label="$t('organizationTable.name')" width="200px">
        <template slot-scope="scope">
          <span :id="scope.row.id">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('organizationTable.keypoint')" width="100px">
        <template slot-scope="scope">
          <span :id="scope.row.keypoint">{{ scope.row.keypoint }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('organizationTable.type')">
        <template slot-scope="scope">
          <span>{{ scope.row.type | typeNameFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('organizationTable.icon')">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
          <span>{{ scope.row.icon }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('organizationTable.level')">
        <template slot-scope="scope">
          <span>{{ scope.row.level }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" width="110px">
        <template slot-scope="scope">
          <span>{{ scope.row.areas }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" width="300" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleCreate(scope.row)">{{ $t('table.add') }}</el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="organizationForm" :model="organizationForm" :rules="rules" label-width="100px" class="organizationForm" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('organizationTable.name')" prop="name">
          <el-input v-model="organizationForm.name" placeholder="输入组织名称" maxlength="32" :clearable="true" />
        </el-form-item>
        <el-form-item :label="$t('organizationTable.keypoint')" prop="organizationKey">
          <el-input v-model.trim="organizationForm.keypoint" placeholder="输入组织标识" maxlength="32" />
        </el-form-item>
        <el-form-item :label="$t('organizationTable.type')" prop="organizationType">
          <el-select v-model="organizationForm.type" style="width: 100%" class="filter-item">
            <el-option v-for="item in typesOption" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('organizationTable.icon')" prop="icon">
                <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()" >
                  <IconSelect ref="iconSelect" @selected="selected" />
                  <el-input slot="reference" v-model="organizationForm.icon" placeholder="点击选择图标" readonly>
                    <svg-icon v-if="organizationForm.icon" slot="prefix" :icon-class="organizationForm.icon" class="el-input__icon" style="height: 32px;width: 16px;" />
                    <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                  </el-input>
                </el-popover>
              </el-form-item>
        <!-- <el-form-item :label="$t('organizationTable.icon')" prop="organizationIcon">
          <el-input v-model.trim="organizationForm.icon" placeholder="输入组织图标" maxlength="11" />
        </el-form-item> -->
        <el-form-item :label="$t('organizationTable.level')" prop="organizationLevel">
          <el-input v-model.number="organizationForm.level" placeholder="输入组织排序" maxlength="32" />
        </el-form-item>
        <el-form-item :label="$t('organizationTable.area')" prop="province">
          <el-cascader v-model="organizationForm.areas" :options="provinceOptions" :props="props" clearable filterable change-on-select style="width:100%;" />
        </el-form-item>
        <el-form-item :label="$t('organizationTable.street')" prop="street">
          <el-input v-model="organizationForm.street" placeholder="详细地址" maxlength="120" />
        </el-form-item>
        <el-form-item :label="$t('organizationTable.description')">
          <el-input v-model.trim="organizationForm.description" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**
  Auth: Lei.j1ang
  Created: 2018/1/19-14:54
*/
import { fetchOrgList, createOrganization, deleteOrganization, updateOrganization, checkOrganizationName, checkOrganizationKey } from '@/api/system/organization'
import waves from '@/directive/waves' // 水波纹指令
import Data from '@/api/pcaa';
import IconSelect from "@/components/IconSelect";

export default {
  name: 'OrganizationTable',  
  directives: {
    waves
  },
  components: { IconSelect },
  filters: {
    typeNameFilter(type) {
      const typeNameMap = {
        0: '总公司',
        1: '分公司',
        2: '事业部',
        3: '业务部'
      }
      return typeNameMap[type]
    }
  },
  data() {
    var validOrganizationName = (rule, value, callback) => {
      console.log('222====222' + value)
      var keyData = {
        id: this.organizationForm.id,
        organizationName: value
      }
      checkOrganizationName(keyData).then(response => {
        if (!response.data) {
          callback(new Error('组织名称已存在'))
        } else {
          callback()
        }
      })
    }
    var validOrganizationKey = (rule, value, callback) => {
      var keyData = {
        id: this.organizationForm.id,
        organizationKey: value
      }
      checkOrganizationKey(keyData).then(response => {
        if (!response.data) {
          callback(new Error('组织标识已存在'))
        } else {
          callback()
        }
      })
    }
    return {
      expandAll: false,
      provinceOptions: null,
      props: {
        children: 'children'
      },
      list: [],
      baseList: [],
      rootFlag: false,
      expandTitle: 'organizationTable.name',
      expandName: 'organizationName',
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      typesOption: [
        { label: '总公司', key: 0 },
        { label: '分公司', key: 1 },
        { label: '事业部', key: 2 },
        { label: '业务部', key: 3 }
      ],
      dialogPvVisible: false,
      treeQuery: {
        parentId: 0,
        name: '',
        keypoint: '',
        pageNo: 1,
        pageSize: 10
      },
      organizationForm: {
        id: '',
        parentId: 0,
        name: '',
        keypoint: '',
        type: '1',
        icon: '',
        level: '',
        areas: [],
        street: '',
        children: [], // 必须加，否则新增的节点不显示
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入组织名称', trigger: 'blur' },
          { min: 2, max: 32, message: '长度在 2 到 32 个字符', trigger: 'blur' },
          { validator: validOrganizationName, trigger: 'blur' }
        ],
        keypoint: [
          { required: true, message: '请输入组织标识', trigger: 'blur' },
          { min: 2, max: 32, message: '长度在 2 到 32 个字符', trigger: 'blur' },
          { validator: validOrganizationKey, trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择组织类型', trigger: 'blur' }
        ],
        icon: [
          { required: true, message: '请输入组织图标', trigger: 'blur' },
          { min: 2, max: 32, message: '长度在 2 到 32 个字符', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请输入组织排序', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请填写备注信息', trigger: 'blur' }
        ]
      },
      args: [null, null, null]
    }
  },
  created() {
    this.getList()
    this.getAreaList()
  },
  methods: {
    // 选择图标
    selected(name) {
      this.organizationForm.icon = name;
    },
    getList() {
      this.listLoading = true
      fetchOrgList(this.treeQuery).then(response => {
        this.list = response.data
        this.baseList = JSON.parse(JSON.stringify(response.data)) // 数组深复制
        this.listLoading = false
      })
    },
    getAreaList() {
      var options = []
      for (var key in Data['86']) {
        var citys = []
        for (var keyc in Data[key]) {
          var areas = []
          for (var keya in Data[keyc]) {
            var area = { value: keya, label: Data[keyc][keya] }
            areas.push(area)
          }
          var city = { value: keyc, label: Data[key][keyc], children: areas }
          citys.push(city)
        }
        var province = { value: key, label: Data['86'][key], children: citys }
        options.push(province)
      }
    
      this.provinceOptions = options
    },
    resetOrganizationForm() {
      this.organizationForm = {
        id: '',
        parentId: 0,
        name: '',
        keypoint: '',
        type: 0,
        icon: '',
        level: '',
        areas: [],
        street: '',
        children: [], // 必须加，否则新增的节点不显示
        description: ''
      }
    },
    handleCreate(row) {
      console.log('row:' + row)
      this.resetOrganizationForm()
      if (row) {
        this.rootFlag = false
        this.organizationForm.parentId = row.id
      } else {
        this.rootFlag = true
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['organizationForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['organizationForm'].validate(valid => {
        if (valid) {
          createOrganization(this.organizationForm).then(response => {
            this.dialogFormVisible = false
            this.organizationForm.id = response.data.id
            if (this.rootFlag) {
              this.organizationForm['children'] = []
              this.list.push(this.organizationForm)
              this.baseList.push(
                JSON.parse(JSON.stringify(this.organizationForm))
              )
            } else {
              this.createDataCallBack(this.list)
              this.createDataCallBack(this.baseList)
            }
            this.$message({
              message: '创建成功',
              type: 'success'
            })
          })
        }
      })
    },
    createDataCallBack(dataList) {
      for (const v of dataList) {
        if (v.id === this.organizationForm.parentId) {
          if (!v.children) {
            v['children'] = []
          }
          this.organizationForm['children'] = []
          v.children.push(JSON.parse(JSON.stringify(this.organizationForm)))
          break
        }
        if (v.children && v.children.length > 0) {
          this.createDataCallBack(v.children)
        }
      }
    },
    handleUpdate(row) {
      this.organizationForm = Object.assign({}, row) // copy obj
      if (!this.organizationForm.areas || this.organizationForm.areas.length === 0) {
        this.organizationForm.areas = [
          this.organizationForm.province,
          this.organizationForm.city,
          this.organizationForm.area
        ]
      }
      // JSON不接受循环对象——引用它们自己的对象
      delete this.organizationForm.parent
      delete this.organizationForm.children
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['organizationForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['organizationForm'].validate(valid => {
        if (valid) {
          updateOrganization(this.organizationForm).then(() => {
            this.dialogFormVisible = false
            this.$message({
              message: '更新成功',
              type: 'success'
            })
            this.updateDataCallBack(this.list)
            this.updateDataCallBack(this.baseList)
          })
        }
      })
    },
    updateDataCallBack(dataList) {
      for (const v of dataList) {
        if (v.id === this.organizationForm.id) {
          Object.assign(v, JSON.parse(JSON.stringify(this.organizationForm)))
          break
        }
        if (v.children && v.children.length > 0) {
          this.updateDataCallBack(v.children)
        }
      }
    },
    handleDelete(row) {
      this.$confirm(
        '此操作将永久删除该组织：' + row.organizationName + ', 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.listLoading = true
          deleteOrganization(row.id).then(() => {
            this.listLoading = false
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.deleteDataCallBack(row.id, this.list)
            this.deleteDataCallBack(row.id, this.baseList)
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    deleteDataCallBack(id, dataList) {
      for (const v of dataList) {
        if (v.id === id) {
          const index = dataList.indexOf(v)
          dataList.splice(index, 1)
          break
        }
        if (v.children && v.children.length > 0) {
          this.deleteDataCallBack(id, v.children)
        }
      }
    },
    searchTreeData() {
      this.list = JSON.parse(JSON.stringify(this.baseList))
      if (!(this.treeQuery.name === '' && this.treeQuery.keypoint === '')) {
        this.queryData(this.list)
      }
      this.expandAll = true
    },
    queryData(dataList) {
      var haveFlag = false
      var len = dataList.length - 1
      if (len < 0) {
        return haveFlag
      }
      var haveFlagArray = new Array(dataList.length)
      for (let i = len; i >= 0; i--) {
        var isname = this.treeQuery.name !== ''
        var hasname = dataList[i].name.indexOf(this.treeQuery.name) >= 0
        var iskey = this.treeQuery.keypoint !== ''
        var haskey = dataList[i].keypoint.indexOf(this.treeQuery.keypoint) >= 0

        if (isname && !iskey) {
          if (hasname) {
            haveFlagArray[i] = true
          } else if (!(dataList[i].children && dataList[i].children.length > 0)) {
            var index1 = dataList.indexOf(dataList[i])
            dataList.splice(index1, 1)
            continue
          } else {
            haveFlagArray[i] = false
          }
        } else if (!isname && iskey) {
          if (haskey) {
            haveFlagArray[i] = true
          } else if (!(dataList[i].children && dataList[i].children.length > 0)) {
            var index2 = dataList.indexOf(dataList[i])
            dataList.splice(index2, 1)
            continue
          } else {
            haveFlagArray[i] = false
          }
        } else if (isname && iskey) {
          if (hasname && haskey) {
            haveFlagArray[i] = true
          } else if (!(dataList[i].children && dataList[i].children.length > 0)) {
            var index3 = dataList.indexOf(dataList[i])
            dataList.splice(index3, 1)
            continue
          } else {
            haveFlagArray[i] = false
          }
        }

        if (dataList[i] && dataList[i].children && dataList[i].children.length > 0) {
          var childHaveFlag = this.queryData(dataList[i].children)
          if (!childHaveFlag && !haveFlagArray[i]) {
            var index4 = dataList.indexOf(dataList[i])
            dataList.splice(index4, 1)
          }
          if (childHaveFlag) {
            haveFlagArray[i] = true
          }
        }
      }

      if (haveFlagArray.indexOf(true) >= 0) {
        haveFlag = true
      }
      return haveFlag
    }
  }
}
</script>
