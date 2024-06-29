// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Cookies } from "@/plugins/cookies";

// import Vuejs's plugins
import { ref } from "vue";

// import pinia's plugins
import { defineStore } from "pinia";

// import my plugins
import { useAlertStore } from "./alert";
import { useParcoursStore } from "./parcours";
import { useOverlayStore } from "./overlay";
import { usedisableStore } from "@/pinia/disable";

// export this store
export const usePEStore = defineStore("pe", () => {
  // instance my plugins
  const restApi = new RestApi();
  const service = new Service();
  const cookies = new Cookies();

  // instance my pinia plugins
  const alert = useAlertStore();
  const parcours = useParcoursStore();
  const overlay = useOverlayStore();
  const disable = usedisableStore();

  // create variables
  const list = ref([]);
  const id = ref(null);
  const UE = ref([
    {
      nomUE: null,
      codeUE: 0,
      idEnseignant: null,
    },
  ]);
  const EC = ref([
    {
      nomEC: null,
      codeEC: Number(0),
      idEnseignant: null,
      creditEC: Number(0),
      volumeHoraireET: Number(0),
      volumeHoraireED: Number(0),
      volumeHoraireTP: Number(0),
      idEC: 0,
    },
  ]);
  const listEC = ref([]);
  const listUE = ref([]);
  const idEC = ref(null);
  const idUEEC = ref(null);

  // save
  function save(data) {
    if (service.verifyIfNotEmpty(data)) {
      overlay.show();
      restApi
        .post(`/api/programme-enseignement/dp/${parcours.id}`, data)
        .then((response) => {
          if (response.status == 200) {
            alert.successSave();
            resetPE();
            if (service.verifyIfNotEmpty(parcours.id)) {
              restApi
                .get(`/api/programme-enseignement/dp/${parcours.id}`)
                .then((response) => {
                })

                .catch((error) => {
                  alert.error();
                  console.error(error);
                });
            }
            overlay.hide();
          }
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }

  // reset data
  function resetPE() {
    UE.value = [
      {
        nomUE: null,
        codeUE: 0,
        idEnseignant: null,
      },
    ];
    EC.value = [
      {
        nomEC: null,
        codeEC: Number(0),
        idEnseignant: null,
        creditEC: Number(0),
        volumeHoraireET: Number(0),
        volumeHoraireED: Number(0),
        volumeHoraireTP: Number(0),
        idEC: 0,
      },
    ];
  }

  // formatting the list
  function setList(idParcours) {
    if (
      service.verifyIfNotEmpty(idParcours) &&
      service.verifyIfNotEmpty(list.value)
    ) {
      list.value.map((item) => {
        ueec.list.map((itemUEEC) => {
          if (itemUEEC.id == item.idUEEC) {
            parcours.listWithSemestre.map((itemDP) => {
              if (itemDP.id == item.idDP) {
                item.parcours = itemDP.designation;
                item.nomUE = ue.getUE(itemUEEC.idUE);
                item.nomEC = ec.getEC(itemUEEC.idEC);
              }
            });
          }
        });
      });
    }
  }

  // deleting a PE
  function deletePE(data) {
    if (service.verifyIfNotEmpty(data)) {
      if (service.verifyIfNotEmpty(data)) {
        overlay.show();
        restApi
          .delete(`/api/programme-enseignement/code-ec/${data}`)
          .then((response) => {
            alert.successDelete();
            overlay.hide();
            if (service.verifyIfNotEmpty(parcours.id)) {
              restApi
                .get(`/api/programme-enseignement/dp/${parcours.id}`)
                .then((response) => {
                  list.value = response.data;
                });
              // .catch((error) => {
              //   // alert.error();
              //   console.error(error);
              // });
            }
          });
        // .catch((error) => {
        //   // alert.error();
        //   console.error(error);
        // });
      }
      overlay.hide();
      disable.disableTwo = true;
      setTimeout(() => {
        disable.disableTwo = false;
      }, 5000);
    }
  }

  // for getting the id of PE
  function getIdPE(idDP, idUEEC) {
    id.value = null;
    if (service.verifyIfNotEmpty(idDP) && service.verifyIfNotEmpty(idUEEC)) {
      list.value.map((item) => {
        if (item.idDP == idDP && item.idUEEC == idUEEC) id.value = item.id;
      });
    }
    return id.value;
  }

  function prepareListUE() {
    listUE.value = [];
    list.value.map((item) => {
      listUE.value.push({
        nomUE: item.nomUE[0],
        idEnseignant: item.responsableUE[0].idEnseignant,
        fullName: item.responsableUE[0].nom,
      });
    });
  }

  function prepareListEC() {
    listEC.value = [];
    list.value.map((item) => {
      for (let i = 0; i < item.codeEC.length; i++) {
        listEC.value.push({
          nomEC: item.nomEC[i].nomEC,
          codeEC: item.codeEC[i],
          idEnseignant: item.responsableEC[i].idEnseignant,
          fullName: item.responsableEC[i].nom,
          idEC: item.nomEC[i].id,
          idUEEC: item.idUEEC[i],
        });
      }
    });
  }

  function prepareListECAvailable() {
    restApi
      .get(`/api/enseignant/personne/${cookies.get("idPersonne")}`)
      .then((response) => {
        if (
          parcours.list.find(
            (item) =>
              item.idEnseignant == response.data.id && item.id == parcours.id
          )
        ) {
          prepareListEC();
        } else {
          listEC.value = listEC.value.filter(
            (item) => item.idEnseignant == response.data.id
          );
        }
        // parcours.getResponsable(response.data.id)
        // if (listUE.value.find(item => (item.idEnseignant == response.data.id))) {
        //   prepareListEC();
        // }
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  }

  return {
    list,
    id,
    UE,
    EC,
    listUE,
    listEC,
    idEC,
    idUEEC,
    save,
    setList,
    deletePE,
    getIdPE,
    resetPE,
    prepareListUE,
    prepareListEC,
    prepareListECAvailable,
  };
});
