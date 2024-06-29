<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Scroll } from "@/plugins/scroll";
import { Service } from "@/plugins/service";
import { Cookies } from "@/plugins/cookies";

// import Vuejs's plugins
import { onBeforeMount, watch, ref, onMounted } from "vue";

// import my pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useConcoursStore } from "@/pinia/concours";
import { usePersonneStore } from "@/pinia/personne";
import { useStatusStore } from "@/pinia/status";

// import VueRouter
import { RouterView, useRouter } from "vue-router";

// instance my plugins
const scroll = new Scroll();
const restApi = new RestApi();
const service = new Service();
const cookies = new Cookies();

// instance my pinia plugins
const alert = useAlertStore();
const concours = useConcoursStore();
const personne = usePersonneStore();
const nom = ref(null);
const status = useStatusStore();
const liste = ref([]);
const bool = ref(true);

// watch the change on concours id
watch(
  () => concours.idCTCI,
  (newIdCTCI) => {
    let i = liste.value.map((e) => {
      return e.id;
    });
    bool.value = i.includes(concours.idCTCI);
    concours.listConcours.forEach((e) => {
      if (e.id === concours.idCTCI) {
        concours.affiche = e.sessionCTCI;
      }
    });
    cookies.set("idCTCI", newIdCTCI);
    if (service.verifyIfNotEmpty(newIdCTCI)) {
      Promise.all([
        restApi.get(`/api/concours/${newIdCTCI}`),
        restApi.get(`/api/concours/${newIdCTCI}/centre`),
        restApi.get(`/api/concours/${newIdCTCI}/matiere`),
        restApi.get(`/api/concours/${newIdCTCI}/calendrier`),
        restApi.get(`/api/matiere`),
      ])
        .then((response) => {
          concours.idCTCI = response[0].data.id;
          concours.sessionCTCI = response[0].data.sessionCTCI;
          concours.descriptionCTCI = response[0].data.descriptionCTCI;
          concours.centreConcoursTCI = response[1].data;
          concours.matiereConcoursTCI = response[2].data;
          concours.calendrierConcoursTCI = response[3].data;
          concours.matieres = response[4].data;
        })
        .catch((error) => {
          console.error(error);
        });
    }
    if (service.verifyIfEmpty(newIdCTCI)) {
      concours.idCTCI = null;
      concours.sessionCTCI = null;
      concours.descriptionCTCI = null;
      concours.centreConcoursTCI = [];
      concours.matiereConcoursTCI = [];
      concours.calendrierConcoursTCI = [];
      concours.matieres = [];
    }
  }
);

// called before mounting
onBeforeMount(() => {
  restApi
    .get(`/api/personne/${cookies.get("idPersonne")}`)
    .then((response) => {
      personne.set(response.data);
      nom.value = personne.nom;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });

  scroll.toTop();
  if (service.verifyIfNotEmpty(cookies.get("idCTCI")))
    concours.idCTCI = cookies.get("idCTCI");

  status.getAll().map((itemStatus) => {
    if (itemStatus === "PRESIDENT_JURY") {
      restApi
        .get(`/api/test/presidentjury/list`)
        .then((response) => {
          let data = response.data;
          let val = [];
          data.forEach((element) => {
            if (element.nomPdj === nom.value) {
              val.push({
                id: element.idConcour,
                sessionCTCI: element.session_CTCI,
              });
            }
          });
          let i = val.map((e) => {
            return e.id;
          });
          bool.value = i.includes(concours.idCTCI);
          liste.value = val
        })
        .catch((err) => {
          console.error(err);
          alert.error();
        });
    }
  });

  status.getAll().map((itemStatus) => {
    if (itemStatus === "SCOLARITE") {
      restApi
        .get(`/api/concours`)
        .then((response) => {
          liste.value = response.data;
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    }
  });
});
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <h4 class="text-h4">Concours</h4>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-8">
      <v-col cols="6" class="pr-2">
        <p class="font-weight-black text-subtitle-1 pb-2">
          - Sélectionner la session du concours
        </p>
        <v-select
          label="Session"
          :items="liste"
          item-title="sessionCTCI"
          item-value="id"
          v-model="concours.idCTCI"
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="6" class="pl-2">
        <h1 class="text-center mt-10 text-green">
          {{ concours.affiche }}
        </h1>
      </v-col>
    </v-row>

    <RouterView v-if="bool"></RouterView>
  </v-container>
</template>
