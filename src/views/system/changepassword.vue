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
          />
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
          <li class="requirements-item">• 至少 8 個字元</li>
          <li class="requirements-item">• 包含英文大小寫</li>
          <li class="requirements-item">• 包含數字</li>
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
    return {
      formData: {
        old_password: undefined,
        new_password1: undefined,
        new_password2: undefined
      },
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
          }
        ],
        new_password2: [
          {
            required: true,
            message: "請再次輸入新密碼",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
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
