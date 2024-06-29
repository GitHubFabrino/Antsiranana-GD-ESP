import { ref } from "vue";

import { defineStore } from "pinia";

export const useSexeStore = defineStore("sexe", () => {
  const list = ref([{ genre: "Masculin" }, { genre: "Féminin" }]);
  const selected = ref(null);

  return {
    list,
    selected,
  };
});
