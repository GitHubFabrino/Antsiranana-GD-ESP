// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";

// import Vuejs's plugins
import { ref, reactive } from "vue";

// import Pinia's plugins
import { defineStore } from "pinia";

// import my Pinia plugins
import { useAlertStore } from "./alert";
import { useOverlayStore } from "./overlay";

// export this store
export const useDirectionStore = defineStore("direction", () => {
  // instance of my plugins
  const restApi = new RestApi();
  const service = new Service();

  // instance of my pinia plugins
  const alert = useAlertStore();
  const overlay = useOverlayStore();

  // state to give access on action
  const access = reactive({
    gestionUtilisateur: false,
    gestionSeminairePedagogiques: false,
  });

  // create variables
  const list = ref([]);
  const nom = ref(null);
  const prenoms = ref(null);
  const email = ref(null);
  const status = ref(null);
  const gestionUtilisateur = ref(false);
  const gestionSeminairePedagogiques = ref(false);
  const directeur = ref(null);

  // create a Direction
  function create(data) {
    if (service.verifyIfNotEmpty(data)) {
      overlay.show();
      restApi
        .post(`/api/direction`, data[0])
        .then((response) => {
          if (response.status == 200) {
            overlay.hide();
            alert.successSave();
            restApi
              .get(`/api/direction`)
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
            gestionUtilisateur.value = false;
            gestionSeminairePedagogiques.value = false;
          }
        })
        .catch((error) => {
          alert.error();
          overlay.hide();
        });
    }
  }

  // delete a Direction
  function deleteDirection(data) {
    if (service.verifyIfNotEmpty(data)) {
      overlay.show();
      restApi
        .delete(`/api/direction/${data.value.id}`)
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

  // update a direction
  function updateDirection() {
    restApi
      .put(`/api/direction`, list.value)
      .then((response) => {
        if (response.status == 200) alert.successSave();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  }

  return {
    access,
    list,
    nom,
    prenoms,
    email,
    status,
    gestionUtilisateur,
    gestionSeminairePedagogiques,
    directeur,
    create,
    deleteDirection,
    updateDirection,
  };
});
