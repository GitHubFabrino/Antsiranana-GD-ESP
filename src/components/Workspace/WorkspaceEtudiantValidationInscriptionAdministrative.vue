<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, ref, watch, onBeforeUnmount } from "vue";

// import my pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
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

// instance my pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const loading = useLoadingStore();
const overlay = useOverlayStore();
const niveau = useNiveauStore();
const inscription = useInscriptionStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const parcours = useParcoursStore();

// create variables
const nom = ref(null);

// Visualize Dossier
function voireDossier(id, idPersonne, idEtudiant) {
  dialog.show(
    "Valider l'inscription administrative ?",
    "DialogValiderInscriptionAdministrative",
    { id, idPersonne, idEtudiant }
  );
}

// getting list Inscription administrative
function reloading() {
  if (
    service.verifyIfNotEmpty(niveau.id) &&
    service.verifyIfNotEmpty(anneeUniversitaire.id)
  ) {
    overlay.show();
    restApi
      .get(
        `/api/inscription-administrative/annee/${anneeUniversitaire.id}/niveau/${niveau.id}`
      )
      .then((response) => {
        inscription.administrative = response.data;
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
  }
}

// watch if niveau.id is changing
watch(
  () => niveau.id,
  (newIdNiveau) => {
    if (
      service.verifyIfNotEmpty(newIdNiveau) &&
      service.verifyIfNotEmpty(anneeUniversitaire.id)
    ) {
      overlay.show();
      restApi
        .get(
          `/api/inscription-administrative/annee/${anneeUniversitaire.id}/niveau/${newIdNiveau}`
        )
        .then((response) => {
          inscription.administrative = response.data;
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
  Promise.all([restApi.get(`/api/niveau`), restApi.get(`/api/annee`)])
    .then((response) => {
      niveau.list = response[0].data;
      anneeUniversitaire.list = response[1].data;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
  niveau.id = null;
  parcours.hide = true;
});

onBeforeUnmount(() => {
  niveau.id = null;
  inscription.administrative = [];
  parcours.hide = false;
  niveau.id = null;
  parcours.id = null;
});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Validation des inscriptions administratives</h5>
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
                  inscription.administrative.length
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
    v-if="service.verifyIfNotEmpty(inscription.filteradministrative(nom))"
  >
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénoms</th>
            <th>Inscrit(e)</th>
            <th class="text-center" style="width: 10px !important">
              <v-btn
                icon="mdi-autorenew"
                :loading="loading.manageInscriptionA"
                title="Actualiser ?"
                color="red"
                variant="plain"
                @click="reloading"
              ></v-btn>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(value, index) in inscription.filteradministrative(nom)"
            :key="index"
          >
            <td class="text-truncate">{{ value.nom }}</td>
            <td class="text-truncate">{{ value.prenoms }}</td>
            <td :class="value.validiteIA ? 'text-green' : 'text-red'">
              <v-chip>{{ value.validiteIA ? "Oui" : "Non" }}</v-chip>
            </td>
            <td>
              <v-btn
                color="indigo darken-4"
                size="small"
                prepend-icon="mdi-folder-eye"
                class="text-none"
                @click="
                  voireDossier(value.id, value.idPersonne, value.idEtudiant)
                "
                >Voir</v-btn
              >
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>
