<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, watch, ref, nextTick } from "vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
import { useConcoursStore } from "@/pinia/concours";
import { useOverlayStore } from "@/pinia/overlay";

// instance of my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instancing my pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const concours = useConcoursStore();
const overlay = useOverlayStore();

// create variables
const headers = ref([]);
const inputFields = ref([]);
const candidateNotes = ref([]);
const nextindex = ref(null);
const nextindexNote = ref(null);
const noteArray = ref([]);
const noteArrayValue = ref([]);
const idCandidatCTCI = ref(null)
const idMatiere = ref([])

function entrerTouch(index, indexNote, note) {
  candidateNotes.value = concours.listCandidateNote[index].notes;
  nextindex.value =
    indexNote === candidateNotes.value.length - 1 ? index + 1 : index;
  nextindexNote.value = (indexNote + 1) % candidateNotes.value.length;
  const nextCell = getCell(nextindex.value, nextindexNote.value);
  nextTick(() => {
    if (nextCell) {
      nextCell.focus();
    }
  });
  if (nextindexNote.value === 0) {

  idMatiere.value = concours.listMaterial.map((l)=>{
     return l.id
  })
  idCandidatCTCI.value = concours.listNote.map((l) => {
    return l.idCandidatCTCI;
  })[index];
  noteArray.value = concours.listCandidateNote.map((l) => {
    return l.notes;
  })[index];
  noteArrayValue.value = noteArray.value.map((l) => {
    return l.value;
  });

    overlay.show()
  restApi
    .put(`/api/concours/note/candidat`, {
      idCTCI: concours.idCTCI,
      idCentreCTCI: concours.idCentreCTCI,
      matiere: idMatiere.value,
      candidats: Array({
        idCandidatCTCI: idCandidatCTCI.value,
        notes: noteArrayValue.value,
      }),
    })
    .then((response) => {
      overlay.hide();
      if (response.status == 200) alert.successSave();
    })
    .catch((error) => {
      overlay.hide();
      alert.error();
      console.error(error);
    });
}
}

const getCell = (index, indexNote) => {
  return document.querySelector(
    `[data-row="${index}"][data-cell="${indexNote}"]`
  );
};

///////////////////

// creating virtual note if the candidate don't have it
function createVirtualNote() {
  let notes = [];
  concours.listMaterial.map((item) => {
    notes.push({ value: 0 });
  });
  return notes;
}

// getting all note
function getAllNote(idCandidatCTCI) {
  let notes = [];
  concours.listNote.map((item) => {
    if (idCandidatCTCI == item.idCandidatCTCI) {
      item.notes.map((note) => {
        notes.push({ value: note });
      });
    }
  });
  return notes;
}

// prepare list of candidate
function prepareCandidateNoteWithoutNote() {
  concours.listCandidateNote = [];
  concours.listCandidate.map((candidat) => {
    concours.listCandidateNote.push({
      idCandidatCTCI: candidat.id,
      numeroCandidatCTCI: candidat.numeroCandidatCTCI,
      nom: candidat.nom,
      prenoms: candidat.prenoms,
      notes: createVirtualNote(),
    });
  });
}

// prepare Candidate's note
function prepareCandidateNote() {
  concours.listCandidateNote = [];
  concours.listCandidate.map((candidat) => {
    let haveNote = concours.listNote.some(
      (item) => candidat.id == item.idCandidatCTCI
    );
    if (haveNote == true) {
      concours.listCandidateNote.push({
        idCandidatCTCI: candidat.id,
        numeroCandidatCTCI: candidat.numeroCandidatCTCI,
        nom: candidat.nom,
        prenoms: candidat.prenoms,
        notes: getAllNote(candidat.id),
      });
    }
    if (haveNote == false) {
      concours.listCandidateNote.push({
        idCandidatCTCI: candidat.id,
        numeroCandidatCTCI: candidat.numeroCandidatCTCI,
        nom: candidat.nom,
        prenoms: candidat.prenoms,
        notes: createVirtualNote(),
      });
    }
  });
}

// saving Candidate's note
function saveCandidateNote() {
  dialog.show(
    "Enregistrer les notes ?",
    "DialogEnregistrerNoteCandidatConcours"
  );
}

// watch if idCTCI is changing
watch(
  () => concours.idCTCI,
  (newIdCTCI) => {
    concours.idCentreCTCI = null;
    concours.listCentre = [];
    concours.listMaterial = [];
    concours.listCandidate = [];
    concours.listCandidateNote = [];
    overlay.show();
    Promise.all([
      restApi.get(`/api/concours/${newIdCTCI}`),
      restApi.get(`/api/concours/${newIdCTCI}/centre`),
      restApi.get(`/api/concours/${newIdCTCI}/matiere`),
    ])
      .then((response) => {
        concours.idCTCI = response[0].data.id;
        concours.sessionCTCI = response[0].data.sessionCTCI;
        concours.anneeCTCI = response[0].data.anneeCTCI;
        concours.descriptionCTCI = response[0].data.descriptionCTCI;
        concours.listCentre = response[1].data;
        concours.listMaterial = response[2].data;
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
  }
);

// watch if idCentreCTCI is changing
watch(
  () => concours.idCentreCTCI,
  (newIdCentreCTCI) => {
    concours.listCandidate = [];
    concours.listCandidateNote = [];
    concours.listNote = [];
    if (service.verifyIfNotEmpty(newIdCentreCTCI)) {
      concours.listCentre.map((item) => {
        if (item.id == newIdCentreCTCI) {
          concours.idCentreCTCI = item.id;
          concours.nomCentreCTCI = item.nomCentreCTCI;
          concours.codePostale = item.codePostale;
        }
      });
      overlay.show();

      Promise.all([
        restApi.get(`/api/candidat/centre/${newIdCentreCTCI}`),
        restApi.get(
          `/api/concours/note/concours/${concours.idCTCI}/centre/${newIdCentreCTCI}`
        ),
      ])
        .then((response) => {
          concours.listCandidate = response[0].data;
          concours.listNote = response[1].data.candidats;
          if (service.verifyIfEmpty(concours.listNote)) {
            prepareCandidateNoteWithoutNote();
          }
          if (service.verifyIfNotEmpty(concours.listNote)) {
            prepareCandidateNote();
          }
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    } else {
      concours.nomCentreCTCI = null;
      concours.codePostale = null;
    }
  }
);

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  restApi
    .get(`/api/concours`)
    .then((response) => {
      concours.listConcours = response.data;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
  if (service.verifyIfNotEmpty(concours.idCTCI)) {
    overlay.show();
    Promise.all([
      restApi.get(`/api/concours/${concours.idCTCI}`),
      restApi.get(`/api/concours/${concours.idCTCI}/centre`),
      restApi.get(`/api/concours/${concours.idCTCI}/matiere`),
    ])
      .then((response) => {
        concours.idCTCI = response[0].data.id;
        concours.sessionCTCI = response[0].data.sessionCTCI;
        concours.anneeCTCI = response[0].data.anneeCTCI;
        concours.descriptionCTCI = response[0].data.descriptionCTCI;
        concours.listCentre = response[1].data;
        concours.listMaterial = response[2].data;
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
  }
  concours.idCentreCTCI = null;
  concours.listCentre = [];
  concours.listMaterial = [];
  concours.listCandidateNote = [];
  concours.nomCentreCTCI = null;
  concours.codePostale = null;
  concours.listMaterial.map((item) => {
    headers.value.push({ title: item, key: item });
  });
});
</script>

<template>
  <v-row no-gutters class="mt-8">
    <v-col cols="12">
      <h5 class="text-h5">Transcription des notes</h5>
    </v-col>
  </v-row>
  <v-row
    no-gutters
    class="mt-4"
    v-if="service.verifyIfNotEmpty(concours.listCentre)"
  >
    <v-col cols="12">
      <p class="font-weight-black pb-2 text-subtitle-1">
        - Sélectionnez le centre d'examen
      </p>
    </v-col>
    <v-col class="pr-2">
      <v-select
        label="Centre"
        density="comfortable"
        :items="concours.listCentre"
        item-title="nomCentreCTCI"
        item-value="id_centreCTCI"
        v-model="concours.idCentreCTCI"
      ></v-select>
    </v-col>
    <v-col class="px-2">
      <h1 class="text-center text-green">
        {{ concours.nomCentreCTCI }} &nbsp;&nbsp; {{ concours.codePostale }}
      </h1>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="service.verifyIfNotEmpty(concours.listCandidateNote)">
    <v-col cols="12">
      <p class="list my-4"> - Liste des notes des candidats - </p>
    </v-col>
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th class="text-truncate">Numéro</th>
            <th class="text-truncate">Nom</th>
            <th class="text-truncate">Prénoms</th>
            <th
              class="text-truncate"
              v-for="(matiere, index) in concours.listMaterial"
              :key="index"
            >
              {{ matiere.nomMCTCI }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, index) in concours.listCandidateNote" :key="index">
            <td class="text-truncate">{{ value.numeroCandidatCTCI }}</td>
            <td class="text-truncate">{{ value.nom }}</td>
            <td class="text-truncate">{{ value.prenoms }}</td>
            <td
              v-for="(note, indexNote) in value.notes"
              :key="indexNote"
              @keyup.enter.trim="entrerTouch(index, indexNote, note.value)"
              contenteditable="false"
              style="width: 75px"
            >
              <input
                class="input"
                variant="outlined"
                ref="inputFields"
                density="compact"
                v-model="note.value"
                hide-details="true"
                type="number"
                style="width: 75px"
                :data-row="index"
                :data-cell="indexNote"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="service.verifyIfNotEmpty(concours.listCandidateNote)">
    <v-col class="text-center py-8">
      <v-btn
        size="large"
        rounded="pill"
        prepend-icon="mdi-content-save-all"
        color="indigo darken-4"
        class="text-transform-class text-none"
        @click="saveCandidateNote"
        >Enregistrer</v-btn
      >
    </v-col>
  </v-row>
</template>

<style scoped>
.input {
  text-align: center;
  padding: 5px;
  border: 3px rgba(128, 128, 128, 0.607) solid;
  border-radius: 5px;
}

.list{
  font-weight: bolder;
}
</style>
