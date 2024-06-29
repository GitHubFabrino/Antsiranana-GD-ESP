<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";
import { Cookies } from "@/plugins/cookies";

// import Vuejs's plugins
import { onBeforeMount, watch, ref, reactive, onBeforeUnmount } from "vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useOverlayStore } from "@/pinia/overlay";
import { useDialogStore } from "@/pinia/dialog";
import { useNiveauStore } from "@/pinia/niveau";
import { useEtudiantStore } from "@/pinia/etudiant";
import { useParcoursStore } from "@/pinia/parcours";
import { useEnseignantStore } from "@/pinia/enseignant";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();
const cookies = new Cookies();

// instance my Pinia plugins
const alert = useAlertStore();
const overlay = useOverlayStore();
const dialog = useDialogStore();
const etudiant = useEtudiantStore();
const niveau = useNiveauStore();
const parcours = useParcoursStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const enseignant = useEnseignantStore();

// // update
function lookReleveNote(value) {
  dialog.showFullScreen(
    "Relevé des notes",
    "DialogVisualiserReleveNote",
    value
  );
}

// // watch if anneeUniversitaire.id is changing
watch(
  () => anneeUniversitaire.id,
  (newIdAU) => {
    niveau.id = null;
    parcours.id = null;
    if (service.verifyIfNotEmpty(newIdAU)) {
      restApi
        .get(`/api/definition-parcours/annee/${newIdAU}`)
        .then((response) => {
          parcours.list = response.data;
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    }
  }
);

// watch if parcours.id is changing
watch(
  () => parcours.id,
  (newParcoursId) => {
    etudiant.list = [];
    if (service.verifyIfNotEmpty(newParcoursId)) {
      if (parcours.id.length == 2) {
        overlay.show();
        restApi
          .get(`/api/releve-note/dp/${parcours.id[0]}/${parcours.id[1]}`)
          .then((response) => {
            etudiant.list = response.data;
            etudiant.list.sort((a, b) => b.moyenne - a.moyenne);
            overlay.hide();
          })
          .catch((error) => {
            alert.error();
            console.error(error);
            overlay.hide();
          });
      }
      if (parcours.id.length == 1) {
        etudiant.list = [];
      }
    }
  }
);

// // Called before mounting
onBeforeMount(() => {
  parcours.hide = true;
});

onBeforeUnmount(() => {
  parcours.hide = false;
  etudiant.list = [];
  niveau.id = null;
  parcours.id = null;
});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Relevé de notes des étudiants</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col
      cols="8"
      class="pr-2"
      v-if="
        service.verifyIfNotEmpty(parcours.list) &&
        service.verifyIfNotEmpty(niveau.id)
      "
    >
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Sélectionnez les deux parcours formant l'année universitaire
      </p>
      <v-select
        multiple
        chips
        label="Parcours"
        :items="parcours.listWithSemestre"
        item-title="designation"
        item-value="id"
        v-model="parcours.id"
      ></v-select>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4" v-if="service.verifyIfNotEmpty(etudiant.list)">
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th></th>
            <th>Nom</th>
            <th>Prénoms</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, index) in etudiant.list" :key="index">
            <td>
              <v-icon
                icon="mdi-file-eye"
                color="indigo-darken-1"
                style="cursor: pointer"
                @click="lookReleveNote(value)"
              ></v-icon>
            </td>
            <td>{{ value.nom }}</td>
            <td>{{ value.prenoms }}</td>
            <td>{{ value.moyenne }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>
