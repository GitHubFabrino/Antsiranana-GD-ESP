// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";

// import Vuejs's plugins
import { ref } from "vue";

// import Pinia's plugins
import { defineStore } from "pinia";

// import my pinia plugins
import { useAlertStore } from "./alert";
import { useDialogStore } from "./dialog";
import { useNiveauStore } from "./niveau";
import { useOverlayStore } from "./overlay";
import { useAnneeUniversitaireStore } from "./anneeUniversitaire";

// export this store
export const useInscriptionStore = defineStore("inscription", () => {
  // instance my plugins
  const restApi = new RestApi();
  const service = new Service();

  // instance my pinia plugins
  const alert = useAlertStore();
  const dialog = useDialogStore();
  const niveau = useNiveauStore();
  const overlay = useOverlayStore();
  const anneeUniversitaire = useAnneeUniversitaireStore();

  // create variables
  const autorisations = ref([]);
  const administrative = ref([]);
  const pedagogique = ref([]);

  // authorize the students
  function giveAutorisations(data) {
    autorisations.value.map((etudiant) => {
      if (data.id == etudiant.id) etudiant.autorisation = true;
    });
    overlay.show();
    console.log(data);
    
    restApi
      .put(`/api/autorisation/${data.id}`, data)
      .then((response) => {
        if (response.status === 200) {
          if (service.verifyIfNotEmpty(response.data)) {
            alert.successSave();
            console.log(response.data);
            dialog.show(
              "L'authentification de l’étudiant !",
              "DialogCreerAuthentificationEtudiant",
              response.data
            );
          }
          if (service.verifyIfEmpty(response.data)) {
            alert.add("warning", "Le numéro du reçu existant !");
            data.numeroRecu = null;
          }
          restApi
            .get(
              `/api/autorisation/niveau/${niveau.id}/au/${anneeUniversitaire.id}`
            )
            .then((response) => {
              autorisations.value = response.data;
            })
            .catch((error) => {
              alert.error();
              console.error(error);
              overlay.hide();
            });
        }
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error( error);
        overlay.hide();
      });
  }

  // unauthorise Student
  function removeAutorisations(data) {
    autorisations.value.map((etudiant) => {
      if (data.id == etudiant.id) etudiant.autorisation = false;
    });
    restApi
      .put(`/api/autorisation/${data.id}`, data)
      .then((response) => {
        if (response.status === 200)
          alert.add("success", "Autorisation annulée !");
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  }

  // auto Filter List
  function filterAutorisations(nom) {
    if (service.verifyIfEmpty(nom)) return autorisations.value;
    else {
      return autorisations.value.filter((candidat) => {
        return candidat.nom.match(nom);
      });
    }
  }

  //auto filter
  function filteradministrative(nom) {
    if (service.verifyIfEmpty(nom)) return administrative.value;
    else {
      return administrative.value.filter((c) => {
        return c.nom.match(nom);
      });
    }
  }

  // validate Inscription Administrative
  function validate(id, validite) {
    if (service.verifyIfNotEmpty(id)) {
      overlay.show();
      restApi
        .put(`/api/inscription-administrative/${id}`, { validiteIA: validite })
        .then((response) => {
          if (response.status === 200) {
            if (validite)
              alert.add("success", "Inscription administrative validée !");
            else alert.add("success", "Inscription administrative invalidée !");
            if (
              service.verifyIfNotEmpty(niveau.id) &&
              service.verifyIfNotEmpty(anneeUniversitaire.id)
            ) {
              restApi
                .get(
                  `/api/inscription-administrative/annee/${anneeUniversitaire.id}/niveau/${niveau.id}`
                )
                .then((response) => {
                  administrative.value = response.data;
                })
                .catch((error) => {
                  alert.error();
                  console.error(error);
                });
            }
          }
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }

  // validate "Inscription pedagogique"
  function validerInscriptionPedagogique() {
    if (service.verifyIfNotEmpty(pedagogique.value)) {
      let requestPutData = [];
      pedagogique.value.map((item) => {
        requestPutData.push({
          id: item.id,
          validiteIP: item.validiteIP,
        });
      });

      overlay.show();
      restApi
        .put(`/api/cursus/inscription-pedagogique`, requestPutData)
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
    autorisations,
    administrative,
    pedagogique,
    filterAutorisations,
    giveAutorisations,
    removeAutorisations,
    validate,
    validerInscriptionPedagogique,
    filteradministrative,
  };
});
