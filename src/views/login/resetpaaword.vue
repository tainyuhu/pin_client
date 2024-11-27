<template>
  <div class="login-container">
    <!-- LOGO 區域 -->
    <div class="logo-container">
      <img src="@/assets/logo/sunny_logo.png" alt="LOGO" class="logo" />
    </div>

    <el-form
      ref="securityForm"
      :model="securityForm"
      :rules="securityRules"
      class="login-form"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">安全問題驗證</h3>
      </div>

      <!-- 安全問題 -->
      <el-form-item prop="answer">
        <div class="question-text">{{ currentQuestion.question }}</div>
        <span class="svg-container">
          <svg-icon icon-class="security" />
        </span>
        <el-input
          ref="answer"
          v-model="securityForm.answer"
          placeholder="請輸入答案"
          name="answer"
          type="text"
          tabindex="1"
          @keyup.enter.native="handleSubmit"
        />
      </el-form-item>

      <!-- 驗證按鈕 -->
      <el-button
        :loading="loading"
        class="login-button"
        @click.native.prevent="handleSubmit"
      >
        確認
      </el-button>
    </el-form>
  </div>
</template>

<script>
// 模擬API回傳的安全問題資料
const mockSecurityQuestions = [
  {
    id: 1,
    question: "您最喜歡的寵物名字是什麼？",
    answer: "小白"
  },
  {
    id: 2,
    question: "您的出生地是哪裡？",
    answer: "台北"
  },
  {
    id: 3,
    question: "您最喜歡的食物是什麼？",
    answer: "牛肉麵"
  }
];

export default {
  name: "SecurityQuestions",
  data() {
    const validateAnswer = (rule, value, callback) => {
      if (!value) {
        callback(new Error("請輸入答案"));
      } else if (value !== this.currentQuestion.answer) {
        callback(new Error("答案不正確"));
        this.$message({
          message: "答案驗證失敗，請重試",
          type: "error",
          duration: 3000
        });
      } else {
        callback();
      }
    };

    return {
      securityForm: {
        answer: ""
      },
      securityRules: {
        answer: [
          {
            required: true,
            trigger: "blur",
            validator: validateAnswer
          }
        ]
      },
      loading: false,
      questions: [],
      currentQuestionIndex: 0
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || {};
    }
  },
  created() {
    // 這裡之後會改為實際API呼叫
    this.fetchSecurityQuestions();
  },
  methods: {
    async fetchSecurityQuestions() {
      try {
        // 模擬API呼叫
        // const response = await this.$api.getSecurityQuestions();
        // this.questions = response.data;

        // 使用模擬資料
        this.questions = mockSecurityQuestions;

        // 隨機選擇一個問題
        this.currentQuestionIndex = Math.floor(
          Math.random() * this.questions.length
        );
      } catch (error) {
        console.error("Failed to fetch security questions:", error);
        this.$message.error("獲取安全問題失敗");
      }
    },
    handleSubmit() {
      this.$refs.securityForm.validate(valid => {
        if (valid) {
          this.loading = true;
          // 模擬API驗證
          setTimeout(() => {
            this.$message({
              message: "驗證成功",
              type: "success",
              duration: 2000
            });
            this.$router.push("/changepassword");
            this.loading = false;
          }, 1000);
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
  background-color: $navy-blue;
  overflow: hidden;
  position: relative;

  .logo-container {
    margin-bottom: 20px;
    text-align: center;

    .logo {
      width: 300px;
      height: auto;
    }
  }

  .question-text {
    color: $white;
    font-size: 16px;
    margin-bottom: 15px;
    padding: 0 15px;
  }

  .login-form {
    position: relative;
    width: 100%;
    max-width: 400px;
    padding: 20px;
    background-color: rgba($white, 0.1);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .title-container .title {
    font-size: 24px;
    color: $white;
    text-align: center;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $gold;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .show-pwd {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: $gold;
    cursor: pointer;
  }

  .login-button {
    width: 100%;
    height: 45px;
    background-color: $gold;
    color: $navy-blue;
    font-weight: bold;
    border: 2px solid $gold;
    border-radius: 5px;
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: darken($gold, 10%);
      color: $white;
    }
  }

  .extra-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .line-button {
      background-color: #00c300;
      color: $white;
      width: 100%;
      height: 45px;
      font-weight: bold;
      border: none;
      border-radius: 5px;
      cursor: pointer;

      &:hover {
        background-color: darken(#00c300, 10%);
      }
    }

    .extra-actions {
      display: flex;
      justify-content: center;
      .first-login-button {
        width: 100%;
        height: 40px;
        font-weight: bold;
        border-radius: 5px;
        background-color: $navy-blue;
        color: $white;
        cursor: pointer;

        &:hover {
          background-color: $navy-blue-hover;
        }
      }
    }
  }
}
</style>
