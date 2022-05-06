<template>
  <el-form ref="registerForm" :model="registerForm" :rules="registerRules" autocomplete="on" label-position="left">
    <el-form-item prop="username">
      <span class="svg-container">
        <svg-icon icon-class="user" />
      </span>
      <el-input
        ref="username"
        v-model="registerForm.username"
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
          v-model="registerForm.password"
          :type="passwordType"
          :placeholder="$t('login.password')"
          name="password"
          tabindex="2"
          autocomplete="on"
          @keyup.native="checkCapslock"
          @blur="capsTooltip = false"
          @keyup.enter.native="handleRegister"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
    </el-tooltip>

    <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
      <el-form-item prop="repassword">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="repassword"
          v-model="registerForm.repassword"
          :type="passwordType"
          :placeholder="$t('login.repassword')"
          name="repassword"
          tabindex="2"
          autocomplete="on"
          @keyup.native="checkCapslock"
          @blur="capsTooltip = false"
          @keyup.enter.native="handleRegister"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
    </el-tooltip>

    <el-button :loading="loading" type="primary" style="width:100%;" @click.native.prevent="handleRegister">
      {{ loading ? '注 册 中...' : $t('login.register') }}
    </el-button>

    <div class="flex" style="margin-top: 10px;margin-bottom: 10px;height: 44px">
      <p />
      <el-button type="text" @click="login">已有账户登陆</el-button>
    </div>
  </el-form>
</template>

<script>
// import md5 from 'js-md5'
import { register, checkName } from '@/api/user'
// import { elSuccess } from '@/utils/message'

export default {
  name: 'RegisterForm',

  data() {
    const validateName = (rule, value, callback) => {
      checkName(this.registerForm.username)
        .then(({ msg }) => msg ? callback(msg) : callback())
        .catch(e => callback(e))
    }
    const validateRePassword = (rule, value, callback) => {
      return value !== this.registerForm.password ? callback('两次密码输入不一致') : callback()
    }
    return {
      registerForm: {
        username: '',
        password: '',
        repassword: ''
      },
      registerRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'change' },
          { validator: validateName, trigger: 'change' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'change' },
          { min: 6, max: 32, message: '请输入6-32位的密码', trigger: 'change' }
        ],
        repassword: [
          { required: true, message: '请确认密码', trigger: 'change' },
          { validator: validateRePassword, trigger: 'change' }
        ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false
    }
  },
  mounted() {
    if (this.registerForm.username === '') {
      this.$refs.username.focus()
    } else if (this.registerForm.password === '') {
      this.$refs.password.focus()
    } else if (this.registerForm.repassword === '') {
      this.$refs.repassword.focus()
    }
  },
  methods: {
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
    handleRegister() {
      if (this.loading) return
      this.$refs.registerForm.validate(valid => {
        if (!valid) return
        this.loading = true
        register({ username: this.form.username, password: this.form.pwd })
          .then(() => {
            // elSuccess('注册成功')
            this.$router.push('/login')
            this.loading = false
          })
          // eslint-disable-next-line no-return-assign
          .catch(() => {
            this.loading = false
          })
      })
    },
    login() {
      !this.loading && this.$router.push('/login')
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
    }
  }
}
</script>
