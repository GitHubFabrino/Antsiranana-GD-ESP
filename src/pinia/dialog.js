import { ref } from "vue";
import { defineStore } from "pinia";

export const useDialogStore = defineStore("dialog", () => {
  const isShow = ref(false);
  const title = ref("");
  const component = ref("");
  const data = ref(null);
  const width = ref(null);
  const fullscreen = ref(false);

  function show(q, c, d) {
    isShow.value = true;
    title.value = q;
    component.value = c;
    data.value = d;
    width.value = 600;
    fullscreen.value = false;
  }

  function hide() {
    isShow.value = false;
    title.value = "";
    component.value = "";
  }

  function showForm(q, c, d) {
    isShow.value = true;
    title.value = q;
    component.value = c;
    data.value = d;
    width.value = "100%";
    fullscreen.value = false;
  }

  function showFullScreen(q, c, d) {
    isShow.value = true;
    title.value = q;
    component.value = c;
    data.value = d;
    width.value = "100%";
    fullscreen.value = true;
  }

  return {
    isShow,
    title,
    component,
    data,
    width,
    fullscreen,
    show,
    hide,
    showForm,
    showFullScreen,
  };
});
