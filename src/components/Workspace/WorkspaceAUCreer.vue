<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, ref, reactive } from "vue";

// import my Pinia plugins
import { useDialogStore } from "@/pinia/dialog";
import { useDateStore } from "@/pinia/date";
import { useAlertStore } from "@/pinia/alert";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";
import { useLoadingStore } from "@/pinia/loading";
import { usedisableStore } from "@/pinia/disable";


//formatter la date 
const options = reactive({day:'2-digit',month:'2-digit',year:'numeric'})

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my Pinia plugins
const dialog = useDialogStore();
const date = useDateStore();
const alert = useAlertStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const loading = useLoadingStore();
const disable = usedisableStore()
// variable to disable the button save while conditions are false
const disabledSaveAU = ref(true);

// verifying some input
const rules = reactive({
  required: value => !!value || "yyyy - yyyy",
  counter: value => value.length <= 11 || 'Max 11 characters',
  saveAU: value => {
    if (value.match(/^\(?([0-9]{4}) [-. ] ?([0-9]{4})$/g)) {
      disabledSaveAU.value = false;
      return true;
    } 
    else {
      disabledSaveAU.value = true;
      return "yyyy - yyyy";
    }
  }
});

// getting AU
function reloadingAU() {
  loading.AU = true;
  restApi
  .get(`/api/annee`)
  .then(response => { 
    anneeUniversitaire.list = response.data; 
    loading.AU = false;
  })
  .catch(error => { alert.error(); console.error(error); });
}

// Create the AU
function define() {
  dialog.show("Créer l'année universitaire ?", "DialogCreerAnneeUniversitaire");
}

// Delete the AU
function remove(idAU) {
  dialog.show("Supprimer l'année universitaire ?", "DialogSupprimerAnneeUniversitaire", idAU);
}

// Update the Au
function edit(data) {
  dialog.show("Modifier l'année universitaire ?", "DialogModifierAnneeUniversitaire", data);
}

// Getting and setting some data before mounting of this SFC
onBeforeMount(() => {
  scroll.toTop();
  restApi
  .get(`/api/annee`)
  .then(response => { anneeUniversitaire.list = response.data; })
  .catch(error => { alert.error(); console.error(error); });
})
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <h3 class="text-h4">Année universitaire</h3>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-8" v-if="service.verifyIfNotEmpty(anneeUniversitaire.list)">
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">- Liste des années universitaires</p>
      </v-col>
      <v-col cols="12">
        <v-table class="elevation-1" density="compact">
          <thead>
            <tr>
              <th class="text-start pl-8">Désignation</th>
              <th class="text-start px-8">Date de début</th>
              <th class="text-start px-8">Date de fin</th>
              <th></th>
              <th class="pr-8" style="width: 10px !important;">
                <v-btn icon="mdi-autorenew" :loading="loading.AU" title="Actualiser ?" color="red" variant="plain" @click="reloadingAU"></v-btn>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, index) in anneeUniversitaire.list" :key="index">
              <td class="text-start pl-8">{{ value.nomAU }}</td>
              <td class="text-start pl-8">{{ date.format(value.debutAU) }}</td>
              <td class="text-start pl-8">{{ date.format(value.finAU) }}</td>
              <td class="text-center px-0" style="width: 10px !important;">
                <v-btn icon="mdi-pen" color="blue" variant="plain" title="Modifier ?" @click="edit(value)"></v-btn>
              </td>
              <td class="text-center pl-0" style="width: 10px !important;">
                <v-btn icon="mdi-delete" color="red" variant="plain" title="Supprimer ?" @click="remove(value.id)"></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-container>
            <v-row no-gutters>
              <v-col cols="12">
                <p class="font-weight-black text-subtitle-1 pb-2">- Remplir le formulaire pour créer une année universitaire</p>
              </v-col>
              <v-col cols="4" class="pr-2">
                <v-text-field hide-details="true" v-model="anneeUniversitaire.nomAU" density="comfortable" clearable label="Nom de l'AU" hint="yyyy - yyyy" placeholder="2000 - 2001" :rules="[rules.required, rules.counter, rules.saveAU]"></v-text-field>
              </v-col>
              <v-col cols="3" class="px-2">
                <v-text-field v-model="anneeUniversitaire.debutAU" density="comfortable" clearable label="Début" hide-details="true" type="date"></v-text-field>
              </v-col>
              <v-col cols="3" class="px-2">
                <v-text-field v-model="anneeUniversitaire.finAU" density="comfortable" clearable label="Fin" hide-details="true" type="date"></v-text-field>
              </v-col>
              <v-col class="text-center mt-1">
                <v-btn size="large" rounded="pill" prepend-icon="mdi-plus-circle" color="indigo darken-4" class="text-none" :disabled="(!anneeUniversitaire.nomAU || !anneeUniversitaire.debutAU || !anneeUniversitaire.finAU) &&  disable.disableOne === false" @click="define">Créer</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>