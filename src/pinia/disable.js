import { defineStore } from "pinia";
import { ref } from "vue";

export const usedisableStore = defineStore("disable", () => {
  const disableOne = ref(false);
  const disableTwo = ref(false);
  const disableLogin = ref(true);

  function disableLoginFunction() {
    disableLogin.value = false;
  }

  return {
    disableOne,
    disableTwo,
    disableLogin,
    disableLoginFunction,
  };
});
