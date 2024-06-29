// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";

// import Vuejs's plugins
import { ref, onBeforeMount } from "vue";

// import Pinia's plugins
import { defineStore } from "pinia";

// import my pinia plugins
import { useAlertStore } from "./alert";
import { useOverlayStore } from "./overlay";
import { useSemestreStore } from "./semestre";
import { useNiveauStore } from "./niveau";
import { useEnseignantStore } from "./enseignant";
import { useAnneeUniversitaireStore } from "./anneeUniversitaire";

// export this store
export const useParcoursStore = defineStore("parcours", () => {
  // instance my plugins
  const restApi = new RestApi();
  const service = new Service();

  // instance my pinia plugins
  const alert = useAlertStore();
  const overlay = useOverlayStore();
  const semestre = useSemestreStore();
  const niveau = useNiveauStore();
  const enseignant = useEnseignantStore();
  const anneeUniversitaire = useAnneeUniversitaireStore();

  // create variables
  const list = ref([]);
  const designation = ref(null);
  const acronyme = ref(null);
  const id = ref(null);
  const listWithSemestre = ref([]);
  const listResponsableParcours = ref([]);
  const listWithAuthorization = ref([]);
  const hide = ref(false);
  const listWithSecondSemestre = ref([]);

  // saving parcours
  function saveParcours() {
    const requestPostData = ref([]);
    const requestPutData = ref([]);
    list.value.map((item) => {
      if (service.verifyIfNotEmpty(item.id)) {
        requestPutData.value.push(item);
      } else {
        requestPostData.value.push(item);
      }
    });
    if (service.verifyIfNotEmpty(requestPostData.value)) {
      overlay.show();
      restApi
        .post(`/api/definition-parcours`, requestPostData.value)
        .then((response) => {
          if (response.status == 200) alert.successSave();
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
    if (service.verifyIfNotEmpty(requestPutData.value)) {
      overlay.show();
      restApi
        .put(`/api/definition-parcours`, requestPutData.value)
        .then((response) => {
          if (response.status == 200) alert.successSave();
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }

  // deleting parcours
  function deleteParcours(data) {
    if (service.verifyIfNotEmpty(data)) {
      list.value.splice(data.index, 1);
      if (service.verifyIfNotEmpty(data.item.id)) {
        overlay.show();
        restApi
          .delete(`/api/definition-parcours/${data.item.id}`)
          .then((response) => {
            if (response.status === 200) alert.successDelete();
            overlay.hide();
          })
          .catch((error) => {
            alert.error();
            console.error(error);
            overlay.hide();
          });
      }
    }
  }

  // prepare list parcours with semestre
  function prepareListWithSemestre() {
    listWithSemestre.value = [];
    list.value.map((item) => {
      if (item.idNiveau === niveau.id) {
        listWithSemestre.value.push({
          id: item.id,
          designation: String(
            `${item.acronymeParcours} - ${semestre.getSemestre(
              item.idSemestre
            )}`
          ),
        });
      }
    });
  }

  // creating a "Responsable parcours"
  function createResponsableParcours(data) {
    if (service.verifyIfNotEmpty(data)) {
      overlay.show();
      restApi
        .post(`/api/responsable-parcours`, data)
        .then((response) => {
          if (response.status == 200) alert.successSave();
          overlay.hide();
          id.value = null;
          enseignant.id = null;
          if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
            restApi
              .get(`/api/responsable-parcours/annee/${anneeUniversitaire.id}`)
              .then((response) => {
                listResponsableParcours.value = response.data;
              })
              .catch((error) => {
                alert.error();
                console.error(error);
              });
          }
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }

  // deleting a "Responsable parcours"
  function deleteResponsableParcours(data) {
    if (service.verifyIfNotEmpty(data)) {
      listResponsableParcours.value.splice(data.index, 1);
      if (service.verifyIfNotEmpty(data.value.id)) {
        overlay.show();
        restApi
          .delete(`/api/responsable-parcours/${data.value.id}`)
          .then((response) => {
            if (response.status === 200) alert.successDelete();
            overlay.hide();
            if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
              restApi
                .get(`/api/responsable-parcours/annee/${anneeUniversitaire.id}`)
                .then((response) => {
                  listResponsableParcours.value = response.data;
                })
                .catch((error) => {
                  alert.error();
                  console.error(error);
                });
            }
          })
          .catch((error) => {
            alert.error();
            console.error(error);
            overlay.hide();
          });
      }
    }
  }

  // setting list DP for RESPONSABLE_PARCOURS
  function setListWithAuthorisation(id) {
    listWithAuthorization.value = [];
    list.value.map((item) => {
      if (item.idEnseignant == id) {
        if (item.idNiveau == niveau.id) {
          listWithAuthorization.value.push({
            id: item.id,
            designation: String(
              `${item.acronymeParcours} - ${semestre.getSemestre(
                item.idSemestre
              )}`
            ),
          });
        }
      }
    });
  }

  function getByNiveau(idNiveau) {
    if (service.verifyIfEmpty(idNiveau)) return list.value;
    if (service.verifyIfNotEmpty(idNiveau))
      return list.value.filter((item) => item.idNiveau === idNiveau);
  }

  function getResponsable(id) {
    return list.value.filter((item) => item.idEnseignant == id);
  }

  function prepareListWithSecondSemestre() {
    listWithSecondSemestre.value = [];
    list.value.map((item) => {
      if (
        Boolean(item.idNiveau === niveau.id) &&
        Boolean(item.idSemestre % 2 === 0)
      ) {
        listWithSecondSemestre.value.push({
          id: item.id,
          designation: String(
            `${item.acronymeParcours} - ${semestre.getSemestre(
              item.idSemestre
            )}`
          ),
        });
      }
    });
  }

  function getParcours(id) {
    if (service.verifyIfNotEmpty(id)) {
      let oneParcours = list.value.filter((item) => item.id == id);
      return oneParcours[0].parcours;
    }
  }

  onBeforeMount(() => {
    restApi
      .get(`/api/semestre`)
      .then((response) => {
        semestre.list = response.data;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  });

  return {
    list,
    designation,
    acronyme,
    id,
    listWithSemestre,
    listResponsableParcours,
    listWithAuthorization,
    hide,
    listWithSecondSemestre,
    saveParcours,
    deleteParcours,
    prepareListWithSemestre,
    createResponsableParcours,
    deleteResponsableParcours,
    setListWithAuthorisation,
    getByNiveau,
    getResponsable,
    prepareListWithSecondSemestre,
    getParcours,
  };
});
