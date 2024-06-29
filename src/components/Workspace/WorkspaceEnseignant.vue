<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount } from "vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
import { useLoadingStore } from "@/pinia/loading";
import { useEnseignantStore } from "@/pinia/enseignant";
import { useRegexStore } from "@/pinia/regex"



// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my Pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const loading = useLoadingStore();
const enseignant = useEnseignantStore();
const regex = useRegexStore()


// creating an "Enseignant"
function create() {
  let dataFormVerify = {
    nom: enseignant.nom,
    email: enseignant.email,
    status: enseignant.status,
    grade: enseignant.grade,
    specialite: enseignant.specialite,
  };
  if (service.verifyFormIfOK(dataFormVerify)) {
    let requestPostData = {
      nom: enseignant.nom,
      prenoms: enseignant.prenoms,
      email: enseignant.email,
      status: enseignant.status,
      grade: enseignant.grade,
      specialite: enseignant.specialite,
    };
    dialog.show(
      "Créer l'enseignant ?",
      "DialogCreerEnseignant",
      requestPostData
    );
  } else alert.warningForm();
}

// deleting an "Enseignant"
function updateEnseignant(data) {
  dialog.show("Modifier l'enseignant ?", "DialogModifierEnseignant", data);
}

// getting an "Enseignant"
function reloadEnseignant() {
  loading.manageEnseignant = true;
  restApi
    .get(`/api/enseignant`)
    .then((response) => {
      enseignant.list = response.data;
      loading.manageEnseignant = false;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
      loading.manageEnseignant = false;
    });
}

// Called before mounting
onBeforeMount(() => {
  scroll.toTop();
  restApi
    .get(`/api/enseignant`)
    .then((response) => {
      enseignant.list = response.data;
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
        <h3 class="text-h4">Les enseignants</h3>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-8"
      v-if="service.verifyIfNotEmpty(enseignant.list)"
    >
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">
          - Listes des enseignants
        </p>
      </v-col>
      <v-col cols="12">
        <v-table class="elevation-1" density="compact">
          <thead>
            <tr>
              <th>Nom</th>
              <th class="text-truncate">Prénoms</th>
              <th>Diplôme</th>
              <th>e-mail</th>
              <th>Grade</th>
              <th>Spécialité</th>
              <th style="width: 10px !important">
                <v-btn
                  icon="mdi-autorenew"
                  :loading="loading.manageEnseignant"
                  title="Actualiser ?"
                  color="red"
                  variant="plain"
                  @click="reloadEnseignant"
                ></v-btn>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, index) in enseignant.list" :key="index">
              <td class="text-truncate">{{ value.nom }}</td>
              <td class="text-truncate">{{ value.prenoms }}</td>
              <td class="text-truncate">{{ value.status }}</td>
              <td class="text-truncate">{{ value.email }}</td>
              <td class="text-truncate">{{ value.grade }}</td>
              <td class="text-truncate">{{ value.specialite }}</td>
              <td class="text-center" style="width: 10px !important">
                <v-btn
                  icon="mdi-pen"
                  color="blue"
                  variant="plain"
                  title="Modifier ?"
                  @click="updateEnseignant(value)"
                ></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-8">
      <v-col cols="12">
        <v-card>
          <v-container>
            <v-row no-gutters>
              <v-col cols="12">
                <p class="font-weight-black text-subtitle-1 pb-2">
                  - Remplir le formulaire pour ajouter un enseignant
                </p>
                <div class="alert">
                  <Transition>
                    <p v-if="!regex.valide && enseignant.email" class="message">
                      Votre Adresse e-mail est Invalide !
                    </p>
                  </Transition>
                </div>
              </v-col>
              <v-col cols="4" class="pr-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Nom"
                  v-model="enseignant.nom"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="px-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Prénoms"
                  v-model="enseignant.prenoms"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="px-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="e-mail"
                  @input.lazy="regex.validationEmail()"
                  v-model="enseignant.email"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="pr-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Diplôme"
                  v-model="enseignant.status"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="px-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Grade"
                  v-model="enseignant.grade"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="px-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Spécialité"
                  v-model="enseignant.specialite"
                ></v-text-field>
              </v-col>
              <v-col class="text-center">
                <v-btn
                  size="large"
                  rounded="pill"
                  title="Ajouter ?"
                  prepend-icon="mdi-plus-circle"
                  color="indigo darken-4"
                  class="text-transform-class text-none"
                  :disabled="
                    !enseignant.nom ||
                    !enseignant.prenoms ||
                    !enseignant.email ||
                    !enseignant.status ||
                    !enseignant ||
                    !enseignant.specialite
                  "
                  @click="create"
                  >Ajouter</v-btn
                >
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.alert {
  text-align: center;
  display: flex;
  padding-bottom: 10px;
}
.message {
  width: 30%;
  margin: 0 auto;
  padding-top: 10px;
  border-radius: 15px;
  color: red;
  font-size: 14px;
}

.v-enter-from{
  opacity: 0;
}
.v-enter-active{
  transition: opacity 1s ease;
}

.v-enter-to{
  opacity: 1;
}
.v-leave-from{
  opacity: 1;
}

.v-leave-active{
  transition: opacity 1s ease;
}
.v-leave-to{
  opacity: 0;
}

</style>
