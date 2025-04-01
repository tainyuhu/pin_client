import { reactive } from "vue";

export default function useFormValidation() {
  const rules = {
    "basicInfo.title": [
      { required: true, message: "請輸入活動標題", trigger: "blur" }
    ]
    // Other validation rules
  };

  const validateForm = formRef => {
    return new Promise(resolve => {
      formRef.validate(valid => {
        resolve(valid);
      });
    });
  };

  return {
    rules,
    validateForm
  };
}
