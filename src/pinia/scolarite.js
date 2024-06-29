// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";

// import Vuejs's plugins
import { reactive, ref } from "vue";

// import Pinia's plugins
import { defineStore } from "pinia";

// import my pinia plugins
import { useAlertStore } from "./alert";
import { useOverlayStore } from "./overlay";

// export this store
export const useScolariteStore = defineStore("scolarite", () => {
  // instance my plugins
  const restApi = new RestApi();
  const service = new Service();

  // instance my pinia plugins
  const alert = useAlertStore();
  const overlay = useOverlayStore();

  // create variables
  const access = reactive({
    gestionConcoursTCI: false,
    gestionInscription: false,
    gestionAccesTache: false,
  });
  const list = ref([]);
  const nom = ref(null);
  const prenoms = ref(null);
  const email = ref(null);
  const status = ref(null);
  const gestionConcoursTCI = ref(false);
  const gestionInscription = ref(false);
  const gestionAccesTache = ref(false);

  // creating a "Scolarite"
  function create(data) {
    if (service.verifyIfNotEmpty(data)) {
      overlay.show();
      restApi
        .post(`/api/scolarite`, data)
        .then((response) => {
          if (response.status == 200) {
            overlay.hide();
            alert.successSave();
            restApi
              .get(`/api/scolarite`)
              .then((response) => {
                list.value = response.data;
              })
              .catch((error) => {
                alert.error();
                console.error(error);
              });
            nom.value = null;
            prenoms.value = null;
            email.value = null;
            status.value = null;
            gestionConcoursTCI.value = false;
            gestionInscription.value = false;
            gestionAccesTache.value = false;
          }
        })
        .catch((error) => {
          alert.error();
          overlay.hide();
        });
    }
  }

  // Deleting a "Scolarite"
  function deleteScolarite(data) {
    if (service.verifyIfNotEmpty(data)) {
      overlay.show();
      restApi
        .delete(`/api/scolarite/${data.value.id}`)
        .then((response) => {
          if (response.status === 200) {
            overlay.hide();
            alert.successDelete();
            service.removeFromArrayByIndex(list.value, data.index);
          }
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }

  // Updating a "Scolarite"
  function update() {
    if (service.verifyIfNotEmpty(list.value)) {
      overlay.show();
      restApi
        .put(`/api/scolarite/tache`, list.value)
        .then((response) => {
          if (response.status === 200) alert.successSave();
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }

  return {
    access,
    list,
    nom,
    prenoms,
    email,
    status,
    gestionConcoursTCI,
    gestionInscription,
    gestionAccesTache,
    create,
    deleteScolarite,
    update,
  };
});
