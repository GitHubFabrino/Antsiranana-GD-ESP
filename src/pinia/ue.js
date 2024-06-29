// import my plugins
import { Service } from "@/plugins/service";

// import pinia's plugins
import { defineStore } from "pinia";

// export this store
export const useUEStore = defineStore("ue", () => {
  // instance my plugins
  const service = new Service();

  // get Observation
  function getObservation(data) {
    // if (service.verifyIfNotEmpty(data)) {
    switch (data) {
      case 0:
        return "Non validée";
      case 1:
        return "Validée";
      case 2:
        return "Validée par compensation";
      case 3:
        return "Validée sous condition";
    }
    // }
  }

  return {
    getObservation,
  };
});
