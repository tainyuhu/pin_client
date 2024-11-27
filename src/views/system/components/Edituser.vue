<template>
  <div class="edit-user-form">
    <el-form
      ref="userForm"
      :model="userForm"
      :rules="rules"
      :label-width="isMobile ? '90px' : '120px'"
      :label-position="isMobile ? 'top' : 'right'"
      size="small"
      v-loading="formLoading"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <el-form-item label="員工編號" prop="username">
              <el-input
                v-model="userForm.username"
                placeholder="請輸入員工編號"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="userForm.name" placeholder="請輸入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 組織信息 -->
      <div class="form-section">
        <div class="section-title">組織信息</div>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <el-form-item label="公司" prop="company">
              <el-select
                v-model="userForm.company"
                placeholder="請選擇公司"
                clearable
                class="full-width"
                @change="handleCompanyChange"
              >
                <el-option
                  v-for="item in companyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="群組" prop="dept_id">
              <treeselect
                v-model="userForm.dept_id"
                :options="deptTreeOptions"
                :normalizer="deptNormalizer"
                :default-expand-level="1"
                placeholder="請選擇群組"
                :clearable="false"
                class="full-width"
                :searchable="true"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <el-form-item label="區域" prop="area">
              <el-select
                v-model="userForm.area"
                placeholder="請選擇區域"
                clearable
                class="full-width"
              >
                <el-option
                  v-for="item in areaOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="職位" prop="position">
              <el-select
                v-model="userForm.position"
                placeholder="請選擇職位"
                clearable
                class="full-width"
              >
                <el-option
                  v-for="item in positionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 聯絡信息 -->
      <div class="form-section">
        <div class="section-title">聯絡信息</div>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <el-form-item label="電子郵件" prop="email">
              <el-input v-model="userForm.email" placeholder="請輸入電子郵件" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="手機號碼" prop="phone">
              <el-input v-model="userForm.phone" placeholder="請輸入手機號碼" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="住址" prop="address">
              <el-input v-model="userForm.address" placeholder="請輸入住址" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 系統權限 -->
      <div class="form-section">
        <div class="section-title">系統權限</div>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <el-form-item label="角色" prop="roles_name">
              <el-select
                v-model="userForm.roles_name"
                multiple
                collapse-tags
                placeholder="請選擇角色"
                clearable
                class="full-width"
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="帳號狀態" prop="status">
              <el-select
                v-model="userForm.status"
                placeholder="請選擇帳號狀態"
                class="full-width"
              >
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 入職信息 -->
      <div class="form-section">
        <div class="section-title">入職信息</div>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <el-form-item label="入職日期" prop="join_date">
              <el-date-picker
                v-model="userForm.join_date"
                type="date"
                placeholder="請選擇入職日期"
                class="full-width"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="員工狀態" prop="employee_status">
              <el-select
                v-model="userForm.employee_status"
                placeholder="請選擇員工狀態"
                class="full-width"
              >
                <el-option
                  v-for="item in employeeStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="備註" prop="notes">
              <el-input
                v-model="userForm.notes"
                type="textarea"
                :rows="3"
                placeholder="請輸入備註"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 表單按鈕 -->
      <div class="form-buttons">
        <el-button
          type="primary"
          :loading="submitLoading"
          class="submit-button"
          @click="submitForm"
        >
          確認修改
        </el-button>
        <el-button class="action-button" @click="resetForm">
          重置
        </el-button>
        <el-button class="action-button" @click="cancel">
          取消
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getUser, updateUser } from "@/api/user";
import { getOrgAll } from "@/api/org";
import { getRoleAll } from "@/api/role";
import { genTree } from "@/utils/tree";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Edituser",
  components: { Treeselect },
  props: {
    userId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    const validateEmail = (rule, value, callback) => {
      if (!value) {
        callback();
        return;
      }
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(value)) {
        callback(new Error("請輸入正確的電子郵件格式"));
      } else {
        callback();
      }
    };

    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback();
        return;
      }
      const phoneRegex = /^09\d{8}$/;
      if (!phoneRegex.test(value)) {
        callback(new Error("請輸入正確的手機號碼格式"));
      } else {
        callback();
      }
    };

    return {
      formLoading: false,
      submitLoading: false,
      isMobile: false,
      userForm: {
        username: "",
        name: "",
        company: "",
        dept_id: "",
        area: "",
        position: "",
        email: "",
        phone: "",
        address: "",
        roles_name: [],
        status: "1",
        employee_status: "1",
        join_date: "",
        notes: ""
      },
      originalForm: {}, // 保存原始數據用於重置
      rules: {
        name: [{ required: true, message: "請輸入姓名", trigger: "blur" }],
        company: [{ required: true, message: "請選擇公司", trigger: "change" }],
        dept_id: [{ required: true, message: "請選擇群組", trigger: "change" }],
        position: [
          { required: true, message: "請選擇職位", trigger: "change" }
        ],
        email: [{ validator: validateEmail, trigger: "blur" }],
        phone: [{ validator: validatePhone, trigger: "blur" }],
        roles_name: [
          { required: true, message: "請選擇角色", trigger: "change" }
        ],
        join_date: [
          { required: true, message: "請選擇入職日期", trigger: "change" }
        ]
      },
      companyOptions: [
        { value: "1", label: "公司一" },
        { value: "2", label: "公司二" }
      ],
      deptOptions: [],
      areaOptions: [
        { value: "1", label: "北區" },
        { value: "2", label: "中區" },
        { value: "3", label: "南區" }
      ],
      positionOptions: [
        { value: "1", label: "經理" },
        { value: "2", label: "職員" }
      ],
      roleOptions: [],
      statusOptions: [
        { value: "1", label: "啟用" },
        { value: "0", label: "停用" }
      ],
      employeeStatusOptions: [
        { value: "1", label: "在職" },
        { value: "2", label: "離職" },
        { value: "3", label: "待職" }
      ]
    };
  },
  created() {
    this.checkDeviceType();
    window.addEventListener("resize", this.checkDeviceType);
    this.initData();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkDeviceType);
  },
  methods: {
    checkDeviceType() {
      this.isMobile = window.innerWidth < 768;
    },
    async initData() {
      this.formLoading = true;
      try {
        await Promise.all([
          this.getUserData(),
          this.getDeptOptions(),
          this.getRoleOptions()
        ]);
      } catch (error) {
        console.error("初始化數據失敗:", error);
      } finally {
        this.formLoading = false;
      }
    },
    async getUserData() {
      try {
        const res = await getUser(this.userId);
        if (res.code === 200) {
          this.userForm = { ...res.data };
          this.originalForm = { ...res.data }; // 保存原始數據
        }
      } catch (error) {
        this.$message.error("獲取使用者資料失敗");
        throw error;
      }
    },
    async getDeptOptions() {
      try {
        const res = await getOrgAll();
        if (res.code === 200) {
          // 轉換數據格式
          this.deptTreeOptions = this.formatTreeData(genTree(res.data));

          // 設置預設值為根群組
          if (this.deptTreeOptions.length > 0) {
            this.userForm.dept_id = this.deptTreeOptions[0].id;
          }
        }
      } catch (error) {
        console.error("獲取群組列表失敗:", error);
        this.$message.error("獲取群組列表失敗");
      }
    },
    formatTreeData(data) {
      return data.map(item => ({
        id: item.id,
        label: item.name,
        children: item.children ? this.formatTreeData(item.children) : undefined
      }));
    },
    deptNormalizer(node) {
      return {
        id: node.id,
        label: node.label,
        children: node.children
      };
    },
    async getRoleOptions() {
      try {
        const res = await getRoleAll();
        if (res.code === 200) {
          this.roleOptions = res.data.map(item => ({
            value: item.id,
            label: item.name
          }));
        }
      } catch (error) {
        this.$message.error("獲取角色列表失敗");
        throw error;
      }
    },
    handleCompanyChange() {
      this.userForm.dept_id = "";
      this.getDeptOptions();
    },
    submitForm() {
      this.$refs.userForm.validate(async valid => {
        if (valid) {
          this.submitLoading = true;
          try {
            const res = await updateUser(this.userId, this.userForm);
            if (res.code === 200) {
              this.$message.success("修改成功");
              this.$emit("updateSuccess");
            } else {
              this.$message.error(res.message || "修改失敗");
            }
          } catch (error) {
            console.error("修改使用者失敗:", error);
            this.$message.error("修改失敗");
          } finally {
            this.submitLoading = false;
          }
        } else {
          if (this.isMobile) {
            const errorField = document.querySelector(".el-form-item__error");
            if (errorField) {
              errorField.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
            }
          }
          return false;
        }
      });
    },
    resetForm() {
      // 重置為原始數據
      this.userForm = { ...this.originalForm };
      this.$refs.userForm.clearValidate();
    },
    cancel() {
      this.$emit("cancel");
    }
  }
};
</script>

<style lang="scss" scoped>
.edit-user-form {
  padding: 10px;

  @media screen and (min-width: 768px) {
    padding: 20px;
  }

  .form-section {
    margin-bottom: 15px;
    padding: 15px 10px;
    background: #f9f9f9;
    border-radius: 4px;
    transition: all 0.3s ease;

    @media screen and (min-width: 768px) {
      margin-bottom: 30px;
      padding: 20px;
    }

    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    }

    .section-title {
      margin-bottom: 15px;
      padding-left: 10px;
      font-size: 15px;
      font-weight: bold;
      border-left: 3px solid #409eff;
      color: #303133;

      @media screen and (min-width: 768px) {
        margin-bottom: 20px;
        font-size: 16px;
      }
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;

    @media screen and (min-width: 768px) {
      margin-bottom: 18px;
    }

    .el-form-item__label {
      line-height: 1.4;
      padding-bottom: 8px;

      @media screen and (max-width: 767px) {
        text-align: left;
      }
    }
  }

  .full-width {
    width: 100%;
  }

  .form-buttons {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 10px;

    @media screen and (min-width: 768px) {
      flex-direction: row;
      justify-content: center;
      margin-top: 30px;
      gap: 15px;
    }

    .el-button {
      margin: 0;
      height: 40px;
      width: 100%;

      @media screen and (min-width: 768px) {
        width: auto;
        min-width: 120px;
      }

      &.submit-button {
        order: -1;
      }
    }
  }
}

// 深色模式支援
@media (prefers-color-scheme: dark) {
  .edit-user-form {
    .form-section {
      background: #2b2b2b;

      .section-title {
        color: #e0e0e0;
      }
    }

    :deep(.el-input__inner),
    :deep(.el-textarea__inner) {
      background-color: #363636;
      border-color: #484848;
      color: #e0e0e0;

      &::placeholder {
        color: #808080;
      }
    }
  }
}
</style>
