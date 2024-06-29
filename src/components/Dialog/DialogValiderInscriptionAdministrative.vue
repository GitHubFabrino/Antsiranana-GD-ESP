<script setup>
// import my plugins
import { Service } from '@/plugins/service';
import { RestApi } from '@/plugins/restApi';

// import Vuejs plugins
import { ref, onBeforeMount } from 'vue';

// import my Pinia plugins
import { useDialogStore } from '@/pinia/dialog';
import { useInscriptionStore } from '@/pinia/inscription';

// instance my plugins
const service = new Service();
const restApi = new RestApi();

// instance my pinia plugins
const dialog = useDialogStore();
const inscription = useInscriptionStore();

// create variable
const personne = ref({})

// when the user is saying YES
function oui() {
  inscription.validate(dialog.data.id, 1);
  dialog.hide();
}

// when the user is saying NO
function non() {
  inscription.validate(dialog.data.id, 0);
  dialog.hide();
}

function annuler() {
  dialog.hide();
}

// called before mounting
onBeforeMount(() => {
  if (service.verifyIfNotEmpty(dialog.data.idPersonne) && service.verifyIfNotEmpty(dialog.data.id) && service.verifyIfNotEmpty(dialog.data.idEtudiant)) {
    Promise
    .all([
      restApi.get(`/api/personne/${dialog.data.idPersonne}`),
      restApi.get(`/api/etudiant/personne/${dialog.data.idPersonne}`)
    ])
    .then(response => { 
      personne.value = response[0].data;
      personne.value.anneeBacc = response[1].data.anneeBacc;
      if (service.verifyIfNotEmpty(response[1].data.idBacc)) {
        restApi
        .get(`/api/bacc/${response[1].data.idBacc}`)
        .then(response => { personne.value.bacc = response.data.bacc; })
        .catch(error => { alert.error(); console.error(error); loading.personne = false; });
      }
    })
    .catch(error => { alert.error(); console.error(error); loading.personne = false; });
  }
})
</script>

<template>
  <v-card-text>
    <v-container>
      <v-row>
        <v-col cols="12" class="d-flex justify-center">
          <ul class="text-start">
            <li>Nom : <strong class="text-green">{{ personne.nom }}</strong></li>
            <li>Prénoms : <strong class="text-green">{{ personne.prenoms }}</strong></li>
            <li>Sexe : <strong class="text-green">{{ personne.sexe }}</strong></li>
            <li>Date de naissance : <strong class="text-green">{{ personne.dateNaissance }}</strong></li>
            <li>Lieu de naissance : <strong class="text-green">{{ personne.lieuNaissance }}</strong></li>
            <li>Ville de naissance : <strong class="text-green">{{ personne.villeNaissance }}</strong></li>
            <li>Pays de naissance : <strong class="text-green">{{ personne.paysNaissance }}</strong></li>
            <li>Nationalité : <strong class="text-green">{{ personne.nationalite }}</strong></li>
            <li>Adresse : <strong class="text-green">{{ personne.adresse }}</strong></li>
            <li>Numéro du CIN : <strong class="text-green">{{ personne.numeroCIN }}</strong></li>
            <li>Date de délivrance du CIN : <strong class="text-green">{{ personne.dateDelivreCIN }}</strong></li>
            <li>Ville de délivrance du CIN : <strong class="text-green">{{ personne.villeDelivreCIN }}</strong></li>
            <li>Affiliation 1 : <strong class="text-green">{{ personne.affiliation1 }}</strong></li>
            <li>Affiliation 2 : <strong class="text-green">{{ personne.affiliation2 }}</strong></li>
            <li>Numéro téléphone : <strong class="text-green">{{ personne.telephone }}</strong></li>
            <li>Adresse e-mail : <strong class="text-green">{{ personne.email }}</strong></li>
            <li>BACC : <strong class="text-green">{{ personne.bacc }}</strong></li>
            <li>BACC année d'obtention : <strong class="text-green">{{ personne.anneeBacc }}</strong></li>
          </ul>
        </v-col>
      </v-row>
    </v-container>
  </v-card-text>

  <!-- Making decision Yes or No -->
  <v-card-actions class="d-flex justify-space-around">
    <v-btn rounded="pill" class="px-6" prepend-icon="mdi-comment-check" variant="tonal" color="success" @click="oui">OUI</v-btn>
    <v-btn rounded="pill" class="px-6" prepend-icon="mdi-comment-check" variant="tonal" color="warning" @click="annuler">Annuler</v-btn>
    <v-btn rounded="pill" class="px-6" prepend-icon="mdi-comment-remove" variant="tonal" color="red" @click="non">NON</v-btn>
  </v-card-actions>
</template>