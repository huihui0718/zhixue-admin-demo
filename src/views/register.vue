<template>
  <div class="register">
    <el-form ref="registerForm" :model="registerForm" status-icon :rules="rules" label-width="0px" class="demo-registerForm">
      <h3 class="title">
        注册
      </h3>
      <el-form-item prop="username">
        <el-input v-model="registerForm.username" type="text" auto-complete="off" placeholder="账号">
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="pass">
        <el-input v-model="registerForm.pass" type="password" autocomplete="off" placeholder="请输入密码">
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="checkPass">
        <el-input v-model="registerForm.checkPass" type="password" autocomplete="off" placeholder="请输入密码">
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <!--      <el-form-item prop="code">-->
      <!--        <el-input v-model="registerForm.code" auto-complete="off" placeholder="验证码" style="width: 63%">-->
      <!--          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />-->
      <!--        </el-input>-->
      <!--        <div class="login-code">-->
      <!--          <img :src="codeUrl">-->
      <!--        </div>-->
      <!--      </el-form-item>-->
      <!--      <el-checkbox v-model="registerForm.rememberMe" style="margin:0 0 25px 0;">-->
      <!--        记住我-->
      <!--      </el-checkbox>-->
      <el-form-item class="button">
        <el-button type="primary" @click="submitForm(registerForm)">提交</el-button>
        <el-button @click="resetForm(registerForm)">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getCodeImg, zhuce } from '@/api/login'

export default {
  name: 'RegisterIndex',
  data() {
    var validateName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入用户名'))
      } else {
        callback()
      }
    }
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.registerForm.checkPass !== '') {
          this.$refs.registerForm.validateField('checkPass')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.registerForm.pass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    var validateCode = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入用户名'))
      } else {
        callback()
      }
    }
    return {
      codeUrl: '',
      registerForm: {
        username: '',
        pass: '',
        checkPass: '',
        code: '',
        rememberMe: false,
        uuid: ''
      },
      rules: {
        username: [
          { validator: validateName, trigger: 'blur' }
        ],
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        code: [
          { validator: validateCode, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm(registerForm) {
      const data = {
        username: this.registerForm.username,
        password: this.registerForm.pass
      }

      zhuce(data).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
      // this.$refs[formName].validate((valid) => {
      //   if (valid) {
      //     alert('submit!')
      //   } else {
      //     console.log('error submit!!')
      //     return false
      //   }
      // })
    },
    resetForm(registerForm) {
      this.$refs[registerForm].resetFields()
    }
  },
  getCode() {
    getCodeImg().then(res => {
      this.codeUrl = res.img
      this.registerForm.uuid = res.uuid
    })
  }
}
</script>

<style lang="less" scoped>
.register{
    padding: 25px;
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 2%;
    transform: translate(-50%, -50%);
    height: 400px;
    width: 385px;
    background-color: #fff;
}
.title {
    margin: 0 auto 30px auto;
    text-align: center;
    color: #707070;
  }
.login-code {
    width: 33%;
    display: inline-block;
    height: 38px;
    float: right;
    img{
      cursor: pointer;
      vertical-align:middle
    }
  }
.button{
  display: flex;
  justify-content: space-between;
}
</style>

