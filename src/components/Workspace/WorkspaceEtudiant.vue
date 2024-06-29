<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, watch, onBeforeUnmount } from "vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useOverlayStore } from "@/pinia/overlay";
import { useEtudiantStore } from "@/pinia/etudiant";
import { useNiveauStore } from "@/pinia/niveau";
import { useParcoursStore } from "@/pinia/parcours";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my Pinia plugins
const alert = useAlertStore();
const overlay = useOverlayStore();
const etudiant = useEtudiantStore();
const niveau = useNiveauStore();
const parcours = useParcoursStore();
const anneeUniversitaire = useAnneeUniversitaireStore();

// reload content of this table
function reloadFirstTable() {
  if (service.verifyIfNotEmpty(parcours.id)) {
    overlay.show();
    restApi
      .get(`/api/etudiant/dp/${parcours.id}`)
      .then((response) => {
        etudiant.list = response.data;
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
  }
}

// watch if anneeUniversitaire.id is changing
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

// watch if niveau.id is changing
watch(
  () => niveau.id,
  (newIdNiveau) => {
    parcours.id = null;
    if (etudiant.resultat == true) {
      parcours.prepareListWithSecondSemestre();
    } else {
      parcours.prepareListWithSemestre();
    }
    etudiant.list = [];
  }
);

// Called before mounting
onBeforeMount(() => {
  scroll.toTop();
  anneeUniversitaire.list = [];
  niveau.list = [];
  parcours.list = [];
  Promise.all([restApi.get(`/api/annee`), restApi.get(`/api/niveau`)])
    .then((response) => {
      anneeUniversitaire.list = response[0].data;
      niveau.list = response[1].data;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
  if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
    restApi
      .get(`/api/definition-parcours/annee/${anneeUniversitaire.id}`)
      .then((response) => {
        parcours.list = response.data;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  }
});

onBeforeUnmount(() => {
  niveau.id = null;
  parcours.id = null;
});
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <h4 class="text-h4">Gestion des étudiants</h4>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-8">
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">
          Sélectionnez l'année universitaire, le niveau et le parcours des
          étudiants
        </p>
      </v-col>
      <v-col class="pr-2">
        <v-select
          density="comfortable"
          label="Année universitaire"
          :items="anneeUniversitaire.list"
          item-title="nomAU"
          item-value="id"
          v-model="anneeUniversitaire.id"
        ></v-select>
      </v-col>
      <v-col class="px-2">
        <v-select
          density="comfortable"
          label="Niveau"
          :items="niveau.list"
          item-title="niveau"
          item-value="id"
          v-model="niveau.id"
        ></v-select>
      </v-col>
      <v-col class="pl-2" v-if="!parcours.hide">
        <v-select
          v-if="etudiant.resultat == false"
          density="comfortable"
          label="Parcours"
          :items="parcours.listWithSemestre"
          item-title="designation"
          item-value="id"
          v-model="parcours.id"
        ></v-select>
        <v-select
          v-if="etudiant.resultat == true"
          density="comfortable"
          label="Parcours"
          :items="parcours.listWithSecondSemestre"
          item-title="designation"
          item-value="id"
          v-model="parcours.id"
        ></v-select>
      </v-col>
    </v-row>

    <router-view></router-view>
  </v-container>
</template>
