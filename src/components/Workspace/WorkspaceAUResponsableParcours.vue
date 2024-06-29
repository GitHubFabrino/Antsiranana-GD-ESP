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
import { useSemestreStore } from '@/pinia/semestre';
import { useParcoursStore } from '@/pinia/parcours';
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
const semestre = useSemestreStore();
const parcours = useParcoursStore();
const enseignant = useEnseignantStore();
const anneeUniversitaire = useAnneeUniversitaireStore();

// create a "Responsable parcours"
function save() {
  let requestPostData = [];
  if (service.verifyIfNotEmpty(parcours.id)) {
    parcours.id.map(item => {
      requestPostData.push({
        id: item,
        idEnseignant: enseignant.id
      });
    });
  }
  if (service.verifyFormIfOK(requestPostData)) dialog.show("Désigner le responsable parcours ?", "DialogCreerResponsableParcours", requestPostData);
  else alert.warningForm();
}

// deleting a "Responsable Parcours"
function deleteResponsableParcours(value, index) {
  dialog.show("Supprimer le responsable parcours ?", "DialogSupprimerResponsableParcours", { value, index });
}

// getting a "Responsable Parcours"
function reloadResponsableParcours() {
  loading.responsableParcours = true;
  restApi
  .get(`/api/responsable-parcours/annee/${anneeUniversitaire.id}`)
  .then(response => { parcours.listResponsableParcours = response.data; loading.responsableParcours = false; }) 
  .catch(error => { alert.error(); console.error(error); loading.responsableParcours = false; });
}

// watch if AU is changing
watch(() => anneeUniversitaire.id, (newIdAU) => {
  if (service.verifyIfNotEmpty(newIdAU)) {
    overlay.show();
    Promise
    .all([
      restApi.get(`/api/definition-parcours/annee/${newIdAU}`),
      restApi.get(`/api/responsable-parcours/annee/${newIdAU}`)
    ])
    .then(response => { 
      parcours.list = response[0].data;
      parcours.list.map(item => { item.designation = String(`${item.acronymeParcours} - ${semestre.getSemestre(item.idSemestre)}`); });
      parcours.listResponsableParcours = response[1].data;
      overlay.hide();
    }) 
    .catch(error => { alert.error(); console.error(error); overlay.hide(); });
  }
});

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  overlay.show();
  Promise
  .all([
    restApi.get(`/api/annee`),
    restApi.get(`/api/enseignant`),
    restApi.get(`/api/semestre`)
  ])
  .then(response => { 
    anneeUniversitaire.list = response[0].data; 
    enseignant.list = response[1].data;
    enseignant.list.map(item => { item.fullName = `${item.nom} ${item.prenoms}`; });
    semestre.list = response[2].data;
    overlay.hide();
  })
  .catch(error => { alert.error(); console.error(error); overlay.hide(); });
  if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
    overlay.show();
    Promise
    .all([
      restApi.get(`/api/definition-parcours/annee/${anneeUniversitaire.id}`),
      restApi.get(`/api/responsable-parcours/annee/${anneeUniversitaire.id}`)
    ])
    .then(response => { 
      parcours.list = response[0].data;
      parcours.list.map(item => { item.designation = String(`${item.acronymeParcours} - ${semestre.getSemestre(item.idSemestre)}`); });
      parcours.listResponsableParcours = response[1].data;
      overlay.hide();
    }) 
    .catch(error => { alert.error(); console.error(error); overlay.hide(); });
  }
});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Les responsables de parcours</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4" v-if="service.verifyIfNotEmpty(parcours.listResponsableParcours)">
    <v-col cols="12">
      <p class="font-weight-black pb-2 text-subtitle-1">- Listes des responsables de parcours</p>
    </v-col>
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénoms</th>
            <th>Parcours</th>
            <th style="width: 10px !important;">
              <v-btn icon="mdi-autorenew" :loading="loading.responsableParcours" title="Actualiser ?" color="red" variant="plain" @click="reloadResponsableParcours"></v-btn>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, index) in parcours.listResponsableParcours" :key="index">
            <template v-if="service.verifyIfNotEmpty(value.idEnseignant)">
              <td>{{ value.nom }}</td>
              <td>{{ value.prenoms }}</td>
              <td>{{ value.parcours }} - {{ semestre.getSemestre(value.idSemestre) }}</td>
              <td class="text-center" style="width: 10px !important;">
                <v-btn icon="mdi-delete" color="red" variant="plain" title="Supprimer ?" @click="deleteResponsableParcours(value, index)"></v-btn>
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
              <p class="font-weight-black pb-2 text-subtitle-1">- Remplir le formulaire pour ajouter un responsable de parcours</p>
            </v-col>
            <v-col class="pr-2">
              <v-select label="Parcours" hide-details="true" density="comfortable" :items="parcours.list" clearable item-title="designation" item-value="id" v-model="parcours.id" chips multiple></v-select>
            </v-col>
            <v-col class="px-2">
              <v-select density="comfortable" hide-details="true" label="Enseignant" :items="enseignant.list" item-title="fullName" item-value="id" v-model="enseignant.id"></v-select>
            </v-col>
            <v-col cols="2" class="text-center">
              <v-btn size="large" rounded="pill" title="Ajouter ?" prepend-icon="mdi-plus-circle" color="indigo" class="text-transform-class text-none mt-1" :disabled="!parcours.id || !enseignant.id"  @click="save">Ajouter</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>