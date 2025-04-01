g<template>
  <div class="app-container">
    <div class="create-container">
      <page-header
        :status="formData.status"
        :saving="formStatus.saving"
        :submitting="formStatus.submitting"
        v-show="canSubmit"
        @save-draft="saveDraft"
        @submit="submitForm"
        @preview="showPreview = true"
      />

      <preview-dialog v-model="showPreview" :form-data="formData" />

      <el-form
        ref="form"
        :model="formData"
        :rules="rules"
        label-position="top"
        v-loading="loading"
      >
        <basic-info
          :value="formData.basicInfo"
          @input="updateBasicInfo"
          :disabled="isFormDisabled"
        />
        <promotion-settings
          :value="formData.promotion"
          @input="updatePromotion"
          :disabled="isFormDisabled"
        />
        <product-list
          :value="formData.products"
          @input="updateProducts"
          :promotion-type="formData.promotion.type"
          :disabled="isFormDisabled"
        />
        <delivery-settings
          :value="formData.delivery"
          @input="updateDelivery"
          :disabled="isFormDisabled"
        />
      </el-form>
    </div>
  </div>
</template>

<script>
import PageHeader from "./components/PageHeader.vue";
import BasicInfo from "./components/BasicInfo.vue";
import PromotionSettings from "./components/PromotionSettings.vue";
import ProductList from "./components/ProductList.vue";
import DeliverySettings from "./components/DeliverySettings.vue";
import PreviewDialog from "./components/PreviewDialog.vue";
import checkPermission from "@/utils/permission";
import { getStatusActions } from "@/utils/statusManager";

export default {
  name: "GroupBuyingEdit",

  components: {
    PageHeader,
    BasicInfo,
    PromotionSettings,
    ProductList,
    DeliverySettings,
    PreviewDialog
  },

  data() {
    return {
      loading: true,
      showPreview: false,
      formData: {
        id: null,
        status: "draft",
        basicInfo: {
          title: "",
          description: "",
          startTimeType: "now",
          startTime: null,
          endTime: null,
          mainImage: null,
          regions: [],
          departments: [],
          groups: []
        },
        promotion: {
          type: "",
          freeShippingThreshold: 0,
          hasBonus: false,
          bonusEndTime: null,
          bonusDescription: ""
        },
        products: [],
        delivery: {
          companyPickup: false,
          addressPickup: false,
          pickupLocations: []
        }
      },
      formStatus: {
        isProcessing: false,
        saving: false,
        submitting: false
      },
      rules: {
        "basicInfo.title": [
          { required: true, message: "請輸入活動標題", trigger: "blur" }
        ],
        "basicInfo.endTime": [
          { required: true, message: "請選擇收單時間", trigger: "change" }
        ]
      }
    };
  },

  created() {
    this.fetchData();
  },

  methods: {
    getStatusActions,
    checkPermission,
    // Mock API Methods - 之後可以直接替換成真實的 API 呼叫
    async getMockGroupBuying() {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            id: "mock-123",
            activeTab: "history",
            status: "draft",
            basicInfo: {
              title: "【測試】年末超值團購活動",
              description: "這是一個測試用的團購活動描述，包含各種優惠商品。",
              startTimeType: "scheduled",
              startTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
              endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
              mainImage: {
                url: "https://via.placeholder.com/800x400",
                name: "main-image.jpg"
              },
              regions: ["北部", "中部"],
              departments: ["研發部", "行政部"],
              groups: ["總公司", "分公司"]
            },
            promotion: {
              type: "discount",
              freeShippingThreshold: 2000,
              hasBonus: true,
              bonusEndTime: new Date(
                new Date().getTime() + 3 * 24 * 60 * 60 * 1000
              ),
              bonusDescription: "前100名下單即贈送精美禮品"
            },
            products: [
              {
                id: "p1",
                name: "精選咖啡豆",
                description: "來自哥倫比亞的高山咖啡豆",
                price: 599,
                originalPrice: 799,
                inventory: 100,
                image: "https://via.placeholder.com/200x200",
                specs: [{ name: "重量", value: "半磅" }]
              },
              {
                id: "p2",
                name: "手沖咖啡組合",
                description: "包含手沖壺、濾紙及咖啡豆",
                price: 1299,
                originalPrice: 1599,
                inventory: 50,
                image: "https://via.placeholder.com/200x200",
                specs: [
                  { name: "組合內容", value: "手沖壺+濾紙50張+咖啡豆250g" }
                ]
              }
            ],
            delivery: {
              companyPickup: true,
              addressPickup: true,
              pickupLocations: [
                {
                  name: "總公司",
                  address: "台北市信義區信義路五段7號"
                },
                {
                  name: "分公司",
                  address: "新北市板橋區新站路28號"
                }
              ]
            }
          });
        }, 1000);
      });
    },

    async updateMockGroupBuying(data) {
      return new Promise(resolve => {
        setTimeout(() => {
          console.log("Mock API - Updated data:", data);
          resolve({ success: true });
        }, 1000);
      });
    },

    // Component Methods
    async fetchData() {
      const id = this.$route.params.id;
      if (!id) {
        this.$message.error("無效的團購ID");
        this.$router.push("/groupbuying/list");
        return;
      }

      try {
        this.loading = true;
        // 這裡之後可以直接替換成真實的 API 呼叫
        const data = await this.getMockGroupBuying(id);
        this.formData = { ...data };
        this.$message.success("資料載入成功");
      } catch (error) {
        this.$message.error("取得資料失敗");
        this.$router.push("/groupbuying/list");
      } finally {
        this.loading = false;
      }
    },

    updateBasicInfo(val) {
      this.formData.basicInfo = val;
    },

    updatePromotion(val) {
      this.formData.promotion = val;
    },

    updateProducts(val) {
      this.formData.products = val;
    },

    updateDelivery(val) {
      this.formData.delivery = val;
    },

    async validateForm() {
      try {
        await this.$refs.form.validate();
        return true;
      } catch (error) {
        return false;
      }
    },

    async saveDraft() {
      this.formStatus.saving = true;
      try {
        // 這裡之後可以直接替換成真實的 API 呼叫
        await this.updateMockGroupBuying({ ...this.formData, status: "draft" });
        this.$message.success("草稿已儲存");
      } catch (error) {
        this.$message.error("儲存失敗");
      } finally {
        this.formStatus.saving = false;
      }
    },

    async submitForm() {
      if (await this.validateForm()) {
        this.formStatus.submitting = true;
        try {
          // 這裡之後可以直接替換成真實的 API 呼叫
          await this.updateMockGroupBuying({
            ...this.formData,
            status: "submitted"
          });
          this.$message.success("表單已更新");
          this.$router.push("/groupbuying/list");
        } catch (error) {
          this.$message.error("更新失敗");
        } finally {
          this.formStatus.submitting = false;
        }
      }
    }
  },
  computed: {
    isEditable() {
      return getStatusActions(this.formData.activeTab).canLook;
    },
    canToggleBonus() {
      return getStatusActions(this.formData.activeTab).canToggleBonus;
    },
    canSubmit() {
      return getStatusActions(this.formData.activeTab).canSubmit;
    },
    canCheck() {
      return getStatusActions(this.formData.activeTab).canCheck;
    },
    isFormDisabled() {
      return !this.canCheck || this.formStatus.isProcessing;
    }
  }
};
</script>

<style lang="scss" scoped>
.create-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .status-tip {
    margin-bottom: 20px;
  }
}
</style>
