<script setup>
// my plugins
import { RestApi } from '@/plugins/restApi';
import { Service } from '@/plugins/service';
import { Scroll } from '@/plugins/scroll';

// Vuejs's plugins
import { onBeforeMount, watch } from 'vue';

// My Pinia plugins
import { useDialogStore } from '@/pinia/dialog';
import { useAlertStore } from '@/pinia/alert';
import { useLoadingStore } from '@/pinia/loading';
import { useMentionStore } from '@/pinia/mention';
import { useAnneeUniversitaireStore } from '@/pinia/anneeUniversitaire';
import { useOverlayStore } from '@/pinia/overlay';
import { usedisableStore } from '@/pinia/disable'

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my pinia plugins
const dialog = useDialogStore();
const alert = useAlertStore();
const loading = useLoadingStore();
const mention = useMentionStore();
const overlay = useOverlayStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const disable = usedisableStore()

// getting all "Definition Mention"
function reloadingMention() {
  mention.list = [];
  if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
    loading.mention = true;
    restApi
    .get(`/api/definition-mention/annee/${anneeUniversitaire.id}`)
    .then(response => { 
      mention.list = response.data; 
      loading.mention = false;
    })
    .catch(error => { alert.error(); console.error(error); });  
  }
}

// add mention in the table
function addMention() {
  disable.disableOne = true
  let data = {
    mention: mention.designation,
    acronymeMention: mention.acronyme
  };
  if (service.verifyFormIfOK(data)) {
    mention.list.push(data);
    mention.designation = null;
    mention.acronyme = null;
  }
}

// delete mention
function deleteMention(item, index) {
  dialog.show("Supprimer la mention ?", "DialogSupprimerMention", { item, index });
}

// saving or updating all mentions
function saveMention() {
  dialog.show("Enregistrer les mentions ?", "DialogEnregistrerMention");
}

// use the last Mention
function reuse() {
  let beforeLastIdAU = anneeUniversitaire.list[1].id;
  restApi
  .get(`/api/definition-mention/annee/${beforeLastIdAU}`)
  .then(response => { 
    response.data.map(item => {
      mention.list.push({
        mention: item.mention,
        acronymeMention: item.acronymeMention
      })
    })
  })
  .catch(error => { alert.error(); console.error(error); }); 
}

// When AU was changing, got DF
watch(() => anneeUniversitaire.id, (newIdAU) => {
  mention.list = [];
  overlay.show();
  restApi
  .get(`/api/definition-mention/annee/${newIdAU}`)
  .then(response => { mention.list = response.data; overlay.hide(); })
  .catch(error => { alert.error(); console.error(error); overlay.hide(); });  
})

// called before Mounting this SFC
onBeforeMount(() => {
  scroll.toTop();
  mention.list = [];
  restApi
  .get(`/api/annee`)
  .then(response => { anneeUniversitaire.list = response.data; })
  .catch(error => { alert.error(); console.error(error); });
  if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
    overlay.show();
    restApi
    .get(`/api/definition-mention/annee/${anneeUniversitaire.id}`)
    .then(response => { mention.list = response.data; overlay.hide(); })
    .catch(error => { alert.error(); console.error(error); overlay.hide(); });
  }
});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Les mentions</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4" v-if="!service.verifyIfNotEmpty(mention.list) && service.verifyIfNotEmpty(anneeUniversitaire.id)">
    <v-col cols="12">
      <p class="my-4">Si vous voulez réutiliser les mentions de l'année universitaire précedente, cliquez sur le bouton (réutiliser).</p>
    </v-col>
    <v-col cols="12" class="text-center">
      <v-btn size="large" rounded="pill" prepend-icon="mdi-backup-restore" color="indigo darken-4" class="text-transform-class text-none" @click="reuse">réutiliser</v-btn>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4" v-if="service.verifyIfNotEmpty(mention.list)">
    <v-col cols="12">
      <p class="font-weight-black pb-2 text-subtitle-1">- Listes des mentions</p>
    </v-col>
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Désignation de la mention</th>
            <th style="width: 200px !important;">Acronyme</th>
            <th style="width: 10px !important;">
              <v-btn icon="mdi-autorenew" :loading="loading.mention" title="Actualiser ?" color="red" variant="plain" @click="reloadingMention"></v-btn>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in mention.list" :key="index">
            <td><v-text-field variant="outlined" density="compact" v-model="item.mention" hide-details="true"></v-text-field></td>
            <td><v-text-field variant="outlined" density="compact" v-model="item.acronymeMention" hide-details="true"></v-text-field></td>
            <td class="text-center" style="width: 10px !important;">
              <v-btn icon="mdi-delete" color="red" variant="plain" title="Supprimer ?" @click="deleteMention(item, index)"></v-btn>
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
              <p class="font-weight-black pb-2 text-subtitle-1">- Remplir le formulaire pour ajouter une mention</p>
            </v-col>
            <v-col cols="6" class="pr-2">
              <v-text-field density="comfortable" v-model="mention.designation" clearable label="Désignation de la mention" hide-details="true"></v-text-field>
            </v-col>
            <v-col cols="4" class="px-2">
              <v-text-field density="comfortable" v-model="mention.acronyme" clearable label="Acronyme de la mention" hide-details="true" @keypress.enter="addMention"></v-text-field>
            </v-col>
            <v-col cols="2" class="d-flex justify-center mt-1 pl-2-">
              <v-btn size="large" rounded="pill" title="Ajouter ?" prepend-icon="mdi-plus-circle" color="indigo darken-4" class="text-transform-class text-none" :disabled="!mention.designation || !mention.acronyme " @click="addMention">Ajouter</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="service.verifyIfNotEmpty(mention.list)">
    <v-col class="text-center py-8">
      <v-btn size="large" rounded="pill" prepend-icon="mdi-content-save-all" color="indigo darken-4" class="text-transform-class text-none"  @click="saveMention">Enregistrer</v-btn>
    </v-col>
  </v-row>
</template>