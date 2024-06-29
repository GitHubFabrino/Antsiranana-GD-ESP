<script setup>
// import my plugins
import { Service } from "@/plugins/service";
import { RestApi } from "@/plugins/restApi";

// import Pinia's plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
import { useEnseignantStore } from "@/pinia/enseignant";
import { usePEStore } from "@/pinia/pe";

// import Vuejs's plugins
import { onBeforeMount, ref } from "vue";

// instance my plugins
const service = new Service();
const restApi = new RestApi();

// instance pinia's plugins
const dialog = useDialogStore();
const pe = usePEStore();
const enseignant = useEnseignantStore();
const alert = useAlertStore();
const listeue = ref([]);
const listeec = ref([]);
const newCodeec = ref(null);
const validateUE = ref(true);
const validateEC = ref(true);
const newCodeue = ref(null);

// add EC
function addEC() {
  listeec.value.push(newCodeec.value);
  listeue.value.push(newCodeue.value);
  pe.EC.push({
    nomEC: null,
    codeEC: Number(newCodeec.value),
    idEnseignant: null,
    creditEC: Number(0),
    volumeHoraireET: Number(0),
    volumeHoraireED: Number(0),
    volumeHoraireTP: Number(0),
  });
}

// delete EC
function deleteEC(indexEC) {
  if (pe.EC.length == 1) alert.error();
  else service.removeFromArrayByIndex(pe.EC, indexEC);
}

function codeEC() {
  newCodeec.value = pe.EC.map((l) => {
    return l.codeEC;
  }).pop();
  validateEC.value = !listeec.value.includes(String(newCodeec.value));
}

function codeUE() {
  newCodeue.value = pe.UE.map((l) => {
    return l.codeUE;
  }).pop();
  validateUE.value = !listeec.value.includes(String(newCodeue.value));
}

// save PE
function savePE() {
  listeec.value.push(newCodeec.value);
  if (service.verifyFormIfOK(pe.UE)) {
    pe.UE.map((item) => {
      item.nomUE = String(item.nomUE);
      item.codeUE = Number(item.codeUE);
      item.idEnseignant = Number(item.idEnseignant);
    });
    pe.EC.map((item) => {
      item.nomEC = String(item.nomEC);
      item.codeEC = String(item.codeEC);
      item.idEnseignant = Number(item.idEnseignant);
      item.creditEC = Number(item.creditEC);
      item.volumeHoraireET = Number(item.volumeHoraireET);
      item.volumeHoraireED = Number(item.volumeHoraireED);
      item.volumeHoraireTP = Number(item.volumeHoraireTP);
    });
    dialog.show("Créer l'UE ?", "DialogCreerProgrammeEnseignement", {
      ue: pe.UE,
      ec: pe.EC,
    });
  } else {
    alert.warningForm();
  }
}

// preparing data
function prepare() {
  pe.UE = [];
  pe.UE.push({
    nomUE: null,
    codeUE: 0,
    idEnseignant: null,
  });
  pe.UE[0].nomUE = dialog.data.nomUE[0];
  pe.UE[0].codeUE = dialog.data.codeUE[0];
  pe.UE[0].idEnseignant = dialog.data.responsableUE[0].idEnseignant;

  // preparing EC
  pe.EC = [];
  for (let i = 0; i < dialog.data.nomEC.length; i++) {
    pe.EC.push({
      nomEC: dialog.data.nomEC[i].nomEC,
      codeEC: dialog.data.codeEC[i],
      idEnseignant: dialog.data.responsableEC[i].idEnseignant,
      creditEC: dialog.data.creditEC[i],
      volumeHoraireET: dialog.data.volumeHoraireET[i],
      volumeHoraireED: dialog.data.volumeHoraireED[i],
      volumeHoraireTP: dialog.data.volumeHoraireTP[i],
    });
  }
}

// when the user is saying YES
function oui() {
  savePE();
  pe.save({ ue: pe.UE, ec: pe.EC });
  dialog.hide();
}

// when the user is saying NO
function non() {
  dialog.hide();
}

// called onBeforeMount
onBeforeMount(() => {
  prepare();
  Promise.all([
    restApi.get(`/api/programme-enseignement/dp/ec`),
    restApi.get(`/api/programme-enseignement/dp/ue`),
  ])
    .then((response) => {
      listeec.value = response[0].data;
      listeec.value = listeec.value.map((l) => {
        return l.codeEc;
      });

      listeue.value = response[1].data;
      listeue.value = listeue.value.map((l) => {
        return l.codeUe;
      });
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
});
</script>

<template>
  <v-row no-gutters class="mt-10">
    <v-col cols="12">
      <p class="font-weight-black text-subtitle-1 text-left pb-2">
        - Modification de l'unité d'enseignement UE
      </p>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-container>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="font-weight-black text-subtitle-2 text-left pb-2">
                Unité d'enseignement
              </p>
            </v-col>
            <v-col cols="5" class="pr-2">
              <v-text-field
                hide-details
                density="comfortable"
                clearable
                label="Unité Enseignement"
                v-model="pe.UE[0].nomUE"
              ></v-text-field>
            </v-col>
            <v-col cols="2" class="px-2">
              <v-text-field
                hide-details
                density="comfortable"
                @input="codeUE"
                clearable
                label="Code UE"
                v-model="pe.UE[0].codeUE"
              ></v-text-field>
              <div class="alert">
                <Transition>
                  <p v-if="!validateUE" class="message">
                    Code UC déja existant !
                  </p>
                </Transition>
              </div>
            </v-col>
            <v-col cols="5" class="pl-2">
              <v-select
                hide-details
                density="comfortable"
                label="Responsable UE"
                :items="enseignant.list"
                item-title="fullName"
                item-value="id"
                v-model="pe.UE[0].idEnseignant"
              ></v-select>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
    <v-col cols="12" class="mt-4">
      <p class="font-weight-black text-subtitle-1 text-left pb-2">
        - Modification des éléments constitutifs EC
      </p>
    </v-col>
    <v-col
      cols="12"
      class="my-2"
      v-for="(itemEC, indexEC) in pe.EC"
      :key="indexEC"
    >
      <v-card>
        <v-container class>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="font-weight-black text-subtitle-2 text-left pb-2">
                Élément constitutif numéro {{ Number(indexEC + 1) }}
              </p>
            </v-col>
            <v-col cols="5" class="pr-2">
              <v-text-field
                density="comfortable"
                clearable
                label="Élément Constitutif"
                v-model="itemEC.nomEC"
              ></v-text-field>
            </v-col>
            <v-col cols="2" class="px-2">
              <v-text-field
                density="comfortable"
                @input="codeEC"
                clearable
                label="Code EC"
                v-model="itemEC.codeEC"
              ></v-text-field>
            </v-col>
            <v-col cols="5" class="pl-2">
              <v-select
                density="comfortable"
                label="Responsable EC"
                :items="enseignant.list"
                item-title="fullName"
                item-value="id"
                v-model="itemEC.idEnseignant"
              ></v-select>
            </v-col>
            <v-col cols="2" class="pr-2">
              <v-text-field
                hide-details
                density="comfortable"
                clearable
                type="number"
                label="Crédit EC"
                v-model="itemEC.creditEC"
                min="0"
              ></v-text-field>
            </v-col>
            <v-col cols="3" class="px-2">
              <v-text-field
                hide-details
                density="comfortable"
                clearable
                type="number"
                label="Volume horaire ET"
                v-model="itemEC.volumeHoraireET"
                min="0"
              ></v-text-field>
            </v-col>
            <v-col cols="3" class="px-2">
              <v-text-field
                hide-details
                density="comfortable"
                clearable
                type="number"
                label="Volume Horaire ED"
                v-model="itemEC.volumeHoraireED"
                min="0"
              ></v-text-field>
            </v-col>
            <v-col cols="3" class="px-2">
              <v-text-field
                hide-details
                density="comfortable"
                clearable
                type="number"
                label="Volume Horaire TP"
                v-model="itemEC.volumeHoraireTP"
                min="0"
              ></v-text-field>
            </v-col>
            <v-col cols="1" class="pl-2">
              <v-btn
                icon
                @click="deleteEC(indexEC)"
                variant="tonal"
                color="red"
              >
                <v-icon>mdi-delete-forever</v-icon>
                <v-tooltip activator="parent" location="bottom"
                  >Supprimer ?</v-tooltip
                >
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col class="text-center">
      <Transition>
        <v-btn
          size="large"
          rounded="pill"
          prepend-icon="mdi-plus-circle"
          color="indigo"
          v-if="validateUE && validateEC"
          class="text-transform-class text-none"
          title="Ajouter ?"
          @click="addEC"
          >Ajouter un autre EC</v-btn
        >
      </Transition>
      <div class="alert">
        <Transition>
          <p v-if="!validateEC" class="message">Code EC déja existant !</p>
        </Transition>
      </div>
    </v-col>
  </v-row>

  <!-- Making decision Yes or No -->
  <v-card-actions class="d-flex justify-space-around pt-4">
    <v-btn
      rounded="pill"
      class="px-6"
      prepend-icon="mdi-comment-check"
      variant="tonal"
      color="success"
      v-if="validateUE && validateEC"
      @click="oui"
      >OUI</v-btn
    >
    <v-btn
      rounded="pill"
      class="px-6"
      prepend-icon="mdi-comment-remove"
      variant="tonal"
      color="red"
      @click="non"
      >NON</v-btn
    >
  </v-card-actions>
</template>

<style scoped>
.alert {
  text-align: center;
  display: flex;
  padding-bottom: 10px;
}
.message {
  width: 100%;
  margin: 0 auto;
  border-radius: 15px;
  color: red;
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
}

.v-enter-from {
  opacity: 0;
}
.v-enter-active {
  transition: opacity 2s ease;
}

.v-enter-to {
  opacity: 1;
}
.v-leave-from {
  opacity: 1;
}

.v-leave-active {
  transition: opacity 2s ease;
}
.v-leave-to {
  opacity: 0;
}
</style>
