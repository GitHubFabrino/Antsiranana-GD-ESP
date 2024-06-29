<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, ref, watch } from "vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useLoadingStore } from "@/pinia/loading";
import { useConcoursStore } from "@/pinia/concours";
import { useOverlayStore } from "@/pinia/overlay";
import { usePdfStore } from "@/pinia/pdf";

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my Pinia plugins
const alert = useAlertStore();
const pdf = usePdfStore();
const loading = useLoadingStore();
const concours = useConcoursStore();
const overlay = useOverlayStore();
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

function printlist() {
  overlay.show();
  setTimeout(() => {
    pdf.getlisteCandidat(
      concours.listCandidate,
      concours.nomCentreCTCI,
      concours.codePostale,
      concours.sessionCTCI
    );
  }, 100);
  setTimeout(() => {
    loading.printlistCandidat = false;
    overlay.hide();
  }, 10000);
}

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
        concours.descriptionCTCI = response[0].data.descriptionCTCI;
        concours.listCentre = response[1].data;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  }
  concours.idCentreCTCI = null;
  concours.codePostale = null;
  concours.nomCentreCTCI = null;
  concours.listCandidate = [];
});
</script>

<template>
  <v-row no-gutters class="mt-8">
    <v-col cols="12">
      <h5 class="text-h5">Liste des candidats</h5>
    </v-col>
  </v-row>
  <v-row
    no-gutters
    class="mt-4"
    v-if="service.verifyIfNotEmpty(concours.listCentre)"
  >
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
    <v-col class="px-2">
      <h1 class="text-center text-green">
        {{ concours.nomCentreCTCI }} &nbsp;&nbsp; {{ concours.codePostale }}
      </h1>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="service.verifyIfNotEmpty(concours.listCandidate)">
    <v-col cols="12">
      <p class="font-weight-black pb-2 text-subtitle-1">
        - Liste des candidats de ce centre
      </p>
    </v-col>
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Nom</th>
            <th>Prénoms</th>
            <th>Téléphone</th>
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
            <td>{{ candidat.numeroCandidatCTCI }}</td>
            <td>{{ candidat.nom }}</td>
            <td>{{ candidat.prenoms }}</td>
            <td>{{ candidat.telephone }}</td>
            <td></td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row no-gutters v-if="service.verifyIfNotEmpty(concours.listCandidate)">
    <v-col class="text-center py-8">
      <v-btn
        size="large"
        rounded="pill"
        prepend-icon="mdi-download"
        color="indigo darken-4"
        class="text-transform-class text-none"
        v-on:click="printlist"
        >Obtenir la version PDF</v-btn
      >
    </v-col>
  </v-row>
</template>
