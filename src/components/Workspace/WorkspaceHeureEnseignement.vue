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
import { usePEStore } from '@/pinia/pe';
import { useUEECStore } from '@/pinia/ueec';
import { useNiveauStore } from '@/pinia/niveau';
import { useParcoursStore } from '@/pinia/parcours';
import { useEnseignantStore } from '@/pinia/enseignant';
import { useHeureEnseignementStore } from '@/pinia/heureEnseignement';
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
const pe = usePEStore();
const ueec = useUEECStore();
const niveau = useNiveauStore();
const parcours = useParcoursStore();
const enseignant = useEnseignantStore();
const heureEnseignement = useHeureEnseignementStore();
const anneeUniversitaire = useAnneeUniversitaireStore();

// reload 
function reloadFirstTable() {
  if (service.verifyIfNotEmpty(anneeUniversitaire.id) && service.verifyIfNotEmpty(parcours.id)) {
    loading.firstTable = true;
    restApi
    .get(`/api/heure-enseignement/annee/${anneeUniversitaire.id}/dp/${parcours.id}`)
    .then(response => {
      heureEnseignement.list = response.data;
      heureEnseignement.setListEnseignant();
      loading.firstTable = false;
    })
    .catch(error => { alert.error(); console.error(error); loading.firstTable = false; });
  }
}

// update
function update() {
  dialog.show("Enregistrer ?", "DialogEnregistrerHeureEnseignement");
}

// watch if anneeUniversitaire.id is changing
watch(() => anneeUniversitaire.id, (newIdAU) => {
  niveau.id = null;
  parcours.id = null;
  if (service.verifyIfNotEmpty(newIdAU)) {
    restApi
    .get(`/api/definition-parcours/annee/${newIdAU}`)
    .then(response => { parcours.list = response.data; })
    .catch(error => { alert.error(); console.error(error); });
  }
});

// watch if niveau.id is changing
watch(() => niveau.id, (newIdNiveau) => {
  parcours.id = null;
  parcours.prepareListWithSemestre();
  pe.list = [];
  heureEnseignement.list = [];
});

// watch if parcours.id is changing
watch(() => parcours.id, (newParcoursId) => {
  if (service.verifyIfNotEmpty(newParcoursId)) {
    overlay.show();
    Promise
    .all([
      restApi.get(`/api/programme-enseignement/dp/${newParcoursId}`),
      restApi.get(`/api/heure-enseignement/annee/${anneeUniversitaire.id}/dp/${newParcoursId}`)
    ])    
    .then(response => {
      pe.list = response[0].data;
      pe.setList(newParcoursId);
      heureEnseignement.list = response[1].data;
      heureEnseignement.setListEnseignant();
      overlay.hide();
    })
    .catch(error => { alert.error(); console.error(error); overlay.hide(); });
  }
});

// call it before mounting this component
onBeforeMount(() => {
  scroll.toTop();
  anneeUniversitaire.list = [];
  niveau.list = [];
  ueec.list = [];
  enseignant.list = [];
  parcours.list = [];
  Promise
  .all([
    restApi.get(`/api/annee`),
    restApi.get(`/api/niveau`),
    restApi.get(`/api/associer-ue-ec`),
    restApi.get(`/api/enseignant`)
  ])
  .then(response => { 
    anneeUniversitaire.list = response[0].data;
    niveau.list = response[1].data;
    ueec.list = response[2].data;
    enseignant.list = response[3].data;
    ueec.setListByNomUEEC();
    enseignant.setAllFullName();
  })
  .catch(error => { alert.error(); console.error(error); });
  if (service.verifyIfNotEmpty(parcours.id)) {
    overlay.show();
    Promise
    .all([
      restApi.get(`/api/programme-enseignement/dp/${parcours.id}`),
      restApi.get(`/api/heure-enseignement/annee/${anneeUniversitaire.id}/dp/${parcours.id}`)
    ])    
    .then(response => {
      pe.list = response[0].data;
      pe.setList(parcours.id);
      heureEnseignement.list = response[1].data;
      heureEnseignement.setListEnseignant();
      overlay.hide();
    })
    .catch(error => { alert.error(); console.error(error); overlay.hide(); });
  }
})
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <h4 class="text-h4">Heure Enseignement</h4>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-8">
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">- Comptage des heures d'enseignements</p>
      </v-col>
      <v-col cols="4" class="pr-2">
        <v-select density="comfortable" label="Année universitaire" :items="anneeUniversitaire.list" item-title="nomAU" item-value="id" v-model="anneeUniversitaire.id"></v-select>
      </v-col>
      <v-col cols="4" class="px-2">
        <v-select density="comfortable" label="Niveau" :items="niveau.list" item-title="niveau" item-value="id" v-model="niveau.id"></v-select>
      </v-col>
      <v-col cols="4" class="pl-2">
        <v-select density="comfortable" label="Parcours" :items="parcours.listWithSemestre" item-title="designation" item-value="id" v-model="parcours.id"></v-select>
      </v-col>
    </v-row>
    <v-row no-gutters v-if="service.verifyIfNotEmpty(heureEnseignement.list)">
      <v-col cols="12">
        <v-table class="elevation-1" density="compact">
          <thead>
            <tr>
              <!-- <th style="width: 200px !important;">Unité Enseignement</th> -->
              <th>Élément constitutif</th>
              <th>Enseignant</th>
              <th style="width: 10px !important;">ET</th>
              <th style="width: 10px !important;">ED</th>
              <th style="width: 10px !important;">TP</th>
              <th style="width: 10px !important;">Autre</th>
              <th style="width: 10px !important;">Totale</th>
              <!-- <th style="width: 10px !important;">
                <v-btn icon="mdi-autorenew" :loading="loading.firstTable" title="Actualiser ?" color="red" variant="plain" @click="reloadFirstTable"></v-btn>
              </th> -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, index) in heureEnseignement.list" :key="index">
              <!-- <td>{{ value.nomUE }}</td> -->
              <td class="text-truncate">{{ value.nomEC }}</td>
              <td class="text-truncate">{{ value.fullName }}</td>
              <td><v-text-field variant="outlined" density="compact" v-model="value.comptageHeureET" hide-details="true" type="number" style="width: 75px;"></v-text-field></td>
              <td><v-text-field variant="outlined" density="compact" v-model="value.comptageHeureED" hide-details="true" type="number" style="width: 75px;"></v-text-field></td>
              <td><v-text-field variant="outlined" density="compact" v-model="value.comptageHeureTP" hide-details="true" type="number" style="width: 75px;"></v-text-field></td>
              <td><v-text-field variant="outlined" density="compact" v-model="value.comptageHeureAutre" hide-details="true" type="number" style="width: 75px;"></v-text-field></td>
              <td><v-text-field variant="outlined" density="compact" v-model="value.comptageHeureTotal" hide-details="true" type="number" style="width: 75px;"></v-text-field></td>
              <!-- <td></td> -->
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-4" v-if="service.verifyIfNotEmpty(heureEnseignement.list)">
      <v-col class="text-center">
        <v-btn size="large" rounded="pill" prepend-icon="mdi-content-save-all" color="indigo darken-4" class="text-transform-class text-none" @click="update">Enregistrer</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>