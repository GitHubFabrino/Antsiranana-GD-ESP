<script setup>
// import my plugins
import { RestApi } from '@/plugins/restApi';
import { Service } from '@/plugins/service';
import { Cookies } from '@/plugins/cookies';
import { Scroll } from '@/plugins/scroll';

// import Vuejs's plugins
import { onBeforeMount, watch, onBeforeUnmount } from 'vue';

// import my pinia plugins
import { useAlertStore } from '@/pinia/alert';
import { useDialogStore } from '@/pinia/dialog';
import { useLoadingStore } from '@/pinia/loading';
import { useOverlayStore } from '@/pinia/overlay';
import { useNiveauStore } from '@/pinia/niveau';
import { useMentionStore } from '@/pinia/mention';
import { useParcoursStore } from '@/pinia/parcours';
import { useAnneeUniversitaireStore } from '@/pinia/anneeUniversitaire';
import { useInscriptionStore } from '@/pinia/inscription';
import { useEtudiantStore } from '@/pinia/etudiant';

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const cookies = new Cookies();
const scroll = new Scroll();

// instance my pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const loading = useLoadingStore();
const overlay = useOverlayStore();
const niveau = useNiveauStore();
const mention = useMentionStore();
const parcours = useParcoursStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const inscription = useInscriptionStore();
const etudiant = useEtudiantStore();

// getting list inscription pedagogique
function reloadInscriptionPedagogique() {
  if (service.verifyIfNotEmpty(anneeUniversitaire.id) && service.verifyIfNotEmpty(niveau.id) && service.verifyIfNotEmpty(parcours.id)) {
    restApi
    .get(`/api/cursus/definition-parcours/${parcours.id}`)
    .then(response => { inscription.pedagogique = response.data; })
    .catch(error => { alert.error(); console.error(error); });
  }
}

// saving validation inscription pedagogique
function save() {
  dialog.show("Enregistrer ?", "DialogValiderInscriptionPedagogique");
}

// watch if anneeUniversitaire.id is changing
watch(() => anneeUniversitaire.id, (newIdAU) => {
  niveau.id = null;
  mention.id = null;
  parcours.id = null;
  if (service.verifyIfNotEmpty(newIdAU)) {
    Promise
    .all([
      restApi.get(`/api/definition-mention/annee/${newIdAU}`),
      restApi.get(`/api/definition-parcours/annee/${newIdAU}`)
    ])
    .then(response => {
      mention.list = response[0].data;
      parcours.list = response[1].data;
    })
    .catch(error => { alert.error(); console.error(error); });
  }
});

// watch if niveau.id is changing
watch(() => niveau.id, (newIdNiveau) => {
  mention.id = null;
  parcours.id = null;
  inscription.pedagogique = [];
  restApi
  .get(`/api/enseignant/personne/${cookies.get("idPersonne")}`)
  .then(response => { parcours.setListWithAuthorisation(response.data.id); })
  .catch(error => { alert.error(); console.error(error); });
  mention.prepareListWithNiveau();
});

// watch if parcours.id is changing
watch(() => parcours.id ,(newParcoursId) => {
  if (service.verifyIfNotEmpty(newParcoursId)) {
    overlay.show();
    restApi
    .get(`/api/etudiant/inscription-pedagogique/dp/${newParcoursId}`)
    .then(response => { inscription.pedagogique = response.data; overlay.hide(); })
    .catch(error => { alert.error(); console.error(error); overlay.hide(); });
  }
});

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  etudiant.list = [];
  parcours.id = null;
  niveau.id = null;
})

onBeforeUnmount(() => {
  niveau.id = null;
  inscription.pedagogique = [];
  niveau.id = null;
  parcours.id = null;
})
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Validation des inscriptions pédagogiques</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4" v-if="service.verifyIfNotEmpty(inscription.pedagogique)">
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th style="width: 10px !important;">
              <v-btn icon="mdi-autorenew" :loading="loading.inscriptionPedagogique" title="Actualiser ?" color="red" variant="plain" @click="reloadInscriptionPedagogique"></v-btn>
            </th>
            <th>Nom</th>
            <th>Prénoms</th>
            <th>Téléphone</th>
            <th>e-mail</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, index) in inscription.pedagogique" :key="index">
            <td class="text-center"><input type="checkbox" v-model="value.validiteIP"></td>
            <td>{{ value.nom }}</td>
            <td>{{ value.prenoms }}</td>
            <td>{{ value.telephone }}</td>
            <td>{{ value.email }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4" v-if="service.verifyIfNotEmpty(inscription.pedagogique)">
    <v-col class="text-center">
      <v-btn size="large" rounded="pill" prepend-icon="mdi-content-save-all" color="indigo darken-4" class="text-transform-class text-none" @click="save">Enregistrer</v-btn>
    </v-col>
  </v-row>
</template>