<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, watch } from "vue";

// import my pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useOverlayStore } from "@/pinia/overlay";
import { useMentionStore } from "@/pinia/mention";
import { useEnseignantStore } from "@/pinia/enseignant";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";
import { useConcoursStore } from "@/pinia/concours";

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my pinia plugins
const alert = useAlertStore();
const overlay = useOverlayStore();
const mention = useMentionStore();
const enseignant = useEnseignantStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const concours = useConcoursStore();

// create a "Responsable de mention"
function save() {
  overlay.show();
  restApi
    .post(`/api/test/presidentjury`, {
      idAU: anneeUniversitaire.id,
      idConcour: concours.idCTCI,
      idEnseignant: enseignant.id,
    })
    .then((response) => {
      console.log(response);
      restApi
        .get(`/api/test/presidentjury/list`)
        .then((response) => {
          enseignant.listJury = response.data;
          overlay.hide();
        })
        .catch((err) => {
          alert.error();
          overlay.hide();
        });
      alert.successSave();
    })
    .catch((err) => {
      console.error(err);
      alert.error();
      overlay.hide();
    });
    enseignant.id = ""
    concours.idCTCI = ""
}

// deleting a "Responsable de mention"
function deleteJury(id) {
  restApi
    .delete(`/api/test/presidentjury/delete/${id}`)
    .then((response) => {
      console.log(response);
      restApi
        .get(`/api/test/presidentjury/list`)
        .then((response) => {
          enseignant.listJury = response.data;
        })
        .catch((err) => {
          alert.error();
        });
    })
    .catch((err) => {
      console.error(err);
      alert.error();
    });
}

// watch if AU is changing
watch(
  () => anneeUniversitaire.id,
  (newIdAU) => {
    if (service.verifyIfNotEmpty(newIdAU)) {
      Promise.all([
        restApi.get(`/api/definition-mention/annee/${newIdAU}`),
        restApi.get(`/api/responsable-mention/annee/${newIdAU}`),
      ])
        .then((response) => {
          mention.list = response[0].data;
          mention.listResponsableMention = response[1].data;
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    }
  }
);

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  mention.list = [];
  overlay.show();
  Promise.all([restApi.get(`/api/annee`), restApi.get(`/api/enseignant`)])
    .then((response) => {
      anneeUniversitaire.list = response[0].data;
      enseignant.list = response[1].data;
      enseignant.setAllFullName();
      overlay.hide();
    })
    .catch((error) => {
      alert.error();
      console.error(error);
      overlay.hide();
    });
  if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
    overlay.show();
    Promise.all([
      restApi.get(`/api/definition-mention/annee/${anneeUniversitaire.id}`),
      restApi.get(`/api/responsable-mention/annee/${anneeUniversitaire.id}`),
    ])
      .then((response) => {
        mention.list = response[0].data;
        mention.listResponsableMention = response[1].data;
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
  }

  restApi
    .get(`/api/concours`)
    .then((response) => {
      concours.listConcours = response.data;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });

  restApi
    .get(`/api/test/presidentjury/list`)
    .then((response) => {
      enseignant.listJury = response.data;
    })
    .catch((err) => {
      console.error(err);
      alert.error();
    });
});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Les présidents du jury</h5>
    </v-col>
  </v-row>
  <v-row
    no-gutters
    class="mt-4"
    v-if="service.verifyIfNotEmpty(mention.listResponsableMention)"
  >
    <v-col cols="12">
      <p class="font-weight-black pb-2 text-subtitle-1">
        - Listes des présidents du jury
      </p>
    </v-col>
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénoms</th>
            <th>Date de concours</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, index) in enseignant.listJury" :key="index">
              <td>{{ value.nomPdj }}</td>
              <td>{{ value.prenomPdj }}</td>
              <td>{{ value.session_CTCI }}</td>
              <td class="text-center" style="width: 10px !important">
                <v-btn
                  icon="mdi-delete"
                  color="red"
                  variant="plain"
                  title="Supprimer ?"
                  @click="deleteJury(value.idPDJ)"
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
    v-if="service.verifyIfNotEmpty(anneeUniversitaire.id)"
  >
    <v-col cols="12">
      <v-card>
        <v-container>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="font-weight-black pb-2 text-subtitle-1">
                - Remplir le formulaire pour ajouter un nouveau président du
                jury
              </p>
            </v-col>
            <v-col cols="3" class="pr-2">
              <v-select
                label="Session"
                :items="concours.listConcours"
                item-title="sessionCTCI"
                item-value="id"
                v-model="concours.idCTCI"
                hide-details
              ></v-select>
            </v-col>
            <v-col class="ens px-2">
              <v-select
                hide-details="true"
                label="Enseignant"
                :items="enseignant.list"
                item-title="fullName"
                item-value="id"
                v-model="enseignant.id"
              ></v-select>
            </v-col>
            <v-col cols="2" class="text-center">
              <v-btn
                size="large"
                rounded="pill"
                title="Ajouter ?"
                prepend-icon="mdi-plus-circle"
                color="indigo darken-4"
                class="text-transform-class text-none"
                :disabled="!concours.idCTCI || !enseignant.id"
                @click="save"
                >Ajouter</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>
