// import my plugins
import { RestApi } from "@/plugins/restApi";

// import Pinia's plugins
import { defineStore } from "pinia";

// import Vuejs's plugins
import { ref } from "vue";

// import my pinia plugins
import { useAlertStore } from "./alert";

// export this store
export const usePersonneStore = defineStore("personne", () => {
  // instance my plugins
  const restApi = new RestApi();

  // instance my pinia plugins
  const alert = useAlertStore();

  // create variables
  const id = ref(null);
  const nom = ref(null);
  const prenoms = ref(null);
  const sexe = ref(null);
  const dateNaissance = ref(null);
  const lieuNaissance = ref(null);
  const villeNaissance = ref(null);
  const paysNaissance = ref(null);
  const nationalite = ref(null);
  const adresse = ref(null);
  const numeroCIN = ref(null);
  const dateDelivreCIN = ref(null);
  const villeDelivreCIN = ref(null);
  const affiliation1 = ref(null);
  const affiliation2 = ref(null);
  const anneeEntree = ref(null);
  const telephone = ref(null);
  const email = ref(null);
  const status = ref([]);
  const numero_matricule = ref(null);

  // set Personne
  function set(data) {
    id.value = data.id;
    nom.value = data.nom;
    prenoms.value = data.prenoms;
    sexe.value = data.sexe;
    dateNaissance.value = data.dateNaissance;
    lieuNaissance.value = data.lieuNaissance;
    villeNaissance.value = data.villeNaissance;
    paysNaissance.value = data.paysNaissance;
    nationalite.value = data.nationalite;
    adresse.value = data.adresse;
    numeroCIN.value = data.numeroCIN;
    dateDelivreCIN.value = data.dateDelivreCIN;
    villeDelivreCIN.value = data.villeDelivreCIN;
    affiliation1.value = data.affiliation1;
    affiliation2.value = data.affiliation2;
    anneeEntree.value = data.anneeEntree;
    telephone.value = data.telephone;
    email.value = data.email;
    numero_matricule.value = data.numero_matricule;
  }

  // edding Personne
  function edit() {
    let requestPutData = {
      id: id.value,
      nom: nom.value,
      prenoms: prenoms.value,
      sexe: sexe.value,
      dateNaissance: dateNaissance.value,
      lieuNaissance: lieuNaissance.value,
      villeNaissance: villeNaissance.value,
      paysNaissance: paysNaissance.value,
      nationalite: nationalite.value,
      adresse: adresse.value,
      numeroCIN: numeroCIN.value,
      dateDelivreCIN: dateDelivreCIN.value,
      villeDelivreCIN: villeDelivreCIN.value,
      affiliation1: affiliation1.value,
      affiliation2: affiliation2.value,
      anneeEntree: anneeEntree.value,
      telephone: telephone.value,
      email: email.value,
      numero_matricule: numero_matricule.value,
    };
    restApi
      .put(`/api/personne/${id.value}`, requestPutData)
      .then((response) => {
        alert.successSave();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  }

  return {
    id,
    numero_matricule,
    nom,
    prenoms,
    sexe,
    dateNaissance,
    lieuNaissance,
    villeNaissance,
    paysNaissance,
    nationalite,
    adresse,
    numeroCIN,
    dateDelivreCIN,
    villeDelivreCIN,
    affiliation1,
    affiliation2,
    anneeEntree,
    telephone,
    email,
    status,
    set,
    edit,
  };
});
