<!-- components/TargetAudience.vue -->
<template>
  <div class="target-audience">
    <el-card class="audience-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <i class="el-icon-user"></i>
          <h3>目標受眾</h3>
        </div>
      </template>

      <div class="form-content">
        <!-- 個人資料篩選條件 -->
        <div class="filter-section">
          <div class="section-title">
            <span>個人資料篩選</span>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="addFilter"
              :disabled="disabled"
            >
              新增條件
            </el-button>
          </div>

          <div class="filter-list">
            <div
              v-for="(filter, index) in filters"
              :key="index"
              class="filter-item"
            >
              <el-row :gutter="20" align="middle">
                <el-col :span="6">
                  <el-select
                    v-model="filter.field"
                    placeholder="選擇欄位"
                    :disabled="disabled"
                  >
                    <el-option
                      v-for="field in filterFields"
                      :key="field.value"
                      :label="field.label"
                      :value="field.value"
                    />
                  </el-select>
                </el-col>

                <el-col :span="6">
                  <el-cascader
                    v-if="filter.field === 'company'"
                    v-model="filter.value"
                    :options="companyOptions"
                    :props="{ checkStrictly: true }"
                    placeholder="選擇公司"
                    :disabled="disabled"
                  />
                  <el-cascader
                    v-else-if="filter.field === 'position'"
                    v-model="filter.value"
                    :options="positionOptions"
                    :props="{ checkStrictly: true }"
                    placeholder="選擇職位"
                    :disabled="disabled"
                  />
                  <el-select
                    v-else-if="filter.field === 'area'"
                    v-model="filter.value"
                    placeholder="選擇區域"
                    :disabled="disabled"
                  >
                    <el-option
                      v-for="area in areaOptions"
                      :key="area.value"
                      :label="area.label"
                      :value="area.value"
                    />
                  </el-select>
                </el-col>

                <el-col :span="2">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    @click="removeFilter(index)"
                    :disabled="disabled"
                  />
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

        <!-- 群組篩選 -->
        <div class="group-section">
          <div class="section-title">
            <span>群組篩選</span>
          </div>

          <el-tree
            ref="groupTree"
            :data="groupTreeData"
            show-checkbox
            node-key="id"
            :props="defaultProps"
            :disabled="disabled"
            @check="handleGroupCheck"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <span>{{ node.label }}</span>
                <span class="member-count"
                  >({{ data.memberCount || 0 }}人)</span
                >
              </span>
            </template>
          </el-tree>
        </div>

        <!-- 篩選結果統計 -->
        <div class="result-section" v-if="totalCount > 0">
          <el-alert type="info" :closable="false" show-icon>
            <template #title>
              當前篩選條件預估符合人數：
              <span class="count-number">{{ totalCount }}</span> 人
            </template>
          </el-alert>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "TargetAudience",

  props: {
    value: {
      type: Object,
      default: () => ({
        filters: [],
        groups: []
      })
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      filters: [],
      selectedGroups: [],
      totalCount: 0,

      // 篩選欄位選項
      filterFields: [
        { label: "上班區域", value: "area" },
        { label: "公司", value: "company" },
        { label: "職位", value: "position" }
      ],

      // 區域選項
      areaOptions: [
        { label: "台北總公司", value: "taipei_hq" },
        { label: "新竹園區", value: "hsinchu" },
        { label: "台中辦公室", value: "taichung" }
      ],

      // 公司層級選項
      companyOptions: [
        {
          value: "group_a",
          label: "A集團",
          children: [
            {
              value: "company_a1",
              label: "A1公司"
            },
            {
              value: "company_a2",
              label: "A2公司"
            }
          ]
        },
        {
          value: "group_b",
          label: "B集團",
          children: [
            {
              value: "company_b1",
              label: "B1公司"
            }
          ]
        }
      ],

      // 職位層級選項
      positionOptions: [
        {
          value: "rd",
          label: "研發部門",
          children: [
            {
              value: "senior_engineer",
              label: "資深工程師"
            },
            {
              value: "engineer",
              label: "工程師"
            }
          ]
        },
        {
          value: "sales",
          label: "業務部門",
          children: [
            {
              value: "sales_manager",
              label: "業務經理"
            },
            {
              value: "sales_rep",
              label: "業務代表"
            }
          ]
        }
      ],

      // 群組樹形數據
      groupTreeData: [
        {
          id: 1,
          label: "管理群組",
          memberCount: 50,
          children: [
            {
              id: 4,
              label: "部門主管",
              memberCount: 30
            },
            {
              id: 5,
              label: "專案主管",
              memberCount: 20
            }
          ]
        },
        {
          id: 2,
          label: "專案群組",
          memberCount: 100,
          children: [
            {
              id: 6,
              label: "專案A",
              memberCount: 45
            },
            {
              id: 7,
              label: "專案B",
              memberCount: 55
            }
          ]
        }
      ],

      defaultProps: {
        children: "children",
        label: "label"
      }
    };
  },

  methods: {
    addFilter() {
      this.filters.push({
        field: "",
        value: null
      });
      this.updateValue();
    },

    removeFilter(index) {
      this.filters.splice(index, 1);
      this.updateValue();
    },

    handleGroupCheck(data, checked) {
      this.selectedGroups = this.$refs.groupTree.getCheckedKeys();
      this.updateValue();
      this.calculateTotalCount();
    },

    updateValue() {
      this.$emit("input", {
        filters: this.filters,
        groups: this.selectedGroups
      });
      this.calculateTotalCount();
    },

    calculateTotalCount() {
      // 這裡應該調用後端 API 來計算實際符合條件的人數
      // 目前僅模擬返回一個數字
      this.totalCount = Math.floor(Math.random() * 1000) + 100;
    }
  },

  watch: {
    value: {
      handler(newVal) {
        if (newVal) {
          this.filters = newVal.filters || [];
          this.selectedGroups = newVal.groups || [];
        }
      },
      immediate: true
    }
  }
};
</script>

<style lang="scss" scoped>
.target-audience {
  margin-bottom: 24px;

  .audience-card {
    transition: all 0.3s;
    border-radius: 8px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;

    i {
      color: #409eff;
      font-size: 22px;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .form-content {
    padding: 24px;
  }

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    span {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .filter-section {
    margin-bottom: 24px;
  }

  .filter-list {
    .filter-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .el-select {
        width: 100%;
      }

      .el-cascader {
        width: 100%;
      }
    }
  }

  .group-section {
    margin-bottom: 24px;

    .tree-node {
      display: flex;
      align-items: center;
      gap: 8px;

      .member-count {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .result-section {
    .count-number {
      font-size: 16px;
      font-weight: 600;
      color: #409eff;
    }
  }
}

@media screen and (max-width: 768px) {
  .target-audience {
    .form-content {
      padding: 16px;
    }

    .filter-item {
      .el-row {
        margin-left: 0 !important;
        margin-right: 0 !important;
      }

      .el-col {
        padding-left: 0 !important;
        padding-right: 0 !important;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
