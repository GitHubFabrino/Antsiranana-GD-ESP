<script setup>
// import my plugins
import { Service } from "@/plugins/service";
import { RestApi } from "@/plugins/restApi";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount } from "vue";

// import my pinia plugins
import { useLoadingStore } from "@/pinia/loading";
import { useDialogStore } from "@/pinia/dialog";
import { useNavigationStore } from "@/pinia/navigation";
import { useScolariteStore } from "@/pinia/scolarite";
import { useAlertStore } from "@/pinia/alert";

// instance my plugins
const service = new Service();
const restApi = new RestApi();
const scroll = new Scroll();

// instance my pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const loading = useLoadingStore();
const navigation = useNavigationStore();
const scolarite = useScolariteStore();

// Getting Scolarité
function reloadScolarite() {
  loading.manageScolarite = true;
  restApi
    .get(`/api/scolarite`)
    .then((response) => {
      scolarite.list = response.data;
      loading.manageScolarite = false;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
      loading.manageScolarite = false;
    });
}

// open Dialog
function save() {
  dialog.show("Enregistrer ?", "DialogEnregistrerGestionAccesTacheScolarite");
}

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  restApi
    .get(`/api/scolarite`)
    .then((response) => {
      scolarite.list = response.data;
      loading.manageScolarite = false;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
      loading.manageScolarite = false;
    });
});
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <h4 class="mb-8 text-h4">Gestion des accès aux tâches</h4>
      </v-col>
    </v-row>
    <v-row no-gutters v-if="service.verifyIfNotEmpty(scolarite.list)">
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">
          Donner l'autorisation de travailler pour agents de Scolarité
        </p>
      </v-col>
      <v-col cols="12">
        <ul class="ml-8 mb-8">
          <li>Gestion des concours d'entrée en TCI (1)</li>
          <li>Gestion des inscriptions (2)</li>
          <li>Gestion des accessibilités des taches (3)</li>
        </ul>
      </v-col>
      <v-col cols="12">
        <v-table class="elevation-1" density="compact">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénoms</th>
              <th>Status</th>
              <th>e-mail</th>
              <th>(1)</th>
              <th>(2)</th>
              <th>(3)</th>
              <th style="width: 10px !important">
                <v-btn
                  icon="mdi-autorenew"
                  :loading="loading.manageScolarite"
                  title="Actualiser ?"
                  color="red"
                  variant="plain"
                  @click="reloadScolarite"
                ></v-btn>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, index) in scolarite.list" :key="index">
              <td>{{ value.nom }}</td>
              <td>{{ value.prenoms }}</td>
              <td>{{ value.status }}</td>
              <td>{{ value.email }}</td>
              <td>
                <input type="checkbox" v-model="value.gestionConcoursTCI" />
              </td>
              <td>
                <input type="checkbox" v-model="value.gestionInscription" />
              </td>
              <td>
                <input type="checkbox" v-model="value.gestionAccesTache" />
              </td>
              <td class="text-center" style="width: 10px !important"></td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-8"
      v-if="service.verifyIfNotEmpty(scolarite.list)"
    >
      <v-col class="text-center">
        <v-btn
          size="large"
          rounded="pill"
          prepend-icon="mdi-content-save-all"
          color="indigo darken-4"
          class="text-transform-class text-none"
          @click="save"
          >Enregistrer</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>
