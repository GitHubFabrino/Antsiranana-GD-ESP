<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, watch, ref, onBeforeUnmount,  nextTick } from "vue";

// instance my pinia plugins
import { useParcoursStore } from "@/pinia/parcours";
import { usePEStore } from "@/pinia/pe";
import { useAlertStore } from "@/pinia/alert";
import { useNiveauStore } from "@/pinia/niveau";
import { useOverlayStore } from "@/pinia/overlay";
import { useEtudiantStore } from "@/pinia/etudiant";
import { useDialogStore } from "@/pinia/dialog";

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my pinia plugins
const parcours = useParcoursStore();
const pe = usePEStore();
const alert = useAlertStore();
const niveau = useNiveauStore();
const overlay = useOverlayStore();
const etudiant = useEtudiantStore();
const dialog = useDialogStore();

// create variables
const nom = ref(null);
const nextindex = ref(null);
const inputFields = ref([]);
const candidateNotes = ref([]);


function update() {
  dialog.show("Enregistrer les notes ?", "DialogEnregistrerEtudiantNotes");
}

// watching parcours changes
watch(
  () => parcours.id,
  (newIdParcours) => {
    etudiant.list = [];
    etudiant.listNotes = [];
    if (service.verifyIfNotEmpty(newIdParcours)) {
      overlay.show();
      Promise.all([
        restApi.get(`/api/etudiant/dp/${newIdParcours}`),
        restApi.get(`/api/programme-enseignement/dp/${newIdParcours}`),
      ])
        .then((response) => {
          etudiant.list = response[0].data;
          pe.list = response[1].data;
          pe.prepareListUE();
          pe.prepareListEC();
          pe.prepareListECAvailable();
          pe.idUEEC = null;
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }
);

function putNote(note, idCursus, index) {
  overlay.show()
  restApi
    .put(`/api/releve-note/ueec/etudiant/${pe.idUEEC}`, {
      idCursus: idCursus,
      note: Number(note),
    })
    .then((response) => {
      overlay.hide()
      if (response.status == 200) alert.successSave();
    })
    .catch((error) => {
      overlay.hide()
      alert.error();
      console.error(error);
    });
  nextindex.value = index + 1;
  const nextCell = getCell(nextindex.value);
  nextTick(() => {
    if (nextCell) {
      nextCell.focus();
    }
  });
}
const getCell = (index) => {
  return document.querySelector(
    `[data-row="${index}"]`
  );
}

watch(
  () => pe.idUEEC,
  (newIdUEEC) => {
    if (service.verifyIfNotEmpty(newIdUEEC)) {
      // etudiant.listNotes = [];
      overlay.show();
      restApi
        .get(`/api/releve-note/ueec/${newIdUEEC}/dp/${parcours.id}`)
        .then((response) => {
          etudiant.setListNotes(response.data);
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }
);

// called before mounting this SFC
onBeforeMount(() => {
  // autoscroll to top
  scroll.toTop();
  niveau.id = null;
  parcours.id = null;
});

onBeforeUnmount(() => {
  niveau.id = null;
  parcours.id = null;
});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Transcriptions des notes</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4" v-if="service.verifyIfNotEmpty(pe.listEC)">
    <v-col cols="12">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Sélectionnez l'élément constitutif
      </p>
    </v-col>
    <v-col cols="8" class="pr-2">
      <v-select
        density="comfortable"
        label="Élément constitutif"
        :items="pe.listEC"
        item-title="nomEC"
        item-value="idUEEC"
        v-model="pe.idUEEC"
      ></v-select>
    </v-col>
    <v-col cols="4" class="pl-2">
      <v-text-field
        density="comfortable"
        label="Nom"
        v-model="nom"
        clearable
        hide-details="true"
        append-inner-icon="mdi-magnify"
      ></v-text-field>
    </v-col>
  </v-row>

  <v-row
    no-gutters
    class="mt-4"
    v-if="service.verifyIfNotEmpty(etudiant.listNotes)"
  >
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénoms</th>
            <th>Téléphone</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(value, index) in etudiant.filterEtudiantNoteByNom(nom)"
            :key="index"
          >
            <td class="text-truncate">{{ value.nom }}</td>
            <td>{{ value.prenoms }}</td>
            <td class="text-truncate">{{ value.telephone }}</td>
            <td>
              <input
                class="input"
                variant="outlined"
                ref="inputFields"
                density="compact"
                v-model="value.note"
                hide-details="true"
                type="number"
                style="width: 75px"
                @keyup.enter="putNote(value.note, value.idCursus, index)"
                :data-row="index"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row
    no-gutters
    class="mt-4"
    v-if="service.verifyIfNotEmpty(etudiant.listNotes)"
  >
    <v-col class="text-center">
      <v-btn
        size="large"
        rounded="pill"
        prepend-icon="mdi-content-save-all"
        color="indigo darken-4"
        class="text-transform-class text-none"
        @click="update"
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
</style>
