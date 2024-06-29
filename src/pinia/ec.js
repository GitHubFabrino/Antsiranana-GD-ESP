// import my plugins
import { Service } from "@/plugins/service";
import { RestApi } from "@/plugins/restApi";

// import Vuejs's plugins
import { ref } from "vue";

// import Pinia's plugins
import { defineStore } from "pinia";

// import Vuejs's plugins
import { useAlertStore } from "./alert";
import { useOverlayStore } from "./overlay";

// export this store
export const useECStore = defineStore("ec", () => {
  // instance my plugins
  const service = new Service();
  const restApi = new RestApi();

  // instance my pinia plugins
  const alert = useAlertStore();
  const overlay = useOverlayStore();

  // create variables
  const list = ref([]);
  const id = ref(null);

  // deleting EC
  function deleteEC(data) {
    if (service.verifyIfNotEmpty(data.index)) {
      service.removeFromArrayByIndex(list.value, data.index);
      if (service.verifyIfNotEmpty(data.id)) {
        restApi
          .delete(`/api/element-constitutif/${data.id}`)
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

  // saving EC
  function save() {
    let requestPostData = [];
    let requestPutData = [];
    list.value.map((item) => {
      if (service.verifyIfNotEmpty(item.id)) requestPutData.push(item);
      else if (service.verifyFormIfOK(item)) requestPostData.push(item);
    });
    overlay.show();
    Promise.all([
      restApi.post(`/api/element-constitutif`, requestPostData),
      restApi.put(`/api/element-constitutif`, requestPutData),
    ])
      .then((response) => {
        alert.successSave();
        restApi
          .get(`/api/element-constitutif`)
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

  function getEC(id) {
    const nomEC = ref(null);
    if (service.verifyIfNotEmpty(id)) {
      list.value.map((item) => {
        if (item.id == id) nomEC.value = item.nomEC;
      });
    }
    return nomEC.value;
  }

  return {
    list,
    id,
    deleteEC,
    save,
    getEC,
  };
});
