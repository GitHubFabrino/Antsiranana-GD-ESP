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
import { useEnseignantStore } from "./enseignant";
import { useUEECStore } from "./ueec";
import { usePEStore } from "./pe";
import { useAnneeUniversitaireStore } from "./anneeUniversitaire";
import { useParcoursStore } from "./parcours";

// export this store
export const useHeureEnseignementStore = defineStore(
  "heureEnseignement",
  () => {
    // instance my plugins
    const restApi = new RestApi();
    const service = new Service();

    // instance my pinia plugins
    const overlay = useOverlayStore();
    const alert = useAlertStore();
    const enseignant = useEnseignantStore();
    const ueec = useUEECStore();
    const pe = usePEStore();
    const anneeUniversitaire = useAnneeUniversitaireStore();
    const parcours = useParcoursStore();

    // create variables
    const list = ref([]);
    const listECAuthorised = ref([]);
    // const idPE = ref(null);

    // save
    function save(data) {
      if (service.verifyIfNotEmpty(data)) {
        overlay.show();
        restApi
          .post(`/api/heure-enseignement`, Array(data))
          .then((response) => {
            alert.successSave();
            overlay.hide();
            restApi
              .get(
                `/api/heure-enseignement/annee/${anneeUniversitaire.id}/dp/${parcours.id}`
              )
              .then((response) => {
                list.value = response.data;
                setListEnseignant();
                enseignant.id = null;
                ueec.id = null;
              })
              .catch((error) => {
                alert.error();
                console.error(error);
              });
          })
          .catch((error) => {
            alert.error();
            console.error(error);
            overlay.hide();
          });
      }
    }

    // format list Enseignant
    function setListEnseignant() {
      if (service.verifyIfNotEmpty(list.value)) {
        list.value.map((item) => {
          item.fullName = enseignant.getFullName(item.idEnseignant);
          pe.list.map((itemPE) => {
            if (item.idPE == itemPE.id) {
              item.nomUE = itemPE.nomUE;
              item.nomEC = itemPE.nomEC;
            }
          });
        });
      }
    }

    // deleting Enseignant EC
    function deleteEnseignantEC(data) {
      if (service.verifyIfNotEmpty(data)) {
        if (
          service.verifyIfNotEmpty(data.value.idAU) &&
          service.verifyIfNotEmpty(data.value.idEnseignant) &&
          service.verifyIfNotEmpty(data.value.idPE)
        ) {
          restApi
            .delete(
              `/api/heure-enseignement/annee/${data.value.idAU}/enseignant/${data.value.idEnseignant}/pe/${data.value.idPE}`
            )
            .then((response) => {
              alert.successDelete();
              service.removeFromArrayByIndex(list.value, data.index);
            })
            .catch((error) => {
              alert.error();
              console.error(error);
            });
        }
      }
    }

    // update
    function update() {
      if (service.verifyIfNotEmpty(list.value)) {
        restApi
          .put(`/api/heure-enseignement`, list.value)
          .then((response) => {
            alert.successSave();
          })
          .catch((error) => {
            alert.error();
            console.error(error);
          });
      }
    }

    // Prepare the list that contains all EC autorized for the "Enseignant"
    function prepareListECAutorized() {
      list.value.map((item) => {
        if (service.verifyIfNotEmpty(enseignant.id)) {
          pe.list.map((itemPE) => {
            if (
              Boolean(itemPE.id === item.idPE) &&
              Boolean(item.idEnseignant === enseignant.id)
            ) {
              listECAuthorised.value.push({
                id: itemPE.id,
                nomPE: String(`${item.nomUE} -> ${item.nomEC}`),
              });
            }
          });
        }
      });
    }

    return {
      list,
      listECAuthorised,
      save,
      setListEnseignant,
      deleteEnseignantEC,
      update,
      prepareListECAutorized,
    };
  }
);
