import { ref } from "vue";
import { defineStore } from "pinia";

export const useOverlayStore = defineStore("overlay", () => {
  const state = ref(false);

  function show() {
    state.value = true;
  }

  function hide() {
    state.value = false;
  }

  return {
    state,
    show,
    hide,
  };
});
