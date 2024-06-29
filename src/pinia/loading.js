import { ref } from "vue";
import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", () => {
  const authentification = ref(false);
  const personne = ref(false);
  const mention = ref(false);
  const parcours = ref(false);
  const AU = ref(false);
  const DD = ref(false);
  const candidatCTCI = ref(false);
  const autorisation = ref(false);
  const printResultCTCI = ref(false);
  const printResultCTCIAttente = ref(false)
  const manageDirection = ref(false);
  const manageScolarite = ref(false);
  const manageEnseignant = ref(false);
  const responsableMention = ref(false);
  const responsableParcours = ref(false);
  const manageInscriptionA = ref(false);
  const inscriptionPedagogique = ref(false);
  const firstTable = ref(false);
  const secondTable = ref(false);

  return {
    authentification,
    firstTable,
    secondTable,
    personne,
    mention,
    parcours,
    AU,
    DD,
    printResultCTCIAttente,
    candidatCTCI,
    autorisation,
    printResultCTCI,
    manageDirection,
    manageScolarite,
    manageEnseignant,
    responsableMention,
    responsableParcours,
    manageInscriptionA,
    inscriptionPedagogique,
  };
});
