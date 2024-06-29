import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";

import { onBeforeMount, ref } from "vue";
import { defineStore } from "pinia";
import { useAlertStore } from "./alert";
import { useOverlayStore } from "./overlay";

export const useConcoursStore = defineStore("concours", () => {
  const restApi = new RestApi();
  const service = new Service();

  const alert = useAlertStore();
  const overlay = useOverlayStore();

  const idCentre = ref(null);
  const affiche = ref("")
  const compensation = ref(false)
  const nombre = ref(null)
  const idCTCI = ref(null);
  const listnew = ref([]);
  const debutSessionCTCI = ref(null);
  const finSessionCTCI = ref(null);
  const sessionCTCI = ref(null);
  const descriptionCTCI = ref(null);
  const nomMCTCI = ref(null);
  const creditMCTCI = ref(null);
  const centreConcoursTCI = ref([]);
  const matiereConcoursTCI = ref([]);
  const calendrierConcoursTCI = ref([]);
  const listConcours = ref([]);
  const listCentre = ref([]);
  const listCandidate = ref([]);
  const listMaterial = ref([]);
  const idCentreCTCI = ref(null);
  const nomCentreCTCI = ref(null);
  const codePostale = ref(null);
  const listCandidateNote = ref([]);
  const listNote = ref([]);
  const listCandidateMoyenne = ref([]);
  const listCandidateAdmis = ref([]);
  const listCandidateAttente = ref([])
  const listStatistics = ref([]);
  const countCandidate = ref(0);
  const countCandidateAdmis = ref(0);
  const matieres = ref([]);
  const status = ref(null);
  const Idjury = ref(null);
  const nomAdjoint = ref(null);
  const prenomAdjoint = ref(null);
  const nombreAttente = ref(0);

  function addCenter(data) {
    centreConcoursTCI.value.push(data);
  }
  function deleteCenter(data) {
    let index = centreConcoursTCI.value.findIndex(
      (item) => item.nomCentreCTCI == data.nomCentreCTCI
    );
    centreConcoursTCI.value.splice(index, 1);
    if (service.verifyIfNotEmpty(data.id_centreCTCI)) {
      restApi
        .delete(`/api/concours/${idCTCI.value}/centre/${data.id_centreCTCI}`)
        .then((response) => {
          if (response.status == 200) alert.successDelete();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    }
  }

  function addMaterial(data) {
    matiereConcoursTCI.value.push(data);
    addCalendar(data.nomMCTCI);
  }

  function deleteMaterial(data) {
    let index = matiereConcoursTCI.value.findIndex(
      (item) => item.nomMCTCI == data.nomMCTCI
    );
    matiereConcoursTCI.value.splice(index, 1);
    deleteCalendar(index);
    if (service.verifyIfNotEmpty(idCTCI.value)) {
      restApi
        .delete(`/api/concours/${idCTCI.value}/matiere/${data.id}`)
        .then((response) => {
          if (response.status == 200) alert.successDelete();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    }
  }

  function addCalendar(data) {
    calendrierConcoursTCI.value.push({
      nomMCTCI: `${data}`,
      dateCalendrierCTCI: null,
      debutHeureCalendrierCTCI: null,
      debutHeureCalendrierCTCI: null,
    });
  }

  function deleteCalendar(index) {
    calendrierConcoursTCI.value.splice(index, 1);
  }

  function create() {
    let data = {};
    if (service.verifyIfEmpty(idCTCI)) {
      data = {
        concoursTCI: {
          sessionCTCI: sessionCTCI.value,
          descriptionCTCI: descriptionCTCI.value,
          dateDebutConcours: debutSessionCTCI.value,
          dateFinConcours: finSessionCTCI.value,
        },
        centreConcoursTCI: centreConcoursTCI.value,
        matiereConcoursTCI: matiereConcoursTCI.value,
        calendrierConcoursTCI: calendrierConcoursTCI.value,
      };
    } else {
      data = {
        concoursTCI: {
          id: idCTCI.value,
          sessionCTCI: sessionCTCI.value,
          descriptionCTCI: descriptionCTCI.value,
          dateDebutConcours: debutSessionCTCI.value,
          dateFinConcours: finSessionCTCI.value,
        },
        centreConcoursTCI: centreConcoursTCI.value,
        matiereConcoursTCI: matiereConcoursTCI.value,
        calendrierConcoursTCI: calendrierConcoursTCI.value,
      };
    }
    overlay.show();
    restApi
      .put(`/api/concours`, data)
      .then((response) => {
        if (response.status == 200) {
          alert.successSave();
          restApi
            .get(`/api/concours`)
            .then((response) => {
              listConcours.value = [];
              listConcours.value = response.data;
              if (service.verifyIfEmpty(idCTCI.value))
                idCTCI.value =
                  listConcours.value[listConcours.value.length - 1].id;
            })
            .catch((error) => {
              alert.error();
              console.error(error);
            });
        }
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
  }

  function addCandidate(data) {
    listCandidate.value.push(data);
    listnew.value.push(data);
  }

  function deleteCandidate(data) {
    listCandidate.value.splice(data.index, 1);
    if (service.verifyIfNotEmpty(data.candidat.id)) {
      restApi
        .delete(`/api/candidat/${data.candidat.id}`)
        .then((response) => {
          if (response.status == 200) alert.successDelete();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    }
  }

  function saveCandidate() {
    if (service.verifyIfNotEmpty(listCandidate.value)) {
      overlay.show();
      restApi
        .put(`/api/candidat`, { candidatConcoursTCI: listCandidate.value })
        .then((response) => {
          if (response.status == 200) alert.successSave();
          overlay.hide();
          restApi
            .get(`/api/candidat/centre/${idCentreCTCI.value}`)
            .then((response) => {
              listCandidate.value = response.data;
              overlay.hide();
            })
            .catch((error) => {
              alert.error();
              console.error(error);
              overlay.hide();
            });
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }

  function getAllMaterialId() {
    const id = ref([]);
    listMaterial.value.map((item) => {
      id.value.push(item.id);
    });
    return id.value;
  }

  function getCandidateNote() {
    let note = [];
    listCandidateNote.value.map((candidat) => {
      let noteArray = [];
      candidat.notes.map((note) => {
        noteArray.push(Number(note.value));
      });
      note.push({
        idCandidatCTCI: candidat.idCandidatCTCI,
        notes: noteArray,
      });
    });
    return note;
  }

  function saveCandidateNote() {
    let data = {
      idCTCI: idCTCI.value,
      idCentreCTCI: idCentreCTCI.value,
      matiere: getAllMaterialId(),
      candidats: getCandidateNote(),
    };
    overlay.show();
    restApi
      .put(`/api/concours/note`, data)
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

  function saveDeliberation() {
    let data = [];
    let i = 0
    listCandidateMoyenne.value.map((candidat) => {
      if (candidat.passationCandidatCTCI === true) {
        status.value = "PASSANT";
        idCentre.value = candidat.idCentreCTCI;
      }
      if (candidat.passationCandidatCTCI === false) {
        i++
        if (i <= nombreAttente.value) {
          status.value = "PASSANT";
          idCentre.value = candidat.idCentreCTCI;
          compensation.value = true;
          candidat.passationCandidatCTCI = false
        } 
        else{
          status.value = "REDOUBLANT";
          idCentre.value = candidat.idCentreCTCI;
          compensation.value = false
        }
      }

      data.push({
        id: candidat.id,
        passationCandidatCTCI: candidat.passationCandidatCTCI,
        status_etudiant: status.value,
        idCentreCTCI: idCentre.value,
        passationCandidatCTCIAttente : compensation.value
      });
    });

    overlay.show();


    restApi
      .put(
        `/api/candidat/concours/${idCTCI.value}/centre/${idCentreCTCI.value}`,
        data
      )
      .then((response) => {
        if (response.status == 200) alert.successSave();
        restApi
      .get(`/api/candidat/concours/${idCTCI.value}`)
      .then((response) => {
        listCandidateMoyenne.value = []
        nombre.value = null
        listCandidateMoyenne.value = response.data;
        listCandidateMoyenne.value.sort(
          (a, b) => b.moyenneCandidatCTCI - a.moyenneCandidatCTCI
        );
        listCandidateMoyenne.value.forEach((e)=>{
          if (e.passationCandidatCTCIAttente === true){
            nombre.value = nombre.value + 1
          }
        })
        overlay.hide();
      })
      .catch((err) => {
        alert.error();
        console.error(err);
        overlay.hide();
      });
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
  }

  function autorisationInscription(data) {
    overlay.show();
    restApi
      .post(`/api/autorisation/concours/${idCTCI.value}`, data)
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

  function autorisationInscriptionAttente(data) {
    overlay.show();
    restApi
      .post(`/api/autorisation/concours/${idCTCI.value}/attente`, data)
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

  function getName(id) {
    if (service.verifyIfNotEmpty(id)) {
      let result = listConcours.value.filter((item) => item.id === id);
      if (service.verifyIfNotEmpty(result))
        return String(result[0].sessionCTCI);
    }
  }


  return {
    Idjury,
    idCTCI,
    sessionCTCI,
    descriptionCTCI,
    nomMCTCI,
    debutSessionCTCI,
    finSessionCTCI,
    creditMCTCI,
    centreConcoursTCI,
    matiereConcoursTCI,
    calendrierConcoursTCI,
    listConcours,
    listCentre,
    listCandidate,
    listMaterial,
    idCentreCTCI,
    nomCentreCTCI,
    codePostale,
    listCandidateNote,
    listNote,
    listCandidateMoyenne,
    listCandidateAdmis,
    listCandidateAttente,
    listStatistics,
    countCandidate,
    countCandidateAdmis,
    matieres,
    nomAdjoint,
    prenomAdjoint,
    nombreAttente,
    compensation,
    nombre,
    affiche,
    addCenter,
    deleteCenter,
    addMaterial,
    deleteMaterial,
    create,
    addCandidate,
    deleteCandidate,
    saveCandidate,
    saveCandidateNote,
    saveDeliberation,
    autorisationInscription,
    getName,
    autorisationInscriptionAttente
  };
});
