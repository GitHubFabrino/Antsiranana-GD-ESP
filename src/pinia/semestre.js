import { ref } from "vue";
import { defineStore } from "pinia";
import { useNiveauStore } from "./niveau";

export const useSemestreStore = defineStore("semestre", () => {
  const niveau = useNiveauStore();

  const list = ref([]);
  const id = ref(null);
  const listByNiveau = ref([]);

  function getSemestre(id) {
    const result = ref(null);
    list.value.map((item) => {
      if (item.id == id) result.value = item.semestre;
    });
    return result.value;
  }

  function setByNiveau(data) {
    listByNiveau.value = [];
    switch (data) {
      case niveau.list[0].id:
        listByNiveau.value.push(list.value[0]);
        listByNiveau.value.push(list.value[1]);
        break;
      case niveau.list[1].id:
        listByNiveau.value.push(list.value[2]);
        listByNiveau.value.push(list.value[3]);
        break;
      case niveau.list[2].id:
        listByNiveau.value.push(list.value[4]);
        listByNiveau.value.push(list.value[5]);
        break;
      case niveau.list[3].id:
        listByNiveau.value.push(list.value[6]);
        listByNiveau.value.push(list.value[7]);
        break;
      case niveau.list[4].id:
        listByNiveau.value.push(list.value[8]);
        listByNiveau.value.push(list.value[9]);
        break;
    }
  }

  return {
    list,
    id,
    listByNiveau,
    getSemestre,
    setByNiveau,
  };
});
