import { ref } from "vue";

import { defineStore } from "pinia";

export const useBaccStore = defineStore("bacc", () => {
  const list = ref([
    "Générale C",
    "Générale D",
    "Générale S",
    "Technique Electronique",
    "Technique Electrotechnique",
    "Technique Fabrication Mecanique",
    "Technique FTG",
  ]);
  const serie = ref(null);
  const annee = ref(null);

  return {
    list,
    serie,
    annee,
  };
});
