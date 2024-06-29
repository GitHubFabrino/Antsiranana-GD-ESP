import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";

import { defineStore } from "pinia";

import { ref } from "vue";
import { useAlertStore } from "./alert";
import { useOverlayStore } from "./overlay";

export const useDroitStore = defineStore("droit", () => {
  const restApi = new RestApi();
  const service = new Service();

  const overlay = useOverlayStore();
  const alert = useAlertStore();

  const list = ref([]);
  const montant = ref(null);
  const nomBanque = ref(null);
  const numeroCompte = ref(null);

  function deleteRegistrationRights(data) {
    if (service.verifyIfNotEmpty(data)) {
      list.value.splice(data.index, 1);
      if (service.verifyIfNotEmpty(data.item.idDD)) {
        overlay.show();
        restApi
          .remove(`/api/definition-droit/${data.item.idDD}`)
          .then((response) => {
            if (response.status == 200) alert.successDelete();
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

  function defineRegistrationRights() {
    const requestPostData = ref([]);
    const requestPutData = ref([]);
    list.value.map((item) => {
      if (service.verifyIfNotEmpty(item.idDD)) {
        requestPutData.value.push(item);
      } else {
        requestPostData.value.push(item);
      }
    });
    if (service.verifyIfNotEmpty(requestPostData.value)) {
      overlay.show();
      restApi
        .post(`/api/definition-droit`, requestPostData.value)
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
        .put(`/api/definition-droit`, requestPutData.value)
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

  return {
    list,
    montant,
    nomBanque,
    numeroCompte,
    deleteRegistrationRights,
    defineRegistrationRights,
  };
});
