<template>
  <el-form ref="loginForm" :model="loginForm" :rules="loginRules" autocomplete="on" label-position="left">

    <!-- <div class="title-container">
      <h3 class="title">
        {{ $t('login.title') }}
      </h3>
      <lang-select class="set-language" />

      <component :is="component" />
    </div> -->

    <el-form-item prop="username">
      <span class="svg-container">
        <svg-icon icon-class="user" />
      </span>
      <el-input
        ref="username"
        v-model="loginForm.username"
        :placeholder="$t('login.username')"
        name="username"
        type="text"
        tabindex="1"
        autocomplete="on"
      />
    </el-form-item>

    <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          :placeholder="$t('login.password')"
          name="password"
          tabindex="2"
          autocomplete="on"
          @keyup.native="checkCapslock"
          @blur="capsTooltip = false"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
    </el-tooltip>

    <el-row :gutter="10">
      <el-col :span="15">
        <el-form-item prop="vcode">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            ref="vcode"
            v-model="loginForm.vcode"
            :placeholder="$t('login.vcode')"
            name="vcode"
            type="text"
            tabindex="3"
            auto-complete="on"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
      </el-col>
      <el-col :span="9">
        <img :src="vcodeImg" class="v-code-img" @click="changeImgCode">
      </el-col>
    </el-row>

    <el-button :loading="loading" type="primary" style="width:100%;" @click.native.prevent="handleLogin">
      {{ loading ? '登录中...' : $t('login.logIn') }}
    </el-button>

    <div class="flex" style="margin-top: 10px;margin-bottom: 10px">
      <p class="other-ways">
        其他方式登录
        <svg-icon v-for="i in otherWays" :key="i" :icon-class="i" @click="thirdPartyLogin(i)" />
      </p>

      <el-button type="text" @click="register">注册账户</el-button>
    </div>

    <div style="position:relative">
      <el-input v-show="false" v-model="loginForm.verkey" name="verkey" type="hidden" />
      <!-- <el-button class="thirdparty-button" type="primary" @click="showDialog=true">
          {{ $t('login.thirdparty') }}
        </el-button> -->
    </div>
  </el-form>
<!--
  <el-dialog :title="$t('login.thirdparty')" :visible.sync="showDialog">
    {{ $t('login.thirdpartyTips') }}
    <br>
    <br>
    <br>
    <social-sign />
  </el-dialog> -->
</template>

<script>
import { validUsername, validPassword, validVCode } from '@/utils/validate'

export default {
  name: 'LoginForm',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error(this.$t('login.usernameError')))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      // if (value.length < 6) {
      if (!validPassword(value)) {
        callback(new Error(this.$t('login.passwordError')))
      } else {
        callback()
      }
    }
    const validateVCode = (rule, value, callback) => {
      if (!validVCode(value)) {
        callback(new Error(this.$t('login.vcodeError')))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: 'admin',
        password: '123456',
        vcode: '',
        verkey: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'change', validator: validateUsername }],
        password: [{ required: true, trigger: 'change', validator: validatePassword }],
        vcode: [{ required: true, trigger: 'change', validator: validateVCode }]
      },
      vcodeImg: this.imgCode(),
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      otherWays: ['qq']
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    gRandom() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    },
    guid() {
      this.verkey = (this.gRandom() + this.gRandom() + '-' + this.gRandom() + '-' + this.gRandom() + '-' + this.gRandom() + '-' + this.gRandom() + this.gRandom() + this.gRandom())
      return this.verkey
    },
    imgCode() {
      return process.env.VUE_APP_BASE_API + '/vcode?codeKey=' + this.guid() + '&n=' + Math.random()
    },
    changeImgCode() {
      this.vcodeImg = this.imgCode()
    },
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.loginForm.verkey = this.verkey
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    thirdPartyLogin(channel) {
      this.$message.info('假装可以第三方登录')
    },
    register() {
      !this.loading && this.$router.push('/register')
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>
