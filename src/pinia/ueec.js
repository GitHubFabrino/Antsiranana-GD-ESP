// import my plugins
import { Service } from "@/plugins/service";
import { RestApi } from "@/plugins/restApi";

// import Vuejs's plugins
import { ref, onBeforeMount } from "vue";

// import pinia's plugins
import { defineStore } from "pinia";

// import pinia plugins
import { useAlertStore } from "./alert";
import { useECStore } from "./ec";
import { useUEStore } from "./ue";
import { useOverlayStore } from "./overlay";

// export this store
export const useUEECStore = defineStore("ueec", () => {
  // instance my pinia plugins
  const alert = useAlertStore();
  const ec = useECStore();
  const ue = useUEStore();
  const overlay = useOverlayStore();

  // instance my plugins
  const service = new Service();
  const restApi = new RestApi();

  // create variables
  const list = ref([]);
  const listNomUEEC = ref([]);
  const id = ref(null);

  // associer UE et EC
  function associerUEEC(data) {
    if (service.verifyIfNotEmpty(data)) {
      overlay.show();
      restApi
        .post(`/api/associer-ue-ec`, Array(data))
        .then((response) => {
          alert.successSave();
          restApi
            .get(`/api/associer-ue-ec`)
            .then((response) => {
              list.value = response.data;
            })
            .catch((error) => {
              alert.error();
              console.error(error);
            });
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }

  // update UE et EC
  function updateUEEC(data) {
    if (service.verifyIfNotEmpty(data)) {
      restApi
        .put(`/api/associer-ue-ec`, Array(data))
        .then((response) => {
          alert.successSave();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    }
  }

  // delete UE et EC
  function deleteUEEC(data) {
    if (service.verifyIfNotEmpty(data)) {
      service.removeFromArrayByIndex(list.value, data.index);
      if (service.verifyIfNotEmpty(data.value.id)) {
        restApi
          .delete(`/api/associer-ue-ec/${data.value.id}`)
          .then((response) => {
            alert.successDelete();
          })
          .catch((error) => {
            alert.error();
            console.error(error);
          });
      }
    }
  }

  function setListByNomUEEC() {
    if (service.verifyIfNotEmpty(list.value)) {
      listNomUEEC.value = [];
      list.value.map((item) => {
        listNomUEEC.value.push({
          id: item.id,
          nomUEEC: String(`${ue.getUE(item.idUE)} -> ${ec.getEC(item.idEC)}`),
        });
      });
    }
  }

  onBeforeMount(() => {
    Promise.all([
      restApi.get(`/api/unite-enseignement`),
      restApi.get(`/api/element-constitutif`),
    ])
      .then((response) => {
        ue.list = response[0].data;
        ec.list = response[1].data;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  });

  return {
    list,
    listNomUEEC,
    id,
    associerUEEC,
    updateUEEC,
    deleteUEEC,
    setListByNomUEEC,
  };
});
