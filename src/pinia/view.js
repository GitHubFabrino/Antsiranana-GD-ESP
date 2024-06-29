import { ref } from "vue";
import { defineStore } from "pinia";

export const useViewStore = defineStore("view", () => {
  const selected = ref("Authentification");

  function set(view) {
    selected.value = view;
  }

  return {
    selected,
    set,
  };
});
