// import my service
import { Service } from "@/plugins/service";
import { RestApi } from "@/plugins/restApi";

// import this Vuejs's plugins
import { ref } from "vue";

// import this Pinia's plugins
import { defineStore } from "pinia";

// import these stores
import { useOverlayStore } from "./overlay";
import { useAlertStore } from "./alert";
import { useEtudiantStore } from "./etudiant";

// export this store
export const useNotesStore = defineStore("notes", () => {
  // instance my services
  const service = new Service();
  const restApi = new RestApi();

  // instance these stores
  const overlay = useOverlayStore();
  const alert = useAlertStore();
  const etudiant = useEtudiantStore();

  // students's list with note
  const list = ref([]);
  const idPE = ref(null);
  const listForSending = ref([]);

  // set list of all students
  function setList(data) {
    etudiant.list.map((item) => {
      let oneNote = data.filter((itemNote) => itemNote.idCursus == item.id);
      if (service.verifyIfNotEmpty(oneNote)) {
        list.value.push({
          idCursus: item.id,
          nom: item.nom,
          prenoms: item.prenoms,
          telephone: item.telephone,
          note: oneNote[0].note,
        });
      } else {
        list.value.push({
          idCursus: item.id,
          nom: item.nom,
          prenoms: item.prenoms,
          telephone: item.telephone,
          note: 0,
        });
      }
    });
  }

  // filter list by nom
  function filterByNom(data) {
    if (service.verifyIfEmpty(data)) return list.value;
    else
      return list.value.filter((etudiant) =>
        Boolean(etudiant.nom.includes(data))
      );
  }

  // for updating all notes
  function updateNotes() {
    prepareListForSendingNotes();
    if (service.verifyIfNotEmpty(listForSending.value)) {
      console.table(listForSending.value);
      overlay.show();
      restApi
        .put(`/api/releve-note/pe/${idPE.value}`, listForSending.value)
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
    list.value.map((item) => {
      listForSending.value.push({
        idCursus: item.idCursus,
        note: Number(item.note),
      });
    });
  }

  return {
    list,
    idPE,
    setList,
    filterByNom,
    updateNotes,
  };
});
