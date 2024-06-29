<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, watch } from "vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
import { useConcoursStore } from "@/pinia/concours";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";
import { useNiveauStore } from "@/pinia/niveau";
import { useOverlayStore } from "@/pinia/overlay";

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my Pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const concours = useConcoursStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const niveau = useNiveauStore();
const overlay = useOverlayStore();

// calculating the percent
function percentage(value1, value2) {
  let result = Number((value1 * 100) / Number(value2)).toFixed(2);
  if (result >= 0) return result;
  else return 0;
}

// making statistics
function prepareStatistics() {
  concours.listCentre.map((centre) => {
    if (service.verifyIfNotEmpty(centre.id_centreCTCI)) {
      overlay.show();
      Promise.all([
        restApi.get(`/api/candidat/centre/${centre.id_centreCTCI}`),
        restApi.get(
          `/api/candidat/concours/${concours.idCTCI}/centre/${centre.id_centreCTCI}`
        ),
      ])
        .then((response) => {
          let listCandidateMoyenne = response[1].data;
          let listCandidateAdmis = listCandidateMoyenne.filter(
            (candidat) => candidat.passationCandidatCTCI == true
          );
          concours.listStatistics.push({
            idCentreCTCI: centre.id,
            nomCentreCTCI: centre.nomCentreCTCI,
            codePostale: centre.codePostale,
            nombreCandidate: response[0].data.length,
            nombreCandidateAdmis: listCandidateAdmis.length,
            pourcentage: percentage(
              listCandidateAdmis.length,
              response[0].data.length
            ),
          });
          concours.countCandidate += response[0].data.length;
          concours.countCandidateAdmis += listCandidateAdmis.length;
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  });
}

// Allow "Candidat" to register in TCI
function autorisationInscription() {
  let requestPostData = { idAU: anneeUniversitaire.id, idNiveau: niveau.id };
  if (service.verifyFormIfOK(requestPostData))
    dialog.show(
      `Autoriser les candidats admis à s'inscrire ?`,
      "DialogAutoriserInscription",
      requestPostData
    );
  else alert.warningForm();
}

function autorisationInscriptionAttente() {
  let requestPostData = { idAU: anneeUniversitaire.id, idNiveau: niveau.id };
  if (service.verifyFormIfOK(requestPostData))
    dialog.show(
      `Autoriser les candidats en attente à s'inscrire ?`,
      "DialogAutoriserInscriptionAttente",
      requestPostData
    );
  else alert.warningForm();
}

// watch if idCTCI is changing
watch(
  () => concours.idCTCI,
  (newIdCTCI) => {
    concours.idCentreCTCI = null;
    concours.listCentre = [];
    concours.listStatistics = [];
    concours.countCandidate = 0;
    concours.countCandidateAdmis = 0;
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
        prepareStatistics()
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
  concours.listStatistics = [];
  concours.countCandidate = 0;
  concours.countCandidateAdmis = 0;
  anneeUniversitaire.list = [];
  niveau.list = [];
  overlay.show();
  Promise.all([
    restApi.get(`/api/concours`),
    restApi.get(`/api/annee`),
    restApi.get(`/api/niveau`),
  ])
    .then((response) => {
      concours.listConcours = response[0].data;
      anneeUniversitaire.list = response[1].data;
      niveau.list = response[2].data;
      overlay.hide();
    })
    .catch((error) => {
      alert.error();
      console.error(error);
      overlay.hide();
    });
  if (service.verifyIfNotEmpty(concours.idCTCI)) {
    overlay.show();
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
        prepareStatistics()
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
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
  <v-row no-gutters class="mt-8">
    <v-col cols="12">
      <h5 class="text-h5">Autorisation des admis à s'inscrire</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-8">
    <v-col cols="12">
      <v-card>
        <v-container>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="font-weight-black pb-2 text-subtitle-1">
                - Formulaire pour choisir le niveau et l'année universitaire de
                l'autorisation
              </p>
            </v-col>
            <v-col cols="6" class="pr-2">
              <v-select
                density="comfortable"
                label="Année universitaire"
                :items="anneeUniversitaire.list"
                item-title="nomAU"
                item-value="id"
                v-model="anneeUniversitaire.id"
              ></v-select>
            </v-col>
            <v-col cols="6" class="pl-2">
              <v-select
                density="comfortable"
                label="Niveau"
                :items="niveau.list"
                item-title="niveau"
                item-value="id"
                v-model="niveau.id"
              ></v-select>
            </v-col>
            <v-col class="text-center">
              <v-btn
                size="large"
                rounded="pill"
                prepend-icon="mdi-checkbox-marked-circle-outline"
                color="indigo darken-4"
                class="text-transform-class text-none"
                @click="autorisationInscription"
                >Autoriser les candidats admis à s'inscrire</v-btn
              >
            </v-col>
            <v-col class="text-center">
              <v-btn
                size="large"
                rounded="pill"
                prepend-icon="mdi-checkbox-marked-circle-outline"
                color="indigo darken-4"
                class="text-transform-class text-none"
                @click="autorisationInscriptionAttente"
                >Autoriser les candidats en attente à s'inscrire</v-btn
              >
            </v-col>
            
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>
