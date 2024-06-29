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
  concours.listStatistics = [];
  concours.listCentre.map((centre) => {
    if (service.verifyIfNotEmpty(centre.id_centreCTCI)) {
      concours.countCandidate = 0;
      concours.countCandidateAdmis = 0;
      Promise.all([
        restApi.get(`/api/candidat/centre/${centre.id_centreCTCI}`),
        restApi.get(
          `/api/candidat/concours/${concours.idCTCI}/centre/${centre.id_centreCTCI}`
        ),
      ])
        .then((response) => {
          let listCandidateMoyenne = response[1].data;
          let listCandidateAdmis = listCandidateMoyenne.filter(
            (candidat) => candidat.passationCandidatCTCI === true
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
          restApi
            .get(`/api/candidat/concours/${concours.idCTCI}`)
            .then((response) => {
              concours.countCandidate = response.data.length;
              concours.countCandidateAdmis = response.data.filter(
                (candidat) =>
                  candidat.passationCandidatCTCI === true &&
                  candidat.passationCandidatCTCIAttente === false
              ).length;
              overlay.hide()

            })
            .catch((err) => {
              alert.error();
              console.error(err);
              overlay.hide();
            });

        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }
  )


}

// watch if idCTCI is changing
watch(
  () => concours.idCTCI,
  (newIdCTCI) => {
    overlay.show();
    concours.idCentreCTCI = null;
    concours.listCentre = [];
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
        prepareStatistics();
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
  overlay.show()
  scroll.toTop();
  anneeUniversitaire.list = [];
  niveau.list = [];
  Promise.all([
    restApi.get(`/api/concours`),
    restApi.get(`/api/annee`),
    restApi.get(`/api/niveau`),
  ])
    .then((response) => {
      concours.listConcours = response[0].data;
      anneeUniversitaire.list = response[1].data;
      niveau.list = response[2].data;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
      overlay.hide();
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
        prepareStatistics()

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
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <p class="font-weight-black pb-2 text-subtitle-1">
        - Statistiques du concours
      </p>
    </v-col>
    <v-col>
      <v-table
        class="elevation-1"
        density="compact"
        v-if="
          service.verifyIfNotEmpty(concours.countCandidate) &&
          service.verifyIfNotEmpty(concours.countCandidateAdmis)
        "
      >
        <thead>
          <tr>
            <th>Centre</th>
            <th>Nombre de candidat</th>
            <th>Nombre des admis</th>
            <th>Pourcentage admis</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="statistic in concours.listStatistics">
            <td>
              <h3>
                <strong
                  >{{ statistic.nomCentreCTCI }} &nbsp;
                  {{ statistic.codePostale }}</strong
                >
              </h3>
            </td>
            <td>
              <h3>
                <strong>{{ statistic.nombreCandidate }}</strong>
              </h3>
            </td>
            <td>
              <h3>
                <strong>{{ statistic.nombreCandidateAdmis }}</strong>
              </h3>
            </td>
            <td>
              <h3>
                <strong>{{ statistic.pourcentage }} %</strong>
              </h3>
            </td>
          </tr>
          <tr>
            <td>
              <h3><strong>TOTAL</strong></h3>
            </td>
            <td>
              <h3>
                <strong>{{ concours.countCandidate }}</strong>
              </h3>
            </td>
            <td>
              <h3>
                <strong>{{ concours.countCandidateAdmis }}</strong>
              </h3>
            </td>
            <td>
              <h3>
                <strong
                  >{{
                    percentage(
                      concours.countCandidateAdmis,
                      concours.countCandidate
                    )
                  }}
                  %</strong
                >
              </h3>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>
