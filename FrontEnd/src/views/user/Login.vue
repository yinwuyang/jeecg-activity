<template>
  <div class="main">
    <div class="loginImg">
      Web项目管理系统
      <!-- <img src="../../assets/denglubiaoti.png" /> -->
    </div>
    <div class="loginTitle">用户登录</div>
    <a-form :form="form" autocomplete="off" class="user-layout-login" ref="formLogin" id="formLogin">
      <a-input type="password" name="a" hidden autocomplete="new-password"> </a-input>
      <a-form-item>
        <a-input
          class="loginInpout"
          size="large"
          v-decorator="['username', validatorRules.username]"
          type="text"
          placeholder="请输入账号"
        >
          <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }" />
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input
          class="loginInpout"
          v-decorator="['password', validatorRules.password]"
          size="large"
          placeholder="请输入密码"
          type="password"
          name="password"
          id="password"
          autocomplete="off"
        >
          <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
        </a-input>
      </a-form-item>
      <!-- 
      <a-row :gutter="0">
        <a-col :span="16">
          <a-form-item>
            <a-input
              v-decorator="['inputCode', validatorRules.inputCode]"
              size="large"
              type="text"
              @change="inputCodeChange"
              placeholder="请输入验证码"
            >
              <a-icon slot="prefix" type="smile" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <img v-if="requestCodeSuccess" style="margin-top: 2px;" :src="randCodeImage" @click="handleChangeCheckCode" />
          <img v-else style="margin-top: 2px;" src="../../assets/checkcode.png" @click="handleChangeCheckCode" />
        </a-col>
      </a-row> -->

      <a-form-item class="inputCheckboxItem">
        <input type="checkbox" id="input-checkbox" checked />
        <label class="checkbox-label">记住密码</label>
      </a-form-item>

      <a-form-item style="margin-top: 10px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="loginBtn"
          @click.stop.prevent="handleSubmit"
          :disabled="loginBtn"
          >登录
        </a-button>
      </a-form-item>
    </a-form>

    <two-step-captcha
      v-if="requiredTwoStepCaptcha"
      :visible="stepCaptchaVisible"
      @success="stepCaptchaSuccess"
      @cancel="stepCaptchaCancel"
    ></two-step-captcha>

    <a-modal title="登录部门选择" :width="450" :visible="departVisible" :closable="false" :maskClosable="false">
      <template slot="footer">
        <a-button type="primary" @click="departOk">确认</a-button>
      </template>

      <!-- <a-form>
        <a-form-item
          :labelCol="{ span: 4 }"
          :wrapperCol="{ span: 20 }"
          style="margin-bottom: 10px"
          :validate-status="validate_status"
        >
          <a-tooltip placement="topLeft">
            <template slot="title">
              <span>您隶属于多部门，请选择登录部门</span>
            </template>
            <a-avatar style="backgroundcolor: #87d068" icon="gold" />
          </a-tooltip>
          <a-select
            @change="departChange"
            :class="{ 'valid-error': validate_status == 'error' }"
            placeholder="请选择登录部门"
            style="margin-left: 10px; width: 80%"
          >
            <a-icon slot="suffixIcon" type="gold" />
            <a-select-option v-for="d in departList" :key="d.id" :value="d.orgCode">
              {{ d.departName }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form> -->
    </a-modal>
  </div>
</template>

<script>
//import md5 from "md5"
import api from '@/api'
import TwoStepCaptcha from '@/components/tools/TwoStepCaptcha'
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'
import Vue from 'vue'
import { ACCESS_TOKEN, ENCRYPTED_STRING } from '@/store/mutation-types'
import { putAction, postAction, getAction } from '@/api/manage'
import { encryption, getEncryptedString } from '@/utils/encryption/aesEncrypt'
import store from '@/store/'
import { USER_INFO } from '@/store/mutation-types'
import pick from 'lodash.pick'

export default {
  components: {
    TwoStepCaptcha,
  },
  data() {
    return {
      initialUsername: null,
      initialPassword: null,
      customActiveKey: 'tab1',
      loginBtn: false,
      // login type: 0 email, 1 username, 2 telephone
      loginType: 0,
      requiredTwoStepCaptcha: false,
      stepCaptchaVisible: false,
      form: this.$form.createForm(this),
      encryptedString: {
        key: '',
        iv: '',
      },
      state: {
        time: 60,
        smsSendBtn: false,
      },
      validatorRules: {
        username: { rules: [{ required: true, message: '请输入账号!' }, { validator: this.handleUsernameOrEmail }] },
        password: { rules: [{ required: true, message: '请输入密码!', validator: 'click' }] },
        mobile: { rules: [{ validator: this.validateMobile }] },
        captcha: { rule: [{ required: true, message: '请输入验证码!' }] },
        inputCode: { rules: [{ required: false, message: '请输入验证码!' }] },
      },
      verifiedCode: '',
      inputCodeContent: '',
      inputCodeNull: true,

      departList: [],
      departVisible: false,
      departSelected: '',
      currentUsername: '',
      validate_status: '',
      currdatetime: '',
      randCodeImage: '',
      requestCodeSuccess: false,
    }
  },
  created() {
    this.currdatetime = new Date().getTime()
    Vue.ls.remove(ACCESS_TOKEN)
    this.getRouterData()
    this.handleChangeCheckCode()

    // update-begin- --- author:scott ------ date:20190805 ---- for:密码加密逻辑暂时注释掉，有点问题
    //this.getEncrypte();
    // update-end- --- author:scott ------ date:20190805 ---- for:密码加密逻辑暂时注释掉，有点问题
  },
  methods: {
    ...mapActions(['Login', 'Logout', 'PhoneLogin', 'ThirdLogin']),
    //第三方登录
    onThirdLogin(source) {
      let url = window._CONFIG['domianURL'] + `/thirdLogin/render/${source}`
      window.open(
        url,
        `login ${source}`,
        'height=500, width=500, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=n o, status=no'
      )
      let that = this
      let receiveMessage = function (event) {
        var origin = event.origin
        console.log('origin', origin)

        let token = event.data
        console.log('event.data', token)
        that.ThirdLogin(token).then((res) => {
          if (res.success) {
            that.loginSuccess()
          } else {
            that.requestFailed(res)
          }
        })
      }
      window.addEventListener('message', receiveMessage, false)
    },
    // handler
    handleUsernameOrEmail(rule, value, callback) {
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        this.loginType = 0
      } else {
        this.loginType = 1
      }
      callback()
    },
    handleTabClick(key) {
      this.customActiveKey = key
      // this.form.resetFields()
    },
    handleSubmit() {
      let that = this
      let loginParams = {}
      that.loginBtn = true
      // 使用账户密码登陆

      that.form.validateFields(['username', 'password', 'inputCode'], { force: true }, (err, values) => {
        if (!err) {
          loginParams.username = values.username
          // update-begin- --- author:scott ------ date:20190805 ---- for:密码加密逻辑暂时注释掉，有点问题
          //loginParams.password = md5(values.password)
          //loginParams.password = encryption(values.password,that.encryptedString.key,that.encryptedString.iv)
          loginParams.password = values.password

          // update-begin- --- author:scott ------ date:20190805 ---- for:密码加密逻辑暂时注释掉，有点问题
          loginParams.captcha = that.inputCodeContent
          loginParams.checkKey = that.currdatetime
          var isRem = document.getElementById('input-checkbox').checked
          //记住密码
          if (isRem) {
            this.setCookie('username', values.username, 7) //保存帐号到cookie，有效期7天
            this.setCookie('password', values.password, 7) //保存密码到cookie，有效期7天
          } else {
            this.delCookie('username')
            this.delCookie('password')
          }
          console.log('登录参数', loginParams)
          that
            .Login(loginParams)
            .then((res) => {
              this.departConfirm(res)
            })
            .catch((err) => {
              that.requestFailed(err)
            })
        } else {
          that.loginBtn = false
        }
      })

      // if (that.customActiveKey === 'tab1') {
      //   that.form.validateFields(
      //     ['username', 'password', 'inputCode', 'rememberMe'],
      //     { force: true },
      //     (err, values) => {
      //       if (!err) {
      //         loginParams.username = values.username
      //         // update-begin- --- author:scott ------ date:20190805 ---- for:密码加密逻辑暂时注释掉，有点问题
      //         //loginParams.password = md5(values.password)
      //         //loginParams.password = encryption(values.password,that.encryptedString.key,that.encryptedString.iv)
      //         loginParams.password = values.password
      //         loginParams.remember_me = values.rememberMe
      //         // update-begin- --- author:scott ------ date:20190805 ---- for:密码加密逻辑暂时注释掉，有点问题
      //         loginParams.captcha = that.inputCodeContent
      //         loginParams.checkKey = that.currdatetime
      //         console.log('登录参数', loginParams)
      //         that
      //           .Login(loginParams)
      //           .then(res => {
      //             this.departConfirm(res)
      //           })
      //           .catch(err => {
      //             that.requestFailed(err)
      //           })
      //       } else {
      //         that.loginBtn = false
      //       }
      //     }
      //   )
      //   // 使用手机号登陆
      // } else {
      //   that.form.validateFields(['mobile', 'captcha', 'rememberMe'], { force: true }, (err, values) => {
      //     if (!err) {
      //       loginParams.mobile = values.mobile
      //       loginParams.captcha = values.captcha
      //       loginParams.remember_me = values.rememberMe
      //       that
      //         .PhoneLogin(loginParams)
      //         .then(res => {
      //           console.log(res.result)
      //           this.departConfirm(res)
      //         })
      //         .catch(err => {
      //           that.requestFailed(err)
      //         })
      //     }
      //   })
      // }
    },
    getCaptcha(e) {
      e.preventDefault()
      let that = this
      this.form.validateFields(['mobile'], { force: true }, (err, values) => {
        if (!values.mobile) {
          that.cmsFailed('请输入手机号')
        } else if (!err) {
          this.state.smsSendBtn = true
          let interval = window.setInterval(() => {
            if (that.state.time-- <= 0) {
              that.state.time = 60
              that.state.smsSendBtn = false
              window.clearInterval(interval)
            }
          }, 1000)

          const hide = this.$message.loading('验证码发送中..', 0)
          let smsParams = {}
          smsParams.mobile = values.mobile
          smsParams.smsmode = '0'
          postAction('/sys/sms', smsParams)
            .then((res) => {
              if (!res.success) {
                setTimeout(hide, 0)
                this.cmsFailed(res.message)
              }
              console.log(res)
              setTimeout(hide, 500)
            })
            .catch((err) => {
              setTimeout(hide, 1)
              clearInterval(interval)
              that.state.time = 60
              that.state.smsSendBtn = false
              this.requestFailed(err)
            })
        }
      })
    },
    stepCaptchaSuccess() {
      this.loginSuccess()
    },
    stepCaptchaCancel() {
      this.Logout().then(() => {
        this.loginBtn = false
        this.stepCaptchaVisible = false
      })
    },
    handleChangeCheckCode() {
      this.currdatetime = new Date().getTime()
      getAction(`/sys/randomImage/${this.currdatetime}`)
        .then((res) => {
          if (res.success) {
            this.randCodeImage = res.result
            this.requestCodeSuccess = true
          } else {
            this.$message.error(res.message)
            this.requestCodeSuccess = false
          }
        })
        .catch(() => {
          this.requestCodeSuccess = false
        })
    },
    loginSuccess() {
      // update-begin- author:sunjianlei --- date:20190812 --- for: 登录成功后不解除禁用按钮，防止多次点击
      // this.loginBtn = false
      // update-end- author:sunjianlei --- date:20190812 --- for: 登录成功后不解除禁用按钮，防止多次点击
      this.$router.push({ path: '/dashboard/analysis' })
      this.$notification.success({
        message: '欢迎',
        description: `${timeFix()}，欢迎回来`,
      })
    },
    cmsFailed(err) {
      this.$notification['error']({
        message: '登录失败',
        description: err,
        duration: 4,
      })
    },
    requestFailed(err) {
      this.$notification['error']({
        message: '登录失败',
        description: ((err.response || {}).data || {}).message || err.message || '请求出现错误，请稍后再试',
        duration: 4,
      })
      this.loginBtn = false
    },
    validateMobile(rule, value, callback) {
      if (!value || new RegExp(/^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/).test(value)) {
        callback()
      } else {
        callback('您的手机号码格式不正确!')
      }
    },
    validateInputCode(rule, value, callback) {
      if (!value || this.verifiedCode == this.inputCodeContent) {
        callback()
      } else {
        callback('您输入的验证码不正确!')
      }
    },
    generateCode(value) {
      this.verifiedCode = value.toLowerCase()
    },
    inputCodeChange(e) {
      this.inputCodeContent = e.target.value
    },
    departConfirm(res) {
      this.loginSuccess()
      // if (res.success) {
      //   let multi_depart = res.result.multi_depart
      //   //0:无部门 1:一个部门 2:多个部门
      //   if (multi_depart == 0) {
      //     this.loginSuccess()
      //     this.$notification.warn({
      //       message: '提示',
      //       description: `您尚未归属部门,请确认账号信息`,
      //       duration: 3,
      //     })
      //   } else if (multi_depart == 2) {
      //     this.departVisible = true
      //     this.currentUsername = this.form.getFieldValue('username')
      //     this.departList = res.result.departs
      //   } else {
      //     this.loginSuccess()
      //   }
      // } else {
      //   this.requestFailed(res)
      //   this.Logout()
      // }
    },
    departOk() {
      if (!this.departSelected) {
        this.validate_status = 'error'
        return false
      }
      let obj = {
        orgCode: this.departSelected,
        username: this.form.getFieldValue('username'),
      }
      putAction('/sys/selectDepart', obj).then((res) => {
        if (res.success) {
          const userInfo = res.result.userInfo
          Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
          store.commit('SET_INFO', userInfo)
          //console.log("---切换组织机构---userInfo-------",store.getters.userInfo.orgCode);
          this.departClear()
          this.loginSuccess()
        } else {
          this.requestFailed(res)
          this.Logout().then(() => {
            this.departClear()
          })
        }
      })
    },
    departClear() {
      this.departList = []
      this.departSelected = ''
      this.currentUsername = ''
      this.departVisible = false
      this.validate_status = ''
    },
    departChange(value) {
      this.validate_status = 'success'
      this.departSelected = value
    },
    getRouterData() {
      this.form.resetFields()
      this.$nextTick(() => {
        this.initialUsername = this.getCookie('username')
        this.initialPassword = this.getCookie('password')
        document.getElementById('input-checkbox').checked = true
        var record = {
          username: this.initialUsername,
          password: this.initialPassword,
        }
        this.form.setFieldsValue(pick(record, 'username', 'password'))
      })
      // this.$nextTick(() => {
      //   if (this.$route.params.username) {
      //     this.form.setFieldsValue({
      //       username: this.$route.params.username
      //     })
      //   }
      // })
    },
    //获取密码加密规则
    getEncrypte() {
      var encryptedString = Vue.ls.get(ENCRYPTED_STRING)
      if (encryptedString == null) {
        getEncryptedString().then((data) => {
          this.encryptedString = data
        })
      } else {
        this.encryptedString = encryptedString
      }
    },
    //设置cookie
    setCookie(name, value, day) {
      var date = new Date()
      date.setDate(date.getDate() + day)
      document.cookie = name + '=' + value + ';expires=' + date
    },
    //获取cookie
    getCookie(name) {
      var reg = RegExp(name + '=([^;]+)')
      var arr = document.cookie.match(reg)
      if (arr) {
        return arr[1]
      } else {
        return ''
      }
    },
    //删除cookie
    delCookie(name) {
      this.setCookie(name, null, -1)
    },
  },
}
</script>

<style lang="less" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 18px;
    height: 60px;
    width: 100%;
  }
}
.loginImg {
  width: 368px;
  text-align: center;
  font-size: 45px;
  font-weight: bolder;
}
.loginTitle {
  margin: 45px 0 25px 0;
  font-size: 24px;
}
#isRemember {
  position: relative;
}
.checkbox-label {
  font-size: 14px !important;
  margin-left: 5px;
}
input[type='checkbox'] {
  cursor: pointer;
  position: relative;
  width: 20px;
  height: 20px;
  line-height: 20px;
  font-size: 16px;
  visibility: hidden;
  top: 4px;
}
input[type='checkbox']::after {
  position: absolute;
  color: #fff;
  background-color: #1890ff;
  width: 20px;
  height: 20px;
  display: inline-block;
  visibility: visible;
  padding-left: 0px;
  text-align: center;
  content: ' ';
  border-radius: 50%;
  border: solid #ccc 1px;
}

input[type='checkbox']:checked::after {
  content: '🗸';
  font-size: 16px;
  font-weight: bold;
}
.inputCheckboxItem {
  margin-bottom: 0;
  margin-top: -10px;
}
</style>
<style lang="less">
.loginInpout {
  height: 60px;
  .anticon {
    font-size: 20px;
  }
  .ant-input {
    padding-left: 40px !important;
  }
}
</style>
<style>
#username{
  height: 100%;
}
#password{
   height: 100%;
}
.valid-error .ant-select-selection__placeholder {
  color: #f5222d;
}
</style>
