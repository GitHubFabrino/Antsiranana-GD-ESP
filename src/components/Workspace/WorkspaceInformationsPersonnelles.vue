<script setup>
// my plugins
import { Cookies } from "@/plugins/cookies";
import { RestApi } from "@/plugins/restApi";
import { Scroll } from "@/plugins/scroll";

// Vuejs's plugins
import { onBeforeMount, ref } from "vue";

// pinia's plugins
import { usePersonneStore } from "@/pinia/personne";
import { useDialogStore } from "@/pinia/dialog";
import { useStatusStore } from "@/pinia/status";
import { useSexeStore } from "@/pinia/sexe";
import { useAlertStore } from "@/pinia/alert";
import { useLoadingStore } from "@/pinia/loading";

// Instance of my plugins
const cookies = new Cookies();
const restApi = new RestApi();
const scroll = new Scroll();

// Instance of pinia's plugins
const personne = usePersonneStore();
const dialog = useDialogStore();
const status = useStatusStore();
const sexe = useSexeStore();
const alert = useAlertStore();
const loading = useLoadingStore();

const pseudo = ref("");
const motdePasseAncien = ref("");
const newmdp = ref("");
const confirmeMpd = ref("");
const disable = ref(true);
const disablealert = ref(false);
const showPassword = ref(false);
const showPasswordVerif = ref(false);
const showPasswordnew = ref(false);

function Verification() {
  if (newmdp.value === confirmeMpd.value) {
    disable.value = false;
    disablealert.value = false;
  } else if (newmdp.value != confirmeMpd.value) {
    disablealert.value = true;
    disable.value = true;
  }
}

function changerMDP() {
  restApi
    .post(`/api/auth/mdp`, {
      username: pseudo.value,
      oldpassword: motdePasseAncien.value,
      newpassword: confirmeMpd.value,
    })
    .then((response) => {
      alert.successSave();
      console.log(response);
      restApi
        .get(`/api/personne/${cookies.get("idPersonne")}`)
        .then((response) => {
          personne.set(response.data);
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
  pseudo.value = "";
  motdePasseAncien.value = "";
  newmdp.value = "";
  confirmeMpd.value = "";
}

// Open dialog to confirm the edition
function edit() {
  dialog.show(
    "Modifier mes informations personnelles ?",
    "DialogModifierInformationsPersonnelles"
  );
}

// reloading personal's data
function reloadingPersonne() {
  loading.personne = true;
  restApi
    .get(`/api/personne/${cookies.get("idPersonne")}`)
    .then((response) => {
      personne.set(response.data);
      loading.personne = false;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
      loading.personne = false;
    });
}

// called begore mounting this component
onBeforeMount(() => {
  scroll.toTop();
  restApi
    .get(`/api/personne/${cookies.get("idPersonne")}`)
    .then((response) => {
      personne.set(response.data);
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
});
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <h4 class="mb-8 text-h4">Mes informations personnelles.</h4>
      </v-col>
      <v-col class="tables">
        <v-table class="table elevation-1" density="compact">
          <thead>
            <tr>
              <th class="text-start"><strong>Désignation</strong></th>
              <th class="text-start"><strong>Données</strong></th>
              <th class="text-center" style="width: 10px !important">
                <v-btn
                  icon="mdi-autorenew"
                  :loading="loading.personne"
                  title="Actualiser ?"
                  color="red"
                  variant="plain"
                  @click="reloadingPersonne"
                ></v-btn>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 300px">Nom</td>
              <td style="border: none" class="my-1">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  readonly
                  v-model="personne.nom"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Prénoms</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  readonly
                  v-model="personne.prenoms"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Sexe</td>
              <td style="border: none" class="text-start">
                <v-select
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  :items="sexe.list"
                  item-title="genre"
                  item-value="genre"
                  v-model="personne.sexe"
                  hide-details="true"
                ></v-select>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Date de naissance</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  type="date"
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.dateNaissance"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Lieu de naissance</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.lieuNaissance"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Ville de naissance</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.villeNaissance"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Pays de naissance</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.paysNaissance"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Nationalité</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.nationalite"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Adresse</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.adresse"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Numéro du CIN</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.numeroCIN"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Date de délivrance du CIN</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  type="date"
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.dateDelivreCIN"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Ville de délivrance du CIN</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.villeDelivreCIN"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Affiliation 1</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.affiliation1"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Affiliation 2</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.affiliation2"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Numéro téléphone</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.telephone"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td style="width: 300px">Adresse e-mail</td>
              <td style="border: none" class="text-start">
                <v-text-field
                  style="width: 110%"
                  variant="outlined"
                  density="compact"
                  v-model="personne.email"
                  hide-details="true"
                ></v-text-field>
              </td>
            </tr>
            <br />
            <tr>
              <td style="width: 300px">Fait partie de</td>
              <td style="border: none; text-align: center">
                <strong v-for="(value, index) in status.list" :key="index"
                  ><v-chip prepend-icon="mdi-briefcase" class="ma-1">{{
                    value
                  }}</v-chip></strong
                >
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
            <v-row no-gutters class="mt-2">
              <v-col cols="12" class="justify-center">
                <p class="font-weight-black text-subtitle-1 pb-2">
                  - CHANGER MON MOT DE PASSE -
                </p>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  density="comfortable"
                  label="Identifiant"
                  clearable
                  rows="6"
                  hide-details
                  v-model="pseudo"
                ></v-text-field>
              </v-col>
              <v-col cols="3" class="px-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Ancien mot de passe"
                  min="0"
                  hide-details="true"
                  v-model="motdePasseAncien"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  :type="showPassword ? 'text' : 'password'"
                  @click:append-inner="showPassword = !showPassword"
                  autocomplete="off"
                ></v-text-field>
              </v-col>
              <v-col cols="3" class="px-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Nouveau mot de passe"
                  min="0"
                  hide-details="true"
                  v-model="newmdp"
                  :append-inner-icon="
                    showPasswordnew ? 'mdi-eye-off' : 'mdi-eye'
                  "
                  :type="showPasswordnew ? 'text' : 'password'"
                  @click:append-inner="showPasswordnew = !showPasswordnew"
                  autocomplete="off"
                ></v-text-field>
              </v-col>
              <v-col cols="3" class="px-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Confirmer"
                  min="0"
                  hide-details="true"
                  v-model="confirmeMpd"
                  @input="Verification"
                  :append-inner-icon="
                    showPasswordVerif ? 'mdi-eye-off' : 'mdi-eye'
                  "
                  :type="showPasswordVerif ? 'text' : 'password'"
                  @click:append-inner="showPasswordVerif = !showPasswordVerif"
                  autocomplete="off"
                ></v-text-field>
                <div class="alert">
                  <Transition>
                    <p v-if="disablealert" class="message">
                      Vérifier votre mot de passe !
                    </p>
                  </Transition>
                </div>
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-4 justify-center">
              <v-col cols="4" class="d-flex justify-center">
                <v-btn
                  size="large"
                  rounded="pill"
                  title="Ajouter ?"
                  prepend-icon="mdi-plus-circle"
                  color="indigo darken-4"
                  class="text-transform-class text-none"
                  @click="changerMDP"
                  :disabled="disable"
                  >Changer Mot de Passe</v-btn
                >
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="text-center py-8">
        <v-btn
          size="large"
          rounded="pill"
          prepend-icon="mdi-content-save-all"
          color="indigo darken-4"
          class="text-transform-class text-none"
          @click="edit"
          >Enregistrer</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.tables {
  border-radius: 10px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.table {
  padding: 20px;
}

.alert {
  text-align: center;
  display: flex;
  padding-bottom: 10px;
  width: 100%;
}
.message {
  width: 100%;
  padding-top: 10px;
  border-radius: 15px;
  color: red;
  font-size: 14px;
  font-weight: bold;
}

.v-enter-from {
  opacity: 0;
}
.v-enter-active {
  transition: opacity 1s ease;
}

.v-enter-to {
  opacity: 1;
}
.v-leave-from {
  opacity: 1;
}

.v-leave-active {
  transition: opacity 1s ease;
}
.v-leave-to {
  opacity: 0;
}
</style>
