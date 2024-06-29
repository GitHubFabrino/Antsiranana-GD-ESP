<script setup>
// import my plugins
import { RestApi } from '@/plugins/restApi';
import { Service } from '@/plugins/service';
import { Scroll } from '@/plugins/scroll';

// import Vuejs's plugins
import { onBeforeMount, watch } from 'vue';

// import my pinia plugins
import { useAlertStore } from '@/pinia/alert';
import { useDialogStore } from '@/pinia/dialog';
import { useLoadingStore } from '@/pinia/loading';
import { useOverlayStore } from '@/pinia/overlay';
import { useMentionStore } from '@/pinia/mention';
import { useEnseignantStore } from '@/pinia/enseignant';
import { useAnneeUniversitaireStore } from '@/pinia/anneeUniversitaire';

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const loading = useLoadingStore();
const overlay = useOverlayStore();
const mention = useMentionStore();
const enseignant = useEnseignantStore();
const anneeUniversitaire = useAnneeUniversitaireStore();

// create a "Responsable de mention"
function save() {  
  let requestPostData = {
    id: mention.id,
    idEnseignant: enseignant.id
  };
  if (service.verifyFormIfOK(requestPostData)) dialog.show("Désigner le responsable mention ?", "DialogCreerResponsableMention", requestPostData);
  else alert.warningForm();
}

// getting a "Responsable de mention"
function reloadResponsableMention() {
  if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
    loading.responsableMention = true;
    restApi
    .get(`/api/responsable-mention/annee/${anneeUniversitaire.id}`)
    .then(response => { mention.listResponsableMention = response.data; loading.responsableMention = false; }) 
    .catch(error => { alert.error(); console.error(error); loading.responsableMention = false; });  
  }
}

// deleting a "Responsable de mention"
function deleteResponsableMention(value, index) {
  dialog.show("Supprimer le responsable mention ?", "DialogSupprimerResponsableMention", { value, index });
}

// watch if AU is changing
watch(() => anneeUniversitaire.id, (newIdAU) => {
  if (service.verifyIfNotEmpty(newIdAU)) {
    Promise
    .all([
      restApi.get(`/api/definition-mention/annee/${newIdAU}`),
      restApi.get(`/api/responsable-mention/annee/${newIdAU}`)
    ])
    .then(response => { 
      mention.list = response[0].data; 
      mention.listResponsableMention = response[1].data;
    }) 
    .catch(error => { alert.error(); console.error(error); });
  }
});

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  mention.list = [];
  overlay.show();
  Promise
  .all([
    restApi.get(`/api/annee`),
    restApi.get(`/api/enseignant`)
  ])
  .then(response => { 
    anneeUniversitaire.list = response[0].data; 
    enseignant.list = response[1].data;
    enseignant.setAllFullName();
    overlay.hide();
  })
  .catch(error => { alert.error(); console.error(error); overlay.hide(); });
  if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
    overlay.show();
    Promise
    .all([
      restApi.get(`/api/definition-mention/annee/${anneeUniversitaire.id}`),
      restApi.get(`/api/responsable-mention/annee/${anneeUniversitaire.id}`)
    ])
    .then(response => { 
      mention.list = response[0].data; 
      mention.listResponsableMention = response[1].data;
      overlay.hide();
    }) 
    .catch(error => { alert.error(); console.error(error); overlay.hide(); });
  }
});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Les responsables de mentions</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4" v-if="service.verifyIfNotEmpty(mention.listResponsableMention)">
    <v-col cols="12">
      <p class="font-weight-black pb-2 text-subtitle-1">- Listes des responsables de mentions</p>
    </v-col>
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénoms</th>
            <th>Mention</th>
            <th style="width: 10px !important;">
              <v-btn icon="mdi-autorenew" :loading="loading.responsableMention" title="Actualiser ?" color="red" variant="plain" @click="reloadResponsableMention"></v-btn>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, index) in mention.listResponsableMention" :key="index">
            <template v-if="service.verifyIfNotEmpty(value.idEnseignant)">
              <td>{{ value.nom }}</td>
              <td>{{ value.prenoms }}</td>
              <td>{{ value.acronymeMention }}</td>
              <td class="text-center" style="width: 10px !important;">
                <v-btn icon="mdi-delete" color="red" variant="plain" title="Supprimer ?" @click="deleteResponsableMention(value, index)"></v-btn>
              </td>
            </template>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4" v-if="service.verifyIfNotEmpty(anneeUniversitaire.id)">
    <v-col cols="12">
      <v-card>
        <v-container>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="font-weight-black pb-2 text-subtitle-1">- Remplir le formulaire pour ajouter un responsable de mention</p>
            </v-col>
            <v-col cols="3" class="pr-2">
              <v-select density="comfortable" hide-details="true" label="Mention" :items="mention.list" item-title="acronymeMention" item-value="id" v-model="mention.id"></v-select>
            </v-col>
            <v-col class="px-2">
              <v-select density="comfortable" hide-details="true" label="Enseignant" :items="enseignant.list" item-title="fullName" item-value="id" v-model="enseignant.id"></v-select>
            </v-col>
            <v-col cols="2" class="text-center">
              <v-btn size="large" rounded="pill" title="Ajouter ?" prepend-icon="mdi-plus-circle" color="indigo darken-4" class="text-transform-class text-none" :disabled="!mention.id || !enseignant.id" @click="save">Ajouter</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>