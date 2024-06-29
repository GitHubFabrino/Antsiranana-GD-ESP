// import my plugins
import { Service } from "@/plugins/service";
import { RestApi } from "@/plugins/restApi";

// import Vuejs's plugins
import { reactive, ref } from "vue";

// import Pinia's plugins
import { defineStore } from "pinia";

// import my Pinia plugins
import { useAlertStore } from "./alert";
import { useOverlayStore } from "./overlay";
import { usePEStore } from "./pe";
import { useParcoursStore } from "./parcours";
import { useNiveauStore } from "./niveau";
import { useAnneeUniversitaireStore } from "./anneeUniversitaire";

// export this store
export const useEtudiantStore = defineStore("etudiant", () => {
  // instance my plugins
  const service = new Service();
  const restApi = new RestApi();

  // instance my pinia plugins
  const alert = useAlertStore();
  const overlay = useOverlayStore();
  const pe = usePEStore();
  const parcours = useParcoursStore();
  const niveau = useNiveauStore();
  const au = useAnneeUniversitaireStore();

  // create variables
  const id = ref(null);
  const bacc = ref(null);
  const anneeBacc = ref(null);
  const list = ref([]);
  const listNotes = ref([]);
  const idPE = ref(null);
  const listForSending = ref([]);
  const listDeliberation = ref([]);
  const listExclu = ref([]);
  const listAdmis = ref([]);
  const listAdmisCompensation = ref([]);
  const listAdmisCondition = ref([]);
  const listRedoublant = ref([]);
  const deliberation = reactive({
    mgv: 0,
    uec: 0,
    ece: 0,
  });
  const resultat = ref(false);

  // Doing "Inscription Administrative"
  function administrativeRegistration(data) {
  
    if (service.verifyIfNotEmpty(data)) {
      overlay.show();
        console.log("ito ", data);
      restApi
        .post(`/api/inscription-administrative`, Array(data))
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

  // Doing "Inscription Pedagogique"
  function pedagogicalRegistration(data) {
    overlay.show();
    restApi
      .post(`/api/cursus`, data)
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

  // Setting bacc
  function set(data) {
    if (service.verifyIfNotEmpty(data)) {
      id.value = data.id;
      bacc.value = data.idBacc;
      anneeBacc.value = data.anneeBacc;
    }
  }

  // set list of all students
  function setListNotes(data) {
    overlay.show();
    listNotes.value = [];
    list.value.map((item, index) => {
      let oneNote = data.filter((itemNote) => itemNote.idCursus == item.id);
      if (service.verifyIfNotEmpty(oneNote)) {
        listNotes.value.push({
          idCursus: item.id,
          nom: item.nom,
          prenoms: item.prenoms,
          telephone: item.telephone,
          note: oneNote[0].note,
        });
      } else {
        listNotes.value.push({
          idCursus: item.id,
          nom: item.nom,
          prenoms: item.prenoms,
          telephone: item.telephone,
          note: 0,
        });
      }
    });
    overlay.hide();
  }

  // filter list by nom
  function filterEtudiantNoteByNom(data) {
    if (service.verifyIfEmpty(data)) return listNotes.value;
    else
      return listNotes.value.filter((etudiant) =>
        Boolean(etudiant.nom.includes(data))
      );
  }

  // for updating all notes
  function updateNotes() {
    prepareListForSendingNotes();
    if (service.verifyIfNotEmpty(listForSending.value)) {
      overlay.show();
      restApi
        .put(`/api/releve-note/ueec/${pe.idUEEC}`, listForSending.value)
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

  // for preparing all notes
  function prepareListForSendingNotes() {
    listForSending.value = [];
    listNotes.value.map((item) => {
      listForSending.value.push({
        idCursus: item.idCursus,
        note: Number(item.note),
      });
    });
  }

  // set list for deliberation
  function setListDeliberation(data) {
    if (service.verifyIfNotEmpty(data)) {
      data.map((item) => {
        if (item.codeRedoublement == 0)
          listDeliberation.value.push({ ...item, codeRedoublement: 0 });
        else listDeliberation.value.push({ ...item, codeRedoublement: 1 });
      });
    }
  }

  // filter list by nom
  function filterEtudiantDeliberationByNom(data) {
    if (service.verifyIfEmpty(data)) return listDeliberation.value;
    else
      return listDeliberation.value.filter((etudiant) =>
        Boolean(etudiant.nom.includes(data))
      );
  }

  function saveDeliberation() {
    // if (service.verifyIfNotEmpty(list.value)) {
    overlay.show();
    let listIdEtudiant = [];
    list.value.map((item) => {
      listIdEtudiant.push({
        idEtudiant: item.idEtudiant,
      });
    });
    let requestPutData = {
      listIdEtudiant: listIdEtudiant,
      mgv: deliberation.mgv,
      uec: deliberation.uec,
      ece: deliberation.ece,
    };
    restApi
      .put(
        `/api/etudiant/deliberation/dp/${parcours.id[0]}/${parcours.id[1]}`,
        requestPutData
      )
      .then((response) => {
        if (response.status == 200) alert.successSave();
        restApi
          .get(`/api/releve-note/dp/${parcours.id[0]}/${parcours.id[1]}`)
          .then((response) => {
            list.value = response.data;
            list.value.sort((a, b) => b.moyenne - a.moyenne);
            overlay.hide();
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
    // }
  }

  function setListResultat(data) {
    if (service.verifyIfNotEmpty(data)) {
      data.map((item) => {
        if (item.codeRedoublement == 0) listExclu.value.push(item);
        if (item.codeRedoublement == 1) listAdmis.value.push(item);
        if (item.codeRedoublement == 2) listAdmisCompensation.value.push(item);
        if (item.codeRedoublement == 3) listAdmisCondition.value.push(item);
        if (item.codeRedoublement == 4) listRedoublant.value.push(item);
      });
    } else {
      listAdmis.value = [];
      listRedoublant.value = [];
    }
  }

  // autorisation les passants à s'inscrire
  function autorisationInscription(data) {
    if (service.verifyIfNotEmpty(niveau.id) && service.verifyIfNotEmpty(data)) {
      overlay.show();
      var requestPutData = [];
      if (service.verifyIfNotEmpty(listAdmis.value)) {
        listAdmis.value.map((item) => {
          requestPutData.push({
            idPersonne: item.idPersonne,
            codeRedoublement: item.codeRedoublement,
          });
        });
      }
      if (service.verifyIfNotEmpty(listAdmisCompensation.value)) {
        listAdmisCompensation.value.map((item) => {
          requestPutData.push({
            idPersonne: item.idPersonne,
            codeRedoublement: item.codeRedoublement,
          });
        });
      }
      if (service.verifyIfNotEmpty(listAdmisCondition.value)) {
        listAdmisCondition.value.map((item) => {
          requestPutData.push({
            idPersonne: item.idPersonne,
            codeRedoublement: item.codeRedoublement,
          });
        });
      }
      if (service.verifyIfNotEmpty(listRedoublant.value)) {
        listRedoublant.value.map((item) => {
          requestPutData.push({
            idPersonne: item.idPersonne,
            codeRedoublement: item.codeRedoublement,
          });
        });
      }
      restApi
        .put(
          `/api/autorisation/etudiant/niveau/${niveau.id}/annee/${data}`,
          requestPutData
        )
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

  function getNumeroInscription(niveau, annee, idEtudiant) {
    if (Number(idEtudiant) < 10)
      return String(`ESP${niveau}${annee}0000${idEtudiant}`);
    else if (Number(idEtudiant) < 100)
      return String(`ESP${niveau}${annee}000${idEtudiant}`);
    else if (Number(idEtudiant) < 1000)
      return String(`ESP${niveau}${annee}00${idEtudiant}`);
    else if (Number(idEtudiant) < 10000)
      return String(`ESP${niveau}${annee}0${idEtudiant}`);
    else if (Number(idEtudiant) < 100000)
      return String(`ESP${niveau}${annee}${idEtudiant}`);
  }

  return {
    id,
    bacc,
    anneeBacc,
    list,
    idPE,
    listNotes,
    listDeliberation,
    deliberation,
    listExclu,
    listAdmis,
    listAdmisCompensation,
    listAdmisCondition,
    listRedoublant,
    resultat,
    administrativeRegistration,
    pedagogicalRegistration,
    set,
    setListNotes,
    filterEtudiantNoteByNom,
    updateNotes,
    setListDeliberation,
    filterEtudiantDeliberationByNom,
    saveDeliberation,
    setListResultat,
    autorisationInscription,
    getNumeroInscription,
  };
});
