<template>
  <div class="password-change-container">
    <div class="password-form-card">
      <h2 class="password-form-title">修改密碼</h2>

      <el-form
        ref="elForm"
        :model="formData"
        :rules="rules"
        size="medium"
        label-width="100px"
        class="password-form"
      >
        <el-form-item
          label="目前密碼"
          prop="old_password"
          class="password-form-item"
        >
          <el-input
            v-model="formData.old_password"
            placeholder="請輸入目前密碼"
            clearable
            show-password
            class="password-input"
          />
        </el-form-item>

        <el-form-item
          label="新密碼"
          prop="new_password1"
          class="password-form-item"
        >
          <el-input
            v-model="formData.new_password1"
            placeholder="請輸入新密碼"
            clearable
            show-password
            class="password-input"
            @input="checkPasswordStrength"
          />
          <!-- 密碼強度指示器 -->
          <div
            class="password-strength-indicator"
            v-if="formData.new_password1"
          >
            <div class="strength-bars">
              <div
                v-for="n in 4"
                :key="n"
                class="strength-bar"
                :class="[
                  { filled: n <= passwordStrength.level },
                  passwordStrength.levelClass
                ]"
              ></div>
            </div>
            <span class="strength-text" :class="passwordStrength.levelClass">
              {{ passwordStrength.text }}
            </span>
          </div>
        </el-form-item>

        <el-form-item
          label="確認密碼"
          prop="new_password2"
          class="password-form-item"
        >
          <el-input
            v-model="formData.new_password2"
            placeholder="請再次輸入新密碼"
            clearable
            show-password
            class="password-input"
          />
        </el-form-item>

        <div class="password-button-group">
          <el-button
            type="primary"
            @click="submitForm"
            class="password-submit-btn"
          >
            確認修改
          </el-button>
          <el-button @click="resetForm" class="password-reset-btn">
            重設
          </el-button>
        </div>
      </el-form>

      <div class="password-requirements">
        <h3 class="requirements-title">密碼要求：</h3>
        <ul class="requirements-list">
          <li class="requirements-item" :class="{ met: meetsLength }">
            • 至少 8 個字元
          </li>
          <li class="requirements-item" :class="{ met: meetsLetter }">
            • 包含英文
          </li>
          <li class="requirements-item" :class="{ met: meetsNumber }">
            • 包含數字
          </li>
          <li class="requirements-item" :class="{ met: meetsSpecial }">
            • 特殊符號 (建議)
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { changePassword } from "@/api/user";

export default {
  name: "PasswordChange",
  data() {
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error("請輸入密碼"));
        return;
      }
      if (value.length < 8) {
        callback(new Error("密碼長度至少需要8個字元"));
        return;
      }
      if (!/[a-zA-Z]/.test(value)) {
        callback(new Error("密碼需要包含英文字母"));
        return;
      }
      if (!/\d/.test(value)) {
        callback(new Error("密碼需要包含數字"));
        return;
      }
      callback();
    };

    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error("請再次輸入密碼"));
        return;
      }
      if (value !== this.formData.new_password1) {
        callback(new Error("兩次輸入的密碼不一致"));
        return;
      }
      callback();
    };

    return {
      formData: {
        old_password: undefined,
        new_password1: undefined,
        new_password2: undefined
      },
      passwordStrength: {
        level: 0,
        text: "",
        levelClass: ""
      },
      meetsLength: false,
      meetsLetter: false,
      meetsNumber: false,
      meetsSpecial: false,
      rules: {
        old_password: [
          {
            required: true,
            message: "請輸入目前密碼",
            trigger: "blur"
          }
        ],
        new_password1: [
          {
            required: true,
            message: "請輸入新密碼",
            trigger: "blur"
          },
          {
            validator: validatePassword,
            trigger: "blur"
          }
        ],
        new_password2: [
          {
            required: true,
            message: "請再次輸入新密碼",
            trigger: "blur"
          },
          {
            validator: validateConfirmPassword,
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    checkPasswordStrength() {
      const password = this.formData.new_password1;
      if (!password) {
        this.resetStrengthIndicators();
        return;
      }

      // 檢查各項條件
      this.meetsLength = password.length >= 8;
      this.meetsLetter = /[a-zA-Z]/.test(password);
      this.meetsNumber = /\d/.test(password);
      this.meetsSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      // 計算強度
      let strength = 0;
      if (this.meetsLength) strength++;
      if (this.meetsLetter) strength++;
      if (this.meetsNumber) strength++;
      if (this.meetsSpecial) strength++;

      // 設定強度等級和文字
      switch (strength) {
        case 0:
        case 1:
          this.passwordStrength = {
            level: 1,
            text: "弱",
            levelClass: "strength-weak"
          };
          break;
        case 2:
          this.passwordStrength = {
            level: 2,
            text: "一般",
            levelClass: "strength-fair"
          };
          break;
        case 3:
          this.passwordStrength = {
            level: 3,
            text: "強",
            levelClass: "strength-good"
          };
          break;
        case 4:
          this.passwordStrength = {
            level: 4,
            text: "非常強",
            levelClass: "strength-strong"
          };
          break;
      }
    },
    resetStrengthIndicators() {
      this.passwordStrength = {
        level: 0,
        text: "",
        levelClass: ""
      };
      this.meetsLength = false;
      this.meetsLetter = false;
      this.meetsNumber = false;
      this.meetsSpecial = false;
    },
    submitForm() {
      this.$refs["elForm"].validate(valid => {
        if (!valid) return;
        changePassword(this.formData).then(async res => {
          this.$message({
            message: "密碼修改成功，請重新登入",
            type: "success"
          });
          await this.$store.dispatch("user/logout");
          this.$router.push(`/login`);
        });
      });
    },
    resetForm() {
      this.$refs["elForm"].resetFields();
      this.resetStrengthIndicators();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
.password-change-container {
  min-height: 100vh;
  background-color: $beige;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-form-card {
  background: $white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba($navy-blue, 0.1);
}

.password-form-title {
  color: $navy-blue;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.password-form {
  margin-bottom: 2rem;
}

.password-form-item {
  .el-form-item__label {
    color: $navy-blue;
    font-weight: 500;
  }
}

.password-input {
  .el-input__inner {
    border-color: lighten($navy-blue, 50%);
    border-radius: 6px;
    height: 40px;

    &:focus {
      border-color: $navy-blue;
      box-shadow: 0 0 0 2px rgba($navy-blue, 0.1);
    }
  }
}

.password-button-group {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.password-submit-btn {
  background-color: $navy-blue;
  border-color: $navy-blue;
  min-width: 120px;
  height: 40px;

  &:hover {
    background-color: $navy-blue-hover;
    border-color: $navy-blue-hover;
  }
}

.password-reset-btn {
  color: $navy-blue;
  border-color: $navy-blue;
  background-color: transparent;
  min-width: 120px;
  height: 40px;

  &:hover {
    color: $navy-blue-hover;
    border-color: $navy-blue-hover;
    background-color: rgba($navy-blue, 0.05);
  }
}

.password-requirements {
  background-color: lighten($beige, 5%);
  border-radius: 6px;
  padding: 1rem 1.5rem;
}

.requirements-title {
  color: $navy-blue;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-item {
  color: lighten($navy-blue, 20%);
  font-size: 0.85rem;
  margin-bottom: 0.25rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.password-strength-indicator {
  margin-top: 0.5rem;

  .strength-bars {
    display: flex;
    gap: 4px;
    margin-bottom: 0.25rem;
  }

  .strength-bar {
    height: 4px;
    flex: 1;
    background-color: #e0e0e0;
    border-radius: 2px;
    transition: all 0.3s ease;

    &.filled {
      &.strength-weak {
        background-color: #ff4d4f;
      }
      &.strength-fair {
        background-color: #faad14;
      }
      &.strength-good {
        background-color: #52c41a;
      }
      &.strength-strong {
        background-color: #1890ff;
      }
    }
  }

  .strength-text {
    font-size: 0.8rem;

    &.strength-weak {
      color: #ff4d4f;
    }
    &.strength-fair {
      color: #faad14;
    }
    &.strength-good {
      color: #52c41a;
    }
    &.strength-strong {
      color: #1890ff;
    }
  }
}

.requirements-list {
  .requirements-item {
    color: lighten($navy-blue, 40%);
    transition: color 0.3s ease;

    &.met {
      color: $navy-blue;
      font-weight: 500;
    }
  }
}

@media (max-width: 768px) {
  .password-change-container {
    padding: 1rem;
  }

  .password-form-card {
    padding: 1.5rem;
  }

  .password-button-group {
    flex-direction: column;
  }

  .password-submit-btn,
  .password-reset-btn {
    width: 100%;
  }
}
</style>
