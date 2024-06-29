import { Cookies } from "@/plugins/cookies";
import { Service } from "@/plugins/service";
import { defineStore } from "pinia";

import { ref } from "vue";

export const useStatusStore = defineStore("status", () => {
  const service = new Service();
  const cookies = new Cookies();

  const list = ref(null);
  const fonction = ref([]);

  function getAll() {
    if (service.verifyIfNotEmpty(cookies.get("status")))
      return cookies.get("status").split(",");
    else return [];
  }

  return {
    list,
    fonction,
    getAll,
  };
});
