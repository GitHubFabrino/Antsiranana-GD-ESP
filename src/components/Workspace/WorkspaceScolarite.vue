<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount } from "vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useLoadingStore } from "@/pinia/loading";
import { useDialogStore } from "@/pinia/dialog";
import { useNavigationStore } from "@/pinia/navigation";
import { useScolariteStore } from "@/pinia/scolarite";
import { useRegexStore } from "@/pinia/regex"

// instance of my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance of my pinia plugins
const alert = useAlertStore();
const loading = useLoadingStore();
const dialog = useDialogStore();
const navigation = useNavigationStore();
const scolarite = useScolariteStore();
const regex = useRegexStore()

// create a "Scolarité"
function create() {
  let dataFormVerify = {
    nom: scolarite.nom,
    email: scolarite.email,
    status: scolarite.status,
  };
  if (service.verifyFormIfOK(dataFormVerify)) {
    let requestPostData = {
      nom: scolarite.nom,
      prenoms: scolarite.prenoms,
      email: scolarite.email,
      status: scolarite.status,
      gestionConcoursTCI: scolarite.gestionConcoursTCI,
      gestionInscription: scolarite.gestionInscription,
      gestionAccesTache: scolarite.gestionAccesTache,
    };
    dialog.show(
      "Créer l'agent de la scolarité ?",
      "DialogCreerScolarite",
      requestPostData
    );
  } else alert.warningForm();
}

// Deleting a "Scolarité"
function deleteScolarite(value, index) {
  dialog.show(
    "Supprimer l'agent de la scolarité ?",
    "DialogSupprimerScolarite",
    { value, index }
  );
}

// Getting Scolarité
function reloadScolarite() {
  loading.manageScolarite = true;
  restApi
    .get(`/api/scolarite`)
    .then((response) => {
      scolarite.list = response.data;
      loading.manageScolarite = false;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
      loading.manageScolarite = false;
    });
}

// update scolarite
function updateScolarite() {
  dialog.show("Enregistrer ?", "DialogEnregistrerGestionAccesTacheScolarite");
}

// called Before mounting
onBeforeMount(() => {
  scroll.toTop();
  restApi
    .get(`/api/scolarite`)
    .then((response) => {
      scolarite.list = response.data;
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
        <h3 class="text-h4">Les agents de la scolarité</h3>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-8"
      v-if="service.verifyIfNotEmpty(scolarite.list)"
    >
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">
          - Listes des agents de la scolarité
        </p>
      </v-col>
      <v-col cols="12">
        <ul class="ml-8 mb-8">
          <li>Gestion des concours (1)</li>
          <li>Gestion des inscriptions (2)</li>
          <li>Gestion des accessibilités des taches (3)</li>
        </ul>
      </v-col>
      <v-col cols="12">
        <v-table class="elevation-1" density="compact">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénoms</th>
              <th>Status</th>
              <th>E-mail</th>
              <th>(1)</th>
              <th>(2)</th>
              <th>(3)</th>
              <th style="width: 10px !important">
                <v-btn
                  icon="mdi-autorenew"
                  :loading="loading.manageScolarite"
                  title="Actualiser ?"
                  color="red"
                  variant="plain"
                  @click="reloadScolarite"
                ></v-btn>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, index) in scolarite.list" :key="index">
              <td class="text-truncate">{{ value.nom }}</td>
              <td class="text-truncate">{{ value.prenoms }}</td>
              <td class="text-truncate">{{ value.status }}</td>
              <td class="text-truncate">{{ value.email }}</td>
              <td>
                <input type="checkbox" v-model="value.gestionConcoursTCI" />
              </td>
              <td>
                <input type="checkbox" v-model="value.gestionInscription" />
              </td>
              <td>
                <input type="checkbox" v-model="value.gestionAccesTache" />
              </td>
              <td class="text-center" style="width: 10px !important">
                <v-btn
                  icon="mdi-delete"
                  color="red"
                  variant="plain"
                  title="Supprimer ?"
                  @click="deleteScolarite(value, index)"
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
      v-if="service.verifyIfNotEmpty(scolarite.list)"
    >
      <v-col class="text-center">
        <v-btn
          size="large"
          rounded="pill"
          prepend-icon="mdi-content-save-all"
          color="indigo darken-4"
          class="text-transform-class text-none"
          @click="updateScolarite"
          >Modifier</v-btn
        >
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-8">
      <v-col cols="12">
        <v-card>
          <v-container>
            <v-row no-gutters>
              <v-col cols="12">
                <p class="font-weight-black text-subtitle-1 pb-2">
                  - Remplir le formulaire pour ajouter un agent de la scolarité
                </p>
                <div class="alert">
                  <Transition>
                    <p v-if="!regex.valide && scolarite.email" class="message">
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
                  v-model="scolarite.nom"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="px-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Prénoms"
                  v-model="scolarite.prenoms"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="pl-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="E-mail"
                  @input.lazy="regex.validationEmail()"
                  v-model="scolarite.email"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="pr-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Status"
                  v-model="scolarite.status"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="px-2">
                <v-checkbox
                  color="green"
                  density="comfortable"
                  v-model="scolarite.gestionConcoursTCI"
                  label="Gestion des concours (1)"
                ></v-checkbox>
              </v-col>
              <v-col cols="4" class="pl-2">
                <v-checkbox
                  color="green"
                  density="comfortable"
                  v-model="scolarite.gestionInscription"
                  label="Gestion des inscriptions (2)"
                ></v-checkbox>
              </v-col>
              <v-col cols="4" class="pr-2">
                <v-checkbox
                  color="green"
                  density="comfortable"
                  v-model="scolarite.gestionAccesTache"
                  label="Gestion des accessibilités des taches (3)"
                ></v-checkbox>
              </v-col>
              <v-col cols="4" class="text-center">
                <v-btn
                  size="large"
                  rounded="pill"
                  title="Ajouter ?"
                  prepend-icon="mdi-plus-circle"
                  color="indigo darken-4"
                  class="text-transform-class text-none"
                  :disabled="
                    !scolarite.nom ||
                    !scolarite.prenoms ||
                    !scolarite.email ||
                    !scolarite.status ||
                    (!scolarite.gestionConcoursTCI &&
                      !scolarite.gestionInscription &&
                      scolarite.gestionAccesTache)
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
