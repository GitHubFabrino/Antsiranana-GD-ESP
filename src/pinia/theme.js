import { ref, onBeforeMount } from "vue";
import { defineStore } from "pinia";
import { Cookies } from "@/plugins/cookies";

export const useThemeStore = defineStore("theme", () => {
  const cookies = new Cookies();

  const selected = ref("dark");

  function set(theme) {
    selected.value = theme;
    cookies.set("theme", `${theme}`);
  }

  function isDark() {
    return cookies.get("theme") == "dark" ? true : false;
  }

  function toggle() {
    if (isDark() == true) set("light");
    else if (isDark() == false) set("dark");
  }

  onBeforeMount(() => {
    if (isDark() == true) set("dark");
    else if (isDark() == false) set("light");
  });

  return {
    selected,
    set,
    isDark,
    toggle,
  };
});
