import { ref } from "vue";
import { defineStore } from "pinia";

export const useNiveauStore = defineStore("niveau", () => {
  const list = ref([]);
  const id = ref(null);

  function getNiveau(id) {
    const result = ref(null);
    list.value.map((item) => {
      if (item.id == id) result.value = item.niveau;
    });
    return result.value;
  }

  return {
    list,
    id,
    getNiveau,
  };
});
