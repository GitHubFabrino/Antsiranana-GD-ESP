<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Scroll } from "@/plugins/scroll";
import { Service } from "@/plugins/service";

// import Vuejs's plugins
import { onBeforeMount } from "vue";

// import VueRouter
import { RouterView, useRouter } from "vue-router";

// import my pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";

// instance router
const router = useRouter();

// instance my plugins
const scroll = new Scroll();
const restApi = new RestApi();
const service = new Service();

// instance my pinia plugins
const alert = useAlertStore();
const anneeUniversitaire = useAnneeUniversitaireStore();

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  restApi
    .get(`/api/annee`)
    .then((response) => {
      anneeUniversitaire.list = response.data;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
});
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <h4 class="text-h4">Année universitaire</h4>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-8">
      <v-col cols="6" class="pr-2">
        <p class="font-weight-black text-subtitle-1 pb-2">
          - Sélectionnez l'année universitaire
        </p>
        <v-select
          label="Année universitaire"
          :items="anneeUniversitaire.list"
          item-title="nomAU"
          item-value="id"
          v-model="anneeUniversitaire.id"
        ></v-select>
      </v-col>
      <v-col cols="6" class="pl-2">
        <h1 class="text-center mt-10 text-green">
          {{ anneeUniversitaire.getAU(anneeUniversitaire.id) }}
        </h1>
      </v-col>
    </v-row>

    <router-view
      v-if="service.verifyIfNotEmpty(anneeUniversitaire.id)">
    </router-view>
  </v-container>
</template>
