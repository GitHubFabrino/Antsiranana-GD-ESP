<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, watch } from "vue";

// import my Pinia plugins
import { useConcoursStore } from "@/pinia/concours";
import { useAlertStore } from "@/pinia/alert";
import { usePdfStore } from "@/pinia/pdf";
import { useLoadingStore } from "@/pinia/loading";
import { useOverlayStore } from "@/pinia/overlay";
import { ref } from "vue";

// instancing my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instancing my Pinia plugins
const alert = useAlertStore();
const pdf = usePdfStore();
const loading = useLoadingStore();
const overlay = useOverlayStore();
const concours = useConcoursStore();
const index = ref(null);

// auto count Result
function autoCount() {
  concours.listCandidateAdmis = concours.listCandidateMoyenne.filter(
    (candidat) =>
      candidat.passationCandidatCTCI === true &&
      candidat.passationCandidatCTCIAttente === false
  );
}

// counting candidates
function countCandidate() {
  return concours.listCandidateMoyenne.length;
}

// counting candidates "Admis"
function countCandidateAdmis() {
  return concours.listCandidateAdmis.length;
}

// caldulating the percent of "Result"
function percentageAdmis() {
  return Number((countCandidateAdmis() * 100) / countCandidate()).toFixed(2);
}

function percentageAttente() {
  return Number((concours.nombre * 100) / countCandidate()).toFixed(2);
}


// getResutlsCTCIAttente

function printResultAttente(){
  overlay.show();
  setTimeout(() => {
    pdf.getResutlsCTCIAttente(
      concours.listCandidateAttente,
      concours.affiche
    );
  }, 100);
  setTimeout(() => {
    loading.printResultCTCIAttente = false;
    overlay.hide();
  }, 10000);
}

// printing result as PDF
function printResult() {
  overlay.show();
  setTimeout(() => {
    pdf.getResutlsCTCI(
      concours.listCandidateAdmis,
      concours.affiche
    );
  }, 100);
  setTimeout(() => {
    loading.printResultCTCI = false;
    overlay.hide();
  }, 10000);
}

// watch if idCTCI is changing
watch(
  () => concours.idCTCI,
  (newIdCTCI) => {
    concours.nombre = null;
    concours.idCentreCTCI = null;
    concours.listCentre = [];
    concours.listCandidateMoyenne = [];
    overlay.show();
    Promise.all([
      restApi.get(`/api/concours/${newIdCTCI}`),
      restApi.get(`/api/concours/${newIdCTCI}/centre`),
    ])
      .then((response) => {
        concours.idCTCI = response[0].data.id;
        concours.sessionCTCI = response[0].data.sessionCTCI;
        concours.anneeCTCI = response[0].data.anneeCTCI;
        concours.descriptionCTCI = response[0].data.descriptionCTCI;
        concours.listCentre = response[1].data;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
    restApi
      .get(`/api/candidat/concours/${newIdCTCI}/centre`)
      .then((response) => {
        concours.listCandidateMoyenne = response.data;
        concours.listCandidateMoyenne.sort(
          (a, b) => b.moyenneCandidatCTCI - a.moyenneCandidatCTCI
        );
        concours.listCandidateMoyenne.forEach((e) => {
          if (e.passationCandidatCTCIAttente === true) {
            concours.nombre = concours.nombre + 1;
          }
        });

        autoCount();
        concours.listCandidateAttente = concours.listCandidateMoyenne.filter(
          (candidat) =>
            candidat.passationCandidatCTCI === false &&
            candidat.passationCandidatCTCIAttente === true
        );
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
  }
);

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  restApi
    .get(`/api/concours`)
    .then((response) => {
      concours.listConcours = response.data;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
  if (service.verifyIfNotEmpty(concours.idCTCI)) {
    Promise.all([
      restApi.get(`/api/concours/${concours.idCTCI}`),
      restApi.get(`/api/concours/${concours.idCTCI}/centre`),
    ])
      .then((response) => {
        concours.idCTCI = response[0].data.id;
        concours.sessionCTCI = response[0].data.sessionCTCI;
        concours.anneeCTCI = response[0].data.anneeCTCI;
        concours.descriptionCTCI = response[0].data.descriptionCTCI;
        concours.listCentre = response[1].data;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
      overlay.show()

    restApi
      .get(`/api/candidat/concours/${concours.idCTCI}`)
      .then((response) => {
        concours.nombre = null;
        concours.listCandidateMoyenne = response.data;
        concours.listCandidateMoyenne.sort(
          (a, b) => b.moyenneCandidatCTCI - a.moyenneCandidatCTCI
        );
        concours.listCandidateMoyenne.forEach((e) => {
          if (e.passationCandidatCTCIAttente === true) {
            concours.nombre = concours.nombre + 1;
          }
        });
        autoCount();
        concours.listCandidateAttente = concours.listCandidateMoyenne.filter(
          (candidat) =>
            candidat.passationCandidatCTCI === false &&
            candidat.passationCandidatCTCIAttente === true
        );


        overlay.hide();
      })
      .catch((err) => {
        alert.error();
        console.error(err);
        overlay.hide();
      });
  }
  concours.idCentreCTCI = null;
  concours.listCentre = [];
  concours.nomCentreCTCI = null;
  concours.codePostale = null;
});
</script>

<template>
  <v-row v-if="concours.idCTCI" no-gutters class="mt-8">
    <v-col cols="12">
      <h5 class="text-h5">Liste des admis :</h5>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="concours.listCandidateAdmis" class="mb-4 mt-4">
    <v-col class="text-center">
      <h4>
        Nombre des candidats : &nbsp;
        <strong class="text-h5 text-red">{{ countCandidate() }}</strong>
      </h4>
    </v-col>
    <v-col class="text-center">
      <h4>
        Nombre des admis : &nbsp;
        <strong class="text-h5 text-red">{{ countCandidateAdmis() }}</strong>
      </h4>
    </v-col>
    <v-col class="text-center">
      <h4>
        Pourcentage admis : &nbsp;
        <strong v-if="countCandidate()" class="text-h5 text-red"
          >{{ percentageAdmis() }} %</strong
        >
      </h4>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="concours.listCandidateAdmis">
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Numéro</th>
            <th>Nom</th>
            <th>Prénoms</th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="(candidat, keyCandidat) in concours.listCandidateAdmis"
            :key="keyCandidat"
          >
            <tr v-if="concours.listCandidateAdmis">
              <td class="text-truncate">{{ keyCandidat + 1 }}</td>
              <td class="text-truncate">{{ candidat.numeroCandidatCTCI }}</td>
              <td class="text-truncate">{{ candidat.nom }}</td>
              <td class="text-truncate">{{ candidat.prenoms }}</td>
            </tr>
          </template>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="concours.listCandidateAdmis">
    <v-col class="text-center py-8">
      <v-btn
        size="large"
        rounded="pill"
        prepend-icon="mdi-download"
        color="indigo darken-4"
        class="text-transform-class text-none"
        @click="printResult"
        @click.left="loading.printResultCTCI = true"
        :disabled="loading.printResultCTCI"
        :loading="loading.printResultCTCI"
        >Obtenir la version PDF</v-btn
      >
    </v-col>
  </v-row>

  <v-row v-if="concours.idCTCI" no-gutters>
    <v-col cols="12" class="mb-4">
      <h5 class="text-h5">Liste en attente :</h5>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="concours.listCandidateAttente" class="mb-4">
    <v-col class="text-center">
      <h4>
        Nombre des candidats : &nbsp;
        <strong class="text-h5 text-red">{{ countCandidate() }}</strong>
      </h4>
    </v-col>
    <v-col class="text-center">
      <h4>
        Nombre en attente : &nbsp;
        <strong class="text-h5 text-red">{{ concours.nombre }}</strong>
      </h4>
    </v-col>
    <v-col class="text-center">
      <h4>
        Pourcentage en attente : &nbsp;
        <strong v-if="countCandidate()" class="text-h5 text-red"
          >{{ percentageAttente() }} %</strong
        >
      </h4>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="concours.listCandidateAttente">
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Nom</th>
            <th>Prénoms</th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="(candidat, keyCandidat) in concours.listCandidateAttente"
            :key="keyCandidat"
          >
            <tr v-if="concours.listCandidateAttente">
              <td class="text-truncate">{{ candidat.numeroCandidatCTCI }}</td>
              <td class="text-truncate">{{ candidat.nom }}</td>
              <td class="text-truncate">{{ candidat.prenoms }}</td>
            </tr>
          </template>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="concours.listCandidateAttente">
    <v-col class="text-center py-8">
      <v-btn
        size="large"
        rounded="pill"
        prepend-icon="mdi-download"
        color="indigo darken-4"
        class="text-transform-class text-none"
        @click="printResultAttente"
        @click.left="loading.printResultCTCIAttente = true"
        :disabled="loading.printResultCTCIAttente"
        :loading="loading.printResultCTCIAttente"
        >Obtenir la version PDF</v-btn
      >
    </v-col>
  </v-row>
</template>
