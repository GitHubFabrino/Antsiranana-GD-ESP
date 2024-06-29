<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, ref, watch, onBeforeUnmount } from "vue";

// import my Pinia plugins
import { useDialogStore } from "@/pinia/dialog";
import { useAlertStore } from "@/pinia/alert";
import { useLoadingStore } from "@/pinia/loading";
import { useOverlayStore } from "@/pinia/overlay";
import { useNiveauStore } from "@/pinia/niveau";
import { useInscriptionStore } from "@/pinia/inscription";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";
import { useParcoursStore } from "@/pinia/parcours";

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my Pinia plugins
const dialog = useDialogStore();
const alert = useAlertStore();
const loading = useLoadingStore();
const overlay = useOverlayStore();
const niveau = useNiveauStore();
const inscription = useInscriptionStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const parcours = useParcoursStore();

// create variables
const nom = ref(null);
const autorisations = ref(inscription.autorisations);

// getting authorization
function reloadingAutorisation() {
  if (service.verifyIfNotEmpty(niveau.id)) {
    loading.autorisation = true;
    restApi
      .get(`/api/autorisation/niveau/${niveau.id}`)
      .then((response) => {
        inscription.autorisations = response.data;
        autorisations.value = response.data;
        loading.autorisation = false;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  }
}

// Give Authorization
function giveAutorisations(candidat) {
  dialog.show(
    "Donner l'authentification ?",
    "DialogEnregistrerNumeroRecu",
    candidat
  );
}

watch(
  () => anneeUniversitaire.id,
  (newIdAU) => {
    niveau.id = null;
    autorisations.value = [];
  }
);

// watch if niveau.id is changing
watch(
  () => niveau.id,
  (newNiveauId) => {
    if (
      service.verifyIfNotEmpty(newNiveauId) &&
      service.verifyIfNotEmpty(anneeUniversitaire.id)
    ) {
      overlay.show();
      restApi
        .get(
          `/api/autorisation/niveau/${newNiveauId}/au/${anneeUniversitaire.id}`
        )
        .then((response) => {
          inscription.autorisations = response.data;
          // autorisations.value = response.data;
          console.log(response.data)
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

// before mounting
onBeforeMount(() => {
  scroll.toTop();
  Promise.all([restApi.get(`/api/niveau`), restApi.get(`/api/annee`)])
    .then((response) => {
      niveau.list = response[0].data;
      anneeUniversitaire.list = response[1].data;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
  inscription.autorisations = [];
  parcours.hide = true;
});

onBeforeUnmount(() => {
  parcours.hide = false;
  niveau.id = null;
  parcours.id = null;
});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Listes des personnes autorisées à s'inscrire</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <v-card>
        <v-container>
          <v-row no-gutters>
            <v-col class="pr-2" cols="6">
              <p class="font-weight-black text-subtitle-1 pb-2">
                - Remplir le formulaire par un nom pour le chercher
              </p>
              <v-text-field
                density="comfortable"
                label="Nom"
                v-model="nom"
                clearable
                hide-details="true"
                append-inner-icon="mdi-magnify"
              ></v-text-field>
            </v-col>
            <v-col class="pl-2">
              <p class="font-weight-black text-subtitle-1 ma-8 ml-16">
                - Effectifs :
                <strong class="text-red text-h5">{{
                  inscription.autorisations.length
                }}</strong>
              </p>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
  <v-row
    no-gutters
    class="mt-4"
    v-if="service.verifyIfNotEmpty(inscription.filterAutorisations(nom))"
  >
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th class="text-center">
              <v-btn
                icon="mdi-autorenew"
                :loading="loading.autorisation"
                title="Actualiser ?"
                color="red"
                variant="plain"
                @click="reloadingAutorisation"
              ></v-btn>
            </th>
            <th class="text-truncate">Nom</th>
            <th class="text-truncate">Prénoms</th>
            <th class="text-truncate">Autoriser</th>
            <th class="text-truncate">Numéro du reçu</th>
            <th class="text-truncate">Mot de passe</th>
            <th class="text-truncate">Identifiant</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(candidat, keyCandidat) in inscription.filterAutorisations(
              nom
            )"
            :key="keyCandidat"
          >
            <td class="text-center">
              <v-btn
               
                icon="mdi-script-text-key"
                density="compact"
                class="text-indigo"
                @click="giveAutorisations(candidat)"
              ></v-btn>
            </td>
            <td class="text-truncate">{{ candidat.nom }}</td>
            <td class="text-truncate">{{ candidat.prenoms }}</td>
            <td
              :class="
                candidat.autorisation == false ? 'text-red' : 'text-green'
              "
              class="text-center text-truncate"
            >
              <v-chip>{{
                candidat.autorisation == false ? "Non" : "Oui"
              }}</v-chip>
            </td>
            <td class="text-truncate">{{ candidat.numeroRecu }}</td>
            <td class="text-truncate">{{ candidat.pass_word }}</td>
            <td class="text-truncate">{{ candidat.username }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>
