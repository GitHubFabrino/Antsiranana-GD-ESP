<script setup>
// import my plugins
import { Cookies } from "@/plugins/cookies";
import { RestApi } from "@/plugins/restApi";

// import Vuejs's plugins
import { onBeforeMount } from "vue";

// import SFC
import ButtonsToScroll from "./ButtonsToScroll.vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useStatusStore } from "@/pinia/status";
import { usePersonneStore } from "@/pinia/personne";
import { useDirectionStore } from "@/pinia/direction";
import { useScolariteStore } from "@/pinia/scolarite";
import { useNavigationStore } from "@/pinia/navigation";
import SystemBar from "./SystemBar.vue";

// instance of my plugins
const cookies = new Cookies();
const restApi = new RestApi();

// instance of my Pinia plugins
const alert = useAlertStore();
const status = useStatusStore();
const personne = usePersonneStore();
const direction = useDirectionStore();
const scolarite = useScolariteStore();
const navigation = useNavigationStore();

// called before mounting
onBeforeMount(() => {
  // formating the status
  personne.status = [];

  status.list = cookies.get("status").split(",");

  // initialise list
  navigation.initList();

  // if (status.getAll().some((s) => ))

  status.getAll().map((itemStatus) => {
    switch (itemStatus) {
      case "SCOLARITE":
        restApi
          .get(`/api/scolarite/personne/${cookies.get("idPersonne")}`)
          .then((response) => {
            scolarite.access.gestionConcoursTCI = Boolean(
              response.data.gestionConcoursTCI
            );
            scolarite.access.gestionInscription = Boolean(
              response.data.gestionInscription
            );
            scolarite.access.gestionAccesTache = Boolean(
              response.data.gestionAccesTache
            );
            personne.status.push(response.data.status);
            navigation.addToList(navigation.getList(String(itemStatus)));
          })
          .catch((error) => {
            alert.error();
            console.error(error);
          });
        break;
        case "PRESIDENT_JURY": 
        scolarite.access.gestionConcoursTCI = true
        navigation.addToList(navigation.getList(String(itemStatus)));

        break;

      case "DIRECTION":
        restApi
          .get(`/api/direction/personne/${cookies.get("idPersonne")}`)
          .then((response) => {
            direction.access.gestionUtilisateur =
              response.data.gestionUtilisateur;
            direction.access.gestionSeminairePedagogiques =
              response.data.gestionSeminairePedagogiques;
            personne.status.push(response.data.status);
            navigation.addToList(navigation.getList(String(itemStatus)));
          })
          .catch((error) => {
            alert.error();
            console.error(error);
          });
        break;

      case "SCOLARITE":
        restApi
          .get(`/api/scolarite/personne/${cookies.get("idPersonne")}`)
          .then((response) => {
            scolarite.access.gestionConcoursTCI =
              response.data.gestionConcoursTCI;
            scolarite.access.gestionInscription =
              response.data.gestionInscription;
            scolarite.access.gestionAccesTache =
              response.data.gestionAccesTache;
            personne.status.push(response.data.status);
            navigation.addToList(navigation.getList(String(itemStatus)));
          })
          .catch((error) => {
            alert.error();
            console.error(error);
          });
        break;

      default:
        navigation.addToList(navigation.getList(String(itemStatus)));
        break;
    }
  });
});
</script>

<template>
  <SystemBar></SystemBar>

  <v-container>
    <v-row no-gutters>
      <v-col>
        <RouterView></RouterView>
      </v-col>
    </v-row>
  </v-container>

  <div id="container-button-scroll-top">
    <ButtonsToScroll></ButtonsToScroll>
  </div>
</template>

<style>
#container-button-scroll-top {
  position: fixed;
  right: 12px;
  bottom: 12px;
}
</style>
