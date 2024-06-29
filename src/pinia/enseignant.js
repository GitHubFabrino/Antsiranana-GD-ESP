// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";

// import Vuejs's plugins
import { ref } from "vue";

// import Pinia's plugins
import { defineStore } from "pinia";

// import my pinia plugins
import { useOverlayStore } from "./overlay";
import { useAlertStore } from "./alert";

// export this store
export const useEnseignantStore = defineStore("enseignant", () => {
  // instance my plugins
  const restApi = new RestApi();
  const service = new Service();

  // instance my pinia plugins
  const overlay = useOverlayStore();
  const alert = useAlertStore();

  // create variables
  const list = ref([]);
  const id = ref(null);
  const nom = ref(null);
  const prenoms = ref(null);
  const email = ref(null);
  const status = ref(null);
  const grade = ref(null);
  const specialite = ref(null);
  const fullName = ref(null);
  const listJury = ref(null)

  // creating an "Enseignant"
  function create(data) {
    overlay.show();
    restApi
      .post(`/api/enseignant`, data)
      .then((response) => {
        if (response.status == 200) {
          overlay.hide();
          alert.successSave();
          restApi
            .get(`/api/enseignant`)
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
          grade.value = null;
          specialite.value = null;
        }
      })
      .catch((error) => {
        alert.error();
        overlay.hide();
      });
  }

  // deleting an "Enseignant"
  function updateEnseignant(data) {
    if (service.verifyIfNotEmpty(data.id)) {
      overlay.show();
      restApi
        .put(`/api/enseignant/${data.id}`, Array(data))
        .then((response) => {
          if (response.status === 200) {
            overlay.hide();
            alert.successSave();
          }
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }

  // fullName
  function setAllFullName() {
    list.value.map((item) => {
      item.fullName = `${item.nom} ${item.prenoms}`;
    });
  }

  function getFullName(id) {
    fullName.value = null;
    list.value.map((item) => {
      if (item.id == id) fullName.value = `${item.nom} ${item.prenoms}`;
    });
    return fullName.value;
  }

  return {
    listJury,
    list,
    id,
    nom,
    prenoms,
    email,
    status,
    grade,
    specialite,
    create,
    updateEnseignant,
    setAllFullName,
    getFullName,
  };
});
