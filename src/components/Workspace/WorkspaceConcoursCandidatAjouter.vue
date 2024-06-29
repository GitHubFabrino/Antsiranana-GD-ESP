<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";

// import Vuejs's plugins
import { onBeforeMount, ref, watch } from "vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
import { useLoadingStore } from "@/pinia/loading";
import { useConcoursStore } from "@/pinia/concours";
import { useOverlayStore } from "@/pinia/overlay";

// instance my plugins
const restApi = new RestApi();
const service = new Service();

// instance my Pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const loading = useLoadingStore();
const concours = useConcoursStore();
const overlay = useOverlayStore();

// create variables
const nom = ref(null);
const prenoms = ref(null);
const telephone = ref(null);
const index = ref(null);

// getting "Candidat"
function reloadingCandidatCTCI() {
  if (service.verifyIfNotEmpty(concours.idCentreCTCI)) {
    loading.candidatCTCI = true;
    concours.listCentre.map((item) => {
      if (item.id == concours.idCentreCTCI) {
        concours.idCentreCTCI = item.id;
        concours.nomCentreCTCI = item.nomCentreCTCI;
        concours.codePostale = item.codePostale;
      }
    });
    restApi
      .get(`/api/candidat/centre/${concours.idCentreCTCI}`)
      .then((response) => {
        concours.listCandidate = response.data;
        loading.candidatCTCI = false;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  }
}

// creating the "Numero concours"
function createNumber() {
  let numeroCandidatCTCI = "";
  if (concours.listCandidate.length == 0) {
    numeroCandidatCTCI = Number(concours.codePostale * 1000) + 1;
  }
  if (concours.listCandidate.length > 0) {
    numeroCandidatCTCI =
      Number(
        concours.listCandidate[concours.listCandidate.length - 1]
          .numeroCandidatCTCI
      ) + 1;
  }
  return numeroCandidatCTCI;
}

// adding candidat
function addCandidate() {
  let formTestData = {
    nom: nom.value,
    telephone: telephone.value,
    numeroCandidatCTCI: createNumber(),
    idCentreCTCI: concours.idCentreCTCI,
  };
  if (service.verifyFormIfOK(formTestData)) {
    concours.addCandidate({
      nom: nom.value,
      prenoms: prenoms.value,
      telephone: telephone.value,
      numeroCandidatCTCI: createNumber(),
      idCentreCTCI: concours.idCentreCTCI,
    });
    nom.value = null;
    prenoms.value = null;
    telephone.value = null;
  } else alert.warningForm();
}

// deleting Candidat
function deleteCandidate(candidat, index) {
  dialog.show("Supprimer le candidat ?", "DialogSupprimerCandidatConcours", {
    candidat: candidat,
    index: index,
  });
}

// saving Candidat
function saveCandidate() {
  dialog.show(
    "Enregistrer les candidats ?",
    "DialogEnregistrerCandidatConcours"
  );
}

// watch if idCTCI is changing
watch(
  () => concours.idCTCI,
  (newIdCTCI) => {
    concours.nomCentreCTCI = null;
    concours.codePostale = null;
    Promise.all([
      restApi.get(`/api/concours/${newIdCTCI}`),
      restApi.get(`/api/concours/${newIdCTCI}/centre`),
    ])
      .then((response) => {
        concours.idCTCI = response[0].data.id;
        concours.sessionCTCI = response[0].data.sessionCTCI;
        concours.descriptionCTCI = response[0].data.descriptionCTCI;
        concours.listCentre = response[1].data;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
    concours.idCentreCTCI = null;
  }
);

onBeforeMount(()=>{
  Promise.all([
      restApi.get(`/api/concours/${concours.idCTCI}`),
      restApi.get(`/api/concours/${concours.idCTCI}/centre`),
    ])
      .then((response) => {
        concours.idCTCI = response[0].data.id;
        concours.sessionCTCI = response[0].data.sessionCTCI;
        concours.descriptionCTCI = response[0].data.descriptionCTCI;
        concours.listCentre = response[1].data;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
})

// watch if idCentreCTCI is changing
watch(
  () => concours.idCentreCTCI,
  (newIdCentreCTCI) => {
    index.value = concours.listCentre
      .map((l) => {
        return l.id_centreCTCI;
      })
      .indexOf(concours.idCentreCTCI);
    concours.nomCentreCTCI = concours.listCentre[index.value].nomCentreCTCI;
    concours.codePostale = concours.listCentre[index.value].codePostale;

    if (service.verifyIfNotEmpty(newIdCentreCTCI)) {
      overlay.show();
      concours.listCentre.map((item) => {
        if (item.id == newIdCentreCTCI) {
          concours.idCentreCTCI = item.id;
          concours.nomCentreCTCI = item.nomCentreCTCI;
          concours.codePostale = item.codePostale;
        }
      });
      restApi
        .get(`/api/candidat/centre/${newIdCentreCTCI}`)
        .then((response) => {
          concours.listCandidate = response.data;
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }
);
</script>

<template>
  <v-row no-gutters class="mt-8">
    <v-col cols="12">
      <h5 class="text-h5">Ajout des candidats</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <p class="font-weight-black pb-2 text-subtitle-1">
        - Sélectionnez le centre d'examen
      </p>
    </v-col>
    <v-col class="pr-2">
      <v-select
        label="Centre"
        density="comfortable"
        :items="concours.listCentre"
        item-title="nomCentreCTCI"
        item-value="id_centreCTCI"
        v-model="concours.idCentreCTCI"
      ></v-select>
    </v-col>
    <v-col class=" px-4">
      <h1 class="text-center text-green">
        {{ concours.nomCentreCTCI }} &nbsp;&nbsp; {{ concours.codePostale }}
      </h1>
      <h1 class="text-center text-green">
         Nombres des candidats : &nbsp;&nbsp; {{ concours.listCandidate.length }}
      </h1>
    </v-col>
  </v-row>
  <v-row
    no-gutters
    class="mt-4"
    v-if="service.verifyIfNotEmpty(concours.listCandidate)"
  >
    <v-col cols="12">
      <p class="font-weight-black pb-2 text-subtitle-1">
        - Liste des candidats de ce centre
      </p>
    </v-col>
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th class="text-start" style="width: 150px">Numéro</th>
            <th class="text-start">Nom</th>
            <th class="text-start">Prénoms</th>
            <th class="text-start" style="width: 200px">Téléphone</th>
            <th style="width: 10px !important">
              <v-btn
                icon="mdi-autorenew"
                :loading="loading.candidatCTCI"
                title="Actualiser ?"
                color="red"
                variant="plain"
                @click="reloadingCandidatCTCI"
              ></v-btn>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(candidat, indexCandidat) in concours.listCandidate"
            :key="indexCandidat"
          >
            <td class="text-start">
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="candidat.numeroCandidatCTCI"
                hide-details="true"
              ></v-text-field>
            </td>
            <td class="text-start">
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="candidat.nom"
                hide-details="true"
              ></v-text-field>
            </td>
            <td class="text-start">
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="candidat.prenoms"
                hide-details="true"
              ></v-text-field>
            </td>
            <td class="text-start">
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="candidat.telephone"
                hide-details="true"
              ></v-text-field>
            </td>
            <td class="text-center px-none" style="width: 10px !important">
              <v-btn
                icon="mdi-delete"
                color="red"
                variant="plain"
                title="Supprimer ?"
                @click="deleteCandidate(candidat, indexCandidat)"
              ></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row
    no-gutters
    class="mt-4"
    v-if="service.verifyIfNotEmpty(concours.idCentreCTCI)"
  >
    <v-col cols="12">
      <v-card>
        <v-container>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="font-weight-black pb-2 text-subtitle-1">
                - Remplir ce formulaire pour ajouter un candidat
              </p>
            </v-col>
            <v-col class="pr-2">
              <v-text-field
                density="comfortable"
                v-model="nom"
                clearable
                label="Nom"
                hide-details="true"
              ></v-text-field>
            </v-col>
            <v-col class="px-2">
              <v-text-field
                density="comfortable"
                v-model="prenoms"
                clearable
                label="Prénoms"
                hide-details="true"
              ></v-text-field>
            </v-col>
            <v-col class="px-2">
              <v-text-field
                density="comfortable"
                v-model="telephone"
                clearable
                label="Numéro du téléphone"
                @keypress.enter="addCandidate"
                hide-details="true"
              ></v-text-field>
            </v-col>
            <v-col cols="2" class="d-flex justify-center my-1">
              <v-btn
                size="large"
                rounded="pill"
                title="Ajouter ?"
                prepend-icon="mdi-plus-circle"
                color="indigo darken-4"
                class="text-transform-class text-none"
                @click="addCandidate"
                >Ajouter</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="service.verifyIfNotEmpty(concours.listCandidate)">
    <v-col class="text-center py-8">
      <v-btn
        size="large"
        rounded="pill"
        prepend-icon="mdi-content-save-all"
        color="indigo darken-4"
        class="text-transform-class text-none"
        @click="saveCandidate(concours.idCentreCTCI)"
        >Enregistrer</v-btn
      >
    </v-col>
  </v-row>
</template>
