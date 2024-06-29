<script setup>
// // import my plugins
import { Scroll } from "@/plugins/scroll";
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";

// import Vuejs's plugins
import { onBeforeMount, watch, ref, computed } from "vue";

// import VueRouter
import { useRouter } from "vue-router";

// import my pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useParcoursStore } from "@/pinia/parcours";
import { useNiveauStore } from "@/pinia/niveau";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";

// instance my plugins
const scroll = new Scroll();
const restApi = new RestApi();
const service = new Service();

// instance my pinia plugins
const alert = useAlertStore();
const parcours = useParcoursStore();
const niveau = useNiveauStore();
const anneeUniversitaire = useAnneeUniversitaireStore();

const router = useRouter();

// create variables
const show = ref(false);
const pathname = computed(() => router.currentRoute.value.fullPath);

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
    parcours.prepareListWithSemestre();
  }
);

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  anneeUniversitaire.list = [];
  niveau.list = [];
  parcours.list = [];
  if (pathname.value === "/seminaire-pedagogique/programme-enseignement")
    show.value = true;
  else if (pathname.value === "/seminaire-pedagogique/enseignant-ec")
    show.value = true;
  else show.value = false;
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
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <h3 class="text-h4">Programme d'enseignement</h3>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-8">
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">
          - Sélectionnez l'année universitaire, le niveau et le parcours
        </p>
      </v-col>
      <v-col cols="4" class="pr-2">
        <v-select
          density="comfortable"
          label="Année universitaire"
          :items="anneeUniversitaire.list"
          item-title="nomAU"
          item-value="id"
          v-model="anneeUniversitaire.id"
        ></v-select>
      </v-col>
      <v-col cols="4" class="px-2">
        <v-select
          density="comfortable"
          label="Niveau"
          :items="niveau.list"
          item-title="niveau"
          item-value="id"
          v-model="niveau.id"
        ></v-select>
      </v-col>
      <v-col cols="4" class="pl-2">
        <v-select
          density="comfortable"
          label="Parcours"
          :items="parcours.listWithSemestre"
          item-title="designation"
          item-value="id"
          v-model="parcours.id"
        ></v-select>
      </v-col>
    </v-row>

    <router-view v-if="service.verifyIfNotEmpty(parcours.id)"></router-view>
  </v-container>
</template>
