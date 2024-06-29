<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, watch, ref } from "vue";

// import my Pinia plugins
import { useDialogStore } from "@/pinia/dialog";
import { useAlertStore } from "@/pinia/alert";
import { useLoadingStore } from "@/pinia/loading";
import { useMentionStore } from "@/pinia/mention";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";
import { useNiveauStore } from "@/pinia/niveau";
import { useSemestreStore } from "@/pinia/semestre";
import { useParcoursStore } from "@/pinia/parcours";
import { useOverlayStore } from "@/pinia/overlay";
import { usedisableStore } from '@/pinia/disable'


// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my pinia plugins
const dialog = useDialogStore();
const alert = useAlertStore();
const loading = useLoadingStore();
const mention = useMentionStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const niveau = useNiveauStore();
const semestre = useSemestreStore();
const parcours = useParcoursStore();
const overlay = useOverlayStore();
const disable = usedisableStore()


// creates my variables
const AU = ref(null);

// getting Parcours
function reloadingParcours() {
  if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
    loading.parcours = true;
    restApi
      .get(`/api/definition-parcours/annee/${anneeUniversitaire.id}`)
      .then((response) => {
        parcours.list = response.data;
        loading.parcours = false;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  }
}

// Adding Parcours
function addParcours() {
  // mention.id.map(itemMention => {
  disable.disableOne = true
  semestre.id.map((itemSemestre) => {
    parcours.list.push({
      idAU: anneeUniversitaire.id,
      idNiveau: niveau.id,
      idSemestre: itemSemestre,
      idDM: mention.id,
      parcours: parcours.designation,
      acronymeParcours: parcours.acronyme,
    });
  });
  // });
  niveau.id = null;
  semestre.id = null;
  mention.id = null;
  parcours.designation = null;
  parcours.acronyme = null;
}

// saving Parcours
function saveParcours() {
  dialog.show("Enregistrer le parcours ?", "DialogEnregistrerParcours");
}

// deleting Parcours
function deleteParcours(item, index) {
  dialog.show("Supprimer le parcours ?", "DialogSupprimerParcours", {
    item,
    index,
  });
}

// use the last Mention
function reuse() {
  if (service.verifyIfNotEmpty(AU.value)) {
    overlay.show();
    Promise.all([
      restApi.get(`/api/definition-mention/annee/${AU.value}`),
      restApi.get(`/api/definition-parcours/annee/${AU.value}`),
    ])
      .then((response) => {
        response[1].data.map((item) => {
          var filteredMentionLast = response[0].data.filter(
            (itemML) => item.idDM == itemML.id
          )[0];
          var filteredMentionActual = mention.list.filter(
            (itemMA) => itemMA.idMention == filteredMentionLast.idMention
          )[0];
          parcours.list.push({
            idNiveau: item.idNiveau,
            idSemestre: item.idSemestre,
            acronymeParcours: item.acronymeParcours,
            parcours: item.parcours,
            idDM: filteredMentionActual.id,
            idAU: anneeUniversitaire.id,
          });
        });
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
  }
}

// wait niveauId was updating
watch(
  () => niveau.id,
  (newIdNiveau) => {
    if (service.verifyIfNotEmpty(newIdNiveau)) {
      semestre.setByNiveau(newIdNiveau);
    }
  }
);

// wait anneeUniversitaire.id was updating
watch(
  () => anneeUniversitaire.id,
  (newIdAU) => {
    mention.list = [];
    parcours.list = [];
    mention.id = null;
    niveau.id = null;
    semestre.id = null;
    if (service.verifyIfNotEmpty(newIdAU)) {
      overlay.show();
      Promise.all([
        restApi.get(`/api/definition-mention/annee/${newIdAU}`),
        restApi.get(`/api/definition-parcours/annee/${newIdAU}`),
      ])
        .then((response) => {
          mention.list = response[0].data;
          parcours.list = response[1].data;
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

// called before Mounting
onBeforeMount(() => {
  scroll.toTop();
  mention.list = [];
  niveau.list = [];
  semestre.list = [];
  Promise.all([
    restApi.get(`/api/niveau`),
    restApi.get(`/api/semestre`),
    restApi.get(`/api/annee`),
  ])
    .then((response) => {
      niveau.list = response[0].data;
      semestre.list = response[1].data;
      anneeUniversitaire.list = response[2].data;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
  if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
    parcours.list = [];
    overlay.show();
    Promise.all([
      restApi.get(`/api/definition-mention/annee/${anneeUniversitaire.id}`),
      restApi.get(`/api/definition-parcours/annee/${anneeUniversitaire.id}`),
    ])
      .then((response) => {
        mention.list = response[0].data;
        parcours.list = response[1].data;
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
  }
});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Les parcours</h5>
    </v-col>
  </v-row>
  <v-row
    no-gutters
    class="mt-4"
    v-if="
      !service.verifyIfNotEmpty(parcours.list) &&
      service.verifyIfNotEmpty(anneeUniversitaire.id)
    "
  >
    <v-col cols="12">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Sélectionnez l'année universitaire afin de récuperer ces données
      </p>
    </v-col>
    <v-col cols="6" class="pr-2">
      <v-select
        label="Année universitaire"
        :items="anneeUniversitaire.list"
        item-title="nomAU"
        item-value="id"
        v-model="AU"
      ></v-select>
    </v-col>
    <v-col cols="6" class="mt-1 text-center">
      <v-btn
        size="large"
        rounded="pill"
        prepend-icon="mdi-backup-restore"
        color="indigo darken-4"
        class="text-transform-class text-none"
        @click="reuse"
        >réutiliser</v-btn
      >
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4" v-if="service.verifyIfNotEmpty(parcours.list)">
    <v-col cols="12">
      <p class="font-weight-black pb-2 text-subtitle-1">
        - Listes des parcours
      </p>
    </v-col>
    <v-col cols="4">
      <v-select
        density="comfortable"
        clearable
        label="Niveau"
        :items="niveau.list"
        item-title="niveau"
        item-value="id"
        v-model="niveau.id"
      ></v-select>
    </v-col>
    <v-row
      no-gutters
      class="position"
      v-if="service.verifyIfNotEmpty(parcours.list)"
    >
      <v-col class="text-center">
        <v-btn
          size="large"
          rounded="pill"
          prepend-icon="mdi-content-save-all"
          color="indigo darken-4"
          class=" text-transform-class text-none "
          title="Enregistrer ?"
          @click.prevent="saveParcours"
          >Enregistrer</v-btn
        >
      </v-col>
    </v-row>
    <br>
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Niveau</th>
            <th>Mention</th>
            <th>Semestre</th>
            <th>Désignation du parcours</th>
            <th>Acronyme du parcours</th>
            <th style="width: 10px !important">
              <v-btn
                icon="mdi-autorenew"
                :loading="loading.parcours"
                title="Actualiser ?"
                color="red"
                variant="plain"
                @click="reloadingParcours"
              ></v-btn>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in parcours.getByNiveau(niveau.id)"
            :key="index"
          >
            <td>{{ niveau.getNiveau(item.idNiveau) }}</td>
            <td>{{ mention.getMention(item.idDM) }}</td>
            <td>{{ semestre.getSemestre(item.idSemestre) }}</td>
            <td>
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="item.parcours"
                hide-details="true"
              ></v-text-field>
            </td>
            <td>
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="item.acronymeParcours"
                hide-details="true"
              ></v-text-field>
            </td>
            <td class="text-center" style="width: 10px !important">
              <v-btn
                icon="mdi-delete"
                color="red"
                variant="plain"
                title="Supprimer ?"
                @click="deleteParcours(item, index)"
              ></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <v-card>
        <v-container>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="font-weight-black pb-2 text-subtitle-1">
                - Remplir le formulaire pour ajouter un parcours
              </p>
            </v-col>
            <v-col cols="4" class="pr-2">
              <v-select
                clearable
                density="comfortable"
                label="Niveau"
                :items="niveau.list"
                item-title="niveau"
                item-value="id"
                v-model="niveau.id"
              ></v-select>
            </v-col>
            <v-col cols="4" class="px-2">
              <v-select
                clearable
                density="comfortable"
                label="Semestre"
                :items="semestre.listByNiveau"
                multiple
                item-title="semestre"
                item-value="id"
                v-model="semestre.id"
              ></v-select>
            </v-col>
            <v-col cols="4" class="pl-2">
              <v-select
                clearable
                density="comfortable"
                label="Mention"
                :items="mention.list"
                item-title="acronymeMention"
                item-value="id"
                v-model="mention.id"
              ></v-select>
            </v-col>
            <v-col cols="7" class="pr-2">
              <v-text-field
                density="comfortable"
                v-model="parcours.designation"
                clearable
                label="Désignation du parcours"
                hide-details="true"
              ></v-text-field>
            </v-col>
            <v-col cols="3" class="px-2">
              <v-text-field
                density="comfortable"
                v-model="parcours.acronyme"
                clearable
                label="Acronyme du parcours"
                hide-details="true"
                @keypress.enter="addParcours"
              ></v-text-field>
            </v-col>
            <v-col cols="2" class="d-flex justify-center">
              <v-btn
                size="large"
                rounded="pill"
                title="Ajouter ?"
                prepend-icon="mdi-plus-circle"
                color="indigo darken-4"
                class="text-transform-class text-none"
                @click.prevent="addParcours"
                :disabled=" !niveau.id || !semestre.id || !mention.id || !parcours.designation || !parcours.acronyme "
                >Ajouter</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.position{
  padding-left: 30%;
}

</style>
