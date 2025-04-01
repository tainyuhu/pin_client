<!-- create.vue -->
<template>
  <div class="app-container">
    <div class="create-container">
      <page-header
        :status="formData.status"
        :saving="formStatus.saving"
        :submitting="formStatus.submitting"
        @save-draft="saveDraft"
        @submit="submitForm"
        @preview="showPreview = true"
      />

      <!-- 預覽對話框組件 -->
      <preview-dialog v-model="showPreview" :form-data="formData" />

      <el-form ref="form" :model="formData" :rules="rules" label-position="top">
        <activity-status :status="formData.status" />
        <basic-info
          :value="formData.basicInfo"
          @input="updateBasicInfo"
          :disabled="formStatus.isProcessing"
        />
        <target-audience v-model="formData.targetAudience" :disabled="false" />
        <promotion-settings
          :value="formData.promotion"
          @input="updatePromotion"
          :disabled="formStatus.isProcessing"
        />
        <product-list
          :value="formData.products"
          @input="updateProducts"
          :promotion-type="formData.promotion.type"
          :disabled="formStatus.isProcessing"
        />
        <delivery-settings
          :value="formData.delivery"
          @input="updateDelivery"
          :disabled="formStatus.isProcessing"
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
import ActivityStatus from "./components/ActivityStatus.vue";
import TargetAudience from "./components/TargetAudience.vue";

export default {
  name: "GroupBuyingCreate",

  components: {
    PageHeader,
    BasicInfo,
    PromotionSettings,
    ProductList,
    DeliverySettings,
    PreviewDialog,
    ActivityStatus,
    TargetAudience
  },

  data() {
    return {
      showPreview: false,
      formData: {
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
        targetAudience: {
          filters: [],
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
          addressPickup: false
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

  methods: {
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
        await this.saveFormData("draft");
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
          await this.saveFormData("submitted");
          this.$message.success("表單已送出");
          this.$router.push("/groupbuying/list");
        } catch (error) {
          this.$message.error("送出失敗");
        } finally {
          this.formStatus.submitting = false;
        }
      }
    },

    async saveFormData(status) {
      // API 實作
      console.log("Saving form data:", { ...this.formData, status });
    }
  }
};
</script>

<style lang="scss" scoped>
.create-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
