<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount } from "vue";

// import my Pinia plugins
import { useLoadingStore } from "@/pinia/loading";
import { useDialogStore } from "@/pinia/dialog";
import { useAlertStore } from "@/pinia/alert";
import { useDirectionStore } from "@/pinia/direction";
import { useRegexStore } from "@/pinia/regex";

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my pinia plugins
const direction = useDirectionStore();
const loading = useLoadingStore();
const dialog = useDialogStore();
const alert = useAlertStore();
const regex = useRegexStore();

// create a Direction
function create() {
  let dataFormVerify = {
    nom: direction.nom,
    email: direction.email,
    status: direction.status,
  };
  if (service.verifyFormIfOK(dataFormVerify)) {
    let requestPostData = [
      {
        nom: direction.nom,
        prenoms: direction.prenoms,
        email: direction.email,
        status: direction.nom,
        gestionUtilisateur: direction.gestionUtilisateur,
        gestionSeminairePedagogiques: direction.gestionSeminairePedagogiques,
      },
    ];
    dialog.show(
      "Créer l'agent de la direction ?",
      "DialogCreerDirection",
      requestPostData
    );
  } else alert.warningForm();
}

// delete a Direction
function deleteDirection(value, index) {
  dialog.show(
    "Supprimer l'agent de la direction ?",
    "DialogSupprimerDirection",
    { value, index }
  );
}

// getting a Direction
function reloadDirection() {
  loading.manageDirection = true;
  restApi
    .get(`/api/direction`)
    .then((response) => {
      direction.list = response.data;
      loading.manageDirection = false;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
      loading.manageDirection = false;
    });
}

// update a "Direction"
function updateDirection() {
  dialog.show("Enregistrer ?", "DialogModifierDirection");
}

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  restApi
    .get(`/api/direction`)
    .then((response) => {
      direction.list = response.data;
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
        <h3 class="text-h4">Les agents de la direction</h3>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-8"
      v-if="service.verifyIfNotEmpty(direction.list)"
    >
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">
          - Listes des agents de la direction
        </p>
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
              <th style="width: 10px !important">
                <v-btn
                  icon="mdi-autorenew"
                  :loading="loading.manageDirection"
                  title="Actualiser ?"
                  color="red"
                  variant="plain"
                  @click="reloadDirection"
                ></v-btn>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, index) in direction.list" :key="index">
              <td>{{ value.nom }}</td>
              <td>{{ value.prenoms }}</td>
              <td>{{ value.status }}</td>
              <td>{{ value.email }}</td>
              <td>
                <input
                  type="checkbox"
                  v-model="value.gestionSeminairePedagogiques"
                />
              </td>
              <td>
                <input type="checkbox" v-model="value.gestionUtilisateur" />
              </td>
              <td class="text-center" style="width: 10px !important">
                <v-btn
                  icon="mdi-delete"
                  color="red"
                  variant="plain"
                  title="Supprimer ?"
                  @click="deleteDirection(value, index)"
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
      v-if="service.verifyIfNotEmpty(direction.list)"
    >
      <v-col class="text-center">
        <v-btn
          size="large"
          rounded="pill"
          prepend-icon="mdi-content-save-all"
          color="indigo darken-4"
          class="text-transform-class text-none"
          @click="updateDirection"
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
                  - Remplir le formulaire pour ajouter un agent de la direction
                </p>
                <div class="alert">
                  <Transition>
                    <p v-if="!regex.valide && direction.email" class="message">
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
                  v-model="direction.nom"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="px-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Prénoms"
                  v-model="direction.prenoms"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="px-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="E-mail"
                  @input.lazy="regex.validationEmail()"
                  v-model="direction.email"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="pr-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Status"
                  v-model="direction.status"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="px-2">
                <v-checkbox
                  color="green"
                  density="comfortable"
                  v-model="direction.gestionSeminairePedagogiques"
                  label="Gestion des années universitaires (1)"
                ></v-checkbox>
              </v-col>
              <v-col cols="4" class="px-2">
                <v-checkbox
                  color="green"
                  density="comfortable"
                  v-model="direction.gestionUtilisateur"
                  label="Gestion des utilisateurs (2)"
                ></v-checkbox>
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
                    !direction.nom ||
                    !direction.prenoms ||
                    !direction.email ||
                    !direction.status ||
                    (!direction.gestionSeminairePedagogiques &&
                      !direction.gestionUtilisateur)
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
