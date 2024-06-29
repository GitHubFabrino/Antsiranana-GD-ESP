import { Service } from "@/plugins/service";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAlertStore = defineStore("alert", () => {
  const service = new Service();

  const list = ref([]);

  function add(type, message) {
    // genere un id unique
    const id = ref(service.getUUID());

    // verifie si le message à ajouter existe déja dans la list
    if (!list.value.some((item) => item.message == message)) {
      // ajoute un obj à la fin de list
      // expliquation reformatJSON dans service.js
      list.value.push(
        service.reformatJSON({
          id: id.value,
          type,
          message,
          isShow: true,
        })
      );

      // mamafa valeur miverina indroa anaty tableau iray
      list.value = service.removeDuplicateObject(list.value);
      setTimeout(() => {
        //mamafa liste.value sy index nazy après 5s
        service.removeFromArrayByIndex(
          list.value,
          list.value.findIndex((item) => item.id == id.value)
        );
      }, 5000);
    }
  }

  function successSave() {
    add("success", "Enregistrement réussi !");
  }

  function successDelete() {
    add("success", "Suppression réussie !");
  }

  function error() {
    add("error", "Erreur !");
  }

  function warningForm() {
    add("warning", "Formulaire invalide !");
  }

  async function remove(index) {
    service.removeFromArrayByIndex(list.value, index);
  }

  return {
    list,
    add,
    successSave,
    successDelete,
    error,
    warningForm,
    remove,
  };
});
