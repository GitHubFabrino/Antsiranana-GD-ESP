<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's component
import { ref, onBeforeMount } from "vue";

// import my pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
import { useConcoursStore } from "@/pinia/concours";
import { usedisableStore } from "@/pinia/disable";
import { useEnseignantStore } from "@/pinia/enseignant";

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const concours = useConcoursStore();
const disable = usedisableStore();
const enseignant = useEnseignantStore();

// create variables
const telephone = ref(null);
const newMatiere = ref(null);
const newCenter = ref(null);
const newCenterCode = ref(null);
const listCenterCode = ref([]);
const neWliste = ref([]);
const index = ref(0);
const idx = ref(0);
const idxAdjoint = ref(0)
const nomEn = ref(null);
const prenomsEn = ref(null);
const choseChef = ref(null);
const choseChefAdjoint =  ref(null)
const newlistCentre = ref([]);
const nomCentreCTCI = ref(null);
const codePostale = ref(null);
const Id = ref(null)





// adding "Centre"
function chefdeCentre() {
  for (let i of nomEn.value) {
    if (i === choseChef.value) {
      idx.value = nomEn.value.indexOf(i);
      concours.centreConcoursTCI.nom = nomEn.value[idx.value];
      concours.centreConcoursTCI.prenoms = prenomsEn.value[idx.value];
    }
  }
}


///// Function create a new center
function AddNewCenter() {
  restApi
    .post(`api/centre`, {
      nom_centre_concours: newCenter.value,
      code_postal_centre: newCenterCode.value,
    })
    .then((response) => {
      alert.successSave();
      restApi
        .get(`/api/centre/concours`)
        .then((response) => {
          listCenterCode.value = response.data.map((l) => {
            return l.code_postal_centre;
          });
          newlistCentre.value = response.data.map((l) => {
            return l.nom_centre_concours;
          });
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    })
    .catch((error) => {
      console.error("Error :", error);
      alert.error();
    });
  newCenter.value = "";
  newCenterCode.value = null;
}

//// Creation d'une Nouvelle Matière
function AddNewMatiere() {
  restApi
    .post(`api/matiere`, {
      nom_matiere_concour: newMatiere.value,
    })
    .then((response) => {
      alert.successSave();
      restApi
        .get(`/api/matiere/concours`)
        .then((response) => {
          concours.matieres = response.data;
          neWliste.value = concours.matieres.map((l) => {
            return l.nom_matiere_concour;
          });
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    })
    .catch((error) => {
      console.error("Error :", error);
      alert.error();
    });
  newMatiere.value = "";
}

function addCenter() {
  updatePostalCode();
  disable.disableOne = true;
  let formTestData = {
    nomCentreCTCI: nomCentreCTCI.value,
    codePostale: codePostale.value,
  };
  if (service.verifyFormIfOK(formTestData)) {
    concours.addCenter({
      nomCentreCTCI: nomCentreCTCI.value,
      codePostale: codePostale.value,
      nom: nomEn.value[idx.value],
      prenoms: prenomsEn.value[idx.value],
      nomAdjoint: concours.nomAdjoint,
      prenomAdjoint: concours.prenomAdjoint,
      telephone: telephone.value,
    });
    nomCentreCTCI.value = null;
    codePostale.value = null;
    choseChef.value = ""
    concours.nomAdjoint = ""
    concours.prenomAdjoint = ""

  } else alert.warningForm();
}

// deleting "Centre"
function deleteCenter(centre) {
  dialog.show(
    "Supprimer le centre concours ?",
    "DialogSupprimerCentreConcours",
    centre
  );
}

// adding "Matiere"
function addMaterial() {
  disable.disableTwo = true;
  let formTestData = {
    nomMCTCI: concours.nomMCTCI,
    creditMCTCI: concours.creditMCTCI,
  };
  if (service.verifyFormIfOK(formTestData)) {
    concours.addMaterial({
      nomMCTCI: concours.nomMCTCI,
      creditMCTCI: concours.creditMCTCI,
    });
    concours.nomMCTCI = null;
    concours.creditMCTCI = null;
  } else alert.warningForm();
}

// deleting "Matiere"
function deleteMaterial(matiereConcoursTCI) {
  dialog.show(
    "Supprimer la matiere ?",
    "DialogSupprimerMatiereConcours",
    matiereConcoursTCI
  );
}

// creating "Concours"
function create() {
  if (
    service.verifyIfNotEmpty(concours.debutSessionCTCI) &&
    service.verifyIfNotEmpty(concours.finSessionCTCI)
  ) {
    concours.sessionCTCI = `${new Date(
      concours.debutSessionCTCI
    ).getDate()} - ${new Date(
      concours.finSessionCTCI
    ).getDate()} ${service.getMonth(
      new Date(concours.finSessionCTCI).getMonth()
    )} ${new Date(concours.finSessionCTCI).getFullYear()}`;
    let formTestData = {
      sessionCTCI: concours.sessionCTCI,
      descriptionCTCI: concours.descriptionCTCI,
    };
    if (service.verifyFormIfOK(formTestData))
      dialog.show("Enregistrer le concours ?", "DialogEnregistrerConcours");
    else alert.warningForm();
  }
}

function updatePostalCode() {
  for (let b of newlistCentre.value) {
    if (b === nomCentreCTCI.value) {
      index.value = newlistCentre.value.indexOf(b);
      codePostale.value = listCenterCode.value[index.value];
    }
  }
}

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  concours.idCTCI = null;
  concours.sessionCTCI = null;
  concours.descriptionCTCI = null;
  concours.centreConcoursTCI = [];
  concours.matiereConcoursTCI = [];
  concours.calendrierConcoursTCI = [];
  restApi
    .get(`/api/centre/concours`)
    .then((response) => {
      listCenterCode.value = response.data.map((l) => {
        return l.code_postal_centre;
      });
      newlistCentre.value = response.data.map((l) => {
        return l.nom_centre_concours;
      });
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });

  restApi
    .get(`/api/matiere/concours`)
    .then((response) => {
      concours.matieres = response.data;
      neWliste.value = concours.matieres.map((l) => {
        return l.nom_matiere_concour;
      });
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
  restApi
    .get(`/api/enseignant/nom`)
    .then((response) => {
      enseignant.list = response.data;
      enseignant.setAllFullName();
      nomEn.value = response.data.map((item) => item.nom);
      Id.value = response.data.map((item) => item.id);
      prenomsEn.value = response.data.map((item) => item.prenoms);
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
        <h5 class="text-h4">Création des concours</h5>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-8">
      <v-col cols="12">
        <v-card>
          <v-container>
            <v-row no-gutters>
              <v-col cols="12">
                <p class="font-weight-black pb-2 text-subtitle-1">
                  - Remplir le formulaire pour décrire le concours
                </p>
              </v-col>
              <v-col cols="6" class="pr-2">
                <v-text-field
                  density="comfortable"
                  type="date"
                  label="Date de début"
                  v-model="concours.debutSessionCTCI"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="6" class="pl-2">
                <v-text-field
                  density="comfortable"
                  type="date"
                  label="Date de fin"
                  v-model="concours.finSessionCTCI"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="pr-2">
                <v-textarea
                  density="comfortable"
                  label="Description"
                  clearable
                  v-model="concours.descriptionCTCI"
                  rows="2"
                  hide-details
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-8"
      v-if="service.verifyIfNotEmpty(concours.centreConcoursTCI)"
    >
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">
          - Liste des centres d'examen
        </p>
      </v-col>
      <v-col>
        <v-table class="elevation-1" density="compact">
          <thead>
            <tr>
              <th>Centre</th>
              <th>Code postal</th>
              <th>Nom du chef de Centre</th>
              <th>Prénoms du chef de Centre</th>
              <th>Nom Adjoint</th>
              <th>Prénom Adjoint</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(centre, index) in concours.centreConcoursTCI"
              :key="index"
            >
              <td>{{ centre.nomCentreCTCI }}</td>
              <td>{{ centre.codePostale }}</td>
              <td>
                <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="centre.nom"
                  hide-details="true"
                  type="text"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="centre.prenoms"
                  hide-details="true"
                  type="text"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="centre.nomAdjoint"
                  hide-details="true"
                  type="text"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="centre.prenomAdjoint"
                  hide-details="true"
                  type="text"
                ></v-text-field>
              </td>
              <td style="width: 10px !important">
                <v-btn
                  icon="mdi-delete"
                  color="red"
                  variant="plain"
                  title="Supprimer ?"
                  @click="deleteCenter(centre)"
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
                  - Remplir le formulaire pour créer les centres d'examen
                </p>
              </v-col>
              <v-col cols="4" class="pr-2">
                <v-select
                  hide-details
                  density="comfortable"
                  v-model="nomCentreCTCI"
                  :items="newlistCentre"
                  clearable
                  label="Centre"
                ></v-select>
              </v-col>
              <v-col cols="4" class="px-2  v-select">
                <div class="select">
                  <label for="select">Chef de Centre : </label>
                  <select
                    @change="chefdeCentre"
                    v-model="choseChef"
                    id="select"
                    name="select"
                  >
                    <option
                      v-bind:key="i"
                      v-for="(ens, i) in enseignant.list"
                      :value="ens.nom"
                    >
                      <p>{{ ens.nom }} {{ ens.prenoms }}</p>
                    </option>
                  </select>
                </div>
              </v-col>
              <v-col cols="4" class="px-2 v-select">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Nom adjoint"
                  type="text"
                  hide-details="true"
                  v-model="concours.nomAdjoint"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class=" mt-4 v-select">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Prénom adjoint"
                  type="text"
                  hide-details="true"
                  v-model="concours.prenomAdjoint"
                ></v-text-field>
              </v-col>
              <v-col cols="2" class="d-flex justify-center mt-4">
                <v-btn
                  size="large"
                  rounded="pill"
                  title="Ajouter ?"
                  prepend-icon="mdi-plus-circle"
                  color="indigo darken-4"
                  class="text-transform-class text-none"
                  @click="addCenter"
                  :disabled="!choseChef || !nomCentreCTCI "
                  @keypress.enter="addCenter"
                  >Ajouter</v-btn
                >
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-5">
              <v-col cols="12">
                <p class="font-weight-black pb-2 text-subtitle-1">
                  - Ajouter une nouvelle Centre et son Code Postale
                </p>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  density="comfortable"
                  label="Nouvelle Centre"
                  clearable
                  rows="6"
                  hide-details
                  v-model="newCenter"
                ></v-text-field>
              </v-col>
              <v-col cols="2" class="px-2">
                <v-text-field
                  density="comfortable"
                  clearable
                  label="Code Postale"
                  type="number"
                  min="0"
                  hide-details="true"
                  v-model="newCenterCode"
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
                  :disabled="!newCenterCode || !newCenter"
                  @click="AddNewCenter"
                  >Ajouter</v-btn
                >
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-8"
      v-if="service.verifyIfNotEmpty(concours.matiereConcoursTCI)"
    >
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">
          - Liste des matières à concourir
        </p>
      </v-col>
      <v-col cols="12">
        <v-table class="elevation-1" density="compact">
          <thead>
            <tr>
              <th class="text-start">Nom de la matière</th>
              <th class="text-start">Crédit de la matière</th>
              <th class="text-start"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="matiereConcoursTCI in concours.matiereConcoursTCI">
              <td class="text-start">{{ matiereConcoursTCI.nomMCTCI }}</td>
              <td class="text-start">{{ matiereConcoursTCI.creditMCTCI }}</td>
              <td class="text-center" style="width: 10px !important">
                <v-btn
                  icon="mdi-delete"
                  color="red"
                  variant="plain"
                  title="Supprimer ?"
                  @click="deleteMaterial(matiereConcoursTCI)"
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
                  - Remplir le formulaire pour créer les matières à concourir
                </p>
              </v-col>
              <v-col class="pr-2">
                <v-select
                  hide-details
                  density="comfortable"
                  :items="neWliste"
                  v-model="concours.nomMCTCI"
                  clearable
                  label="Nom de la matière"
                ></v-select>
              </v-col>
              <v-col class="px-2">
                <v-text-field
                  density="comfortable"
                  v-model="concours.creditMCTCI"
                  clearable
                  label="Coefficient de la matière"
                  type="number"
                  min="0"
                  hide-details="true"
                  @keypress.enter="addMaterial"
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
                  :disabled="!concours.nomMCTCI || !concours.creditMCTCI"
                  @click="addMaterial"
                  >Ajouter</v-btn
                >
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-2">
              <v-col cols="12">
                <p class="font-weight-black pb-2 text-subtitle-1">
                  - Ajouter une nouvelle matière
                </p>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  density="comfortable"
                  label="Nouvelle matière"
                  clearable
                  rows="6"
                  hide-details
                  v-model="newMatiere"
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
                  :disabled="!newMatiere"
                  @click="AddNewMatiere"
                  >Ajouter</v-btn
                >
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-8"
      v-if="service.verifyIfNotEmpty(concours.calendrierConcoursTCI)"
    >
      <v-col cols="12">
        <p class="font-weight-black pb-2 text-subtitle-1">
          - Liste des jours d'examen
        </p>
      </v-col>
      <v-col class="pb-8">
        <v-table class="elevation-1" density="compact">
          <thead>
            <tr>
              <th class="text-start pl-8">Matière</th>
              <th class="text-start pl-8">Date</th>
              <th class="text-start pl-8">Heure de debut</th>
              <th class="text-start pl-8">Heure de fin</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="calendrierConcoursTCI in concours.calendrierConcoursTCI">
              <td class="text-start pl-8" style="width: 250px !important">
                {{ calendrierConcoursTCI.nomMCTCI }}
              </td>
              <td class="text-start pl-8">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="calendrierConcoursTCI.dateCalendrierCTCI"
                  hide-details="true"
                  type="date"
                  style="width: 170px"
                ></v-text-field>
              </td>
              <td class="text-start pl-8">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="calendrierConcoursTCI.debutHeureCalendrierCTCI"
                  hide-details="true"
                  type="time"
                  style="width: 170px"
                ></v-text-field>
              </td>
              <td class="text-start pl-8">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="calendrierConcoursTCI.finHeureCalendrierCTCI"
                  hide-details="true"
                  type="time"
                  style="width: 170px"
                ></v-text-field>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="text-center py-4">
        <v-btn
          size="large"
          rounded="pill"
          prepend-icon="mdi-content-save-all"
          color="indigo darken-4"
          class="text-transform-class text-none"
          v-if="
            concours.descriptionCTCI &&
            concours.debutSessionCTCI &&
            concours.finSessionCTCI
          "
          :disabled="!disable.disableTwo || !disable.disableOne"
          @click="create"
          >Enregistrer</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.select {
  position: relative;
  width: 20em;
  height: 3em;
  overflow: hidden;
  border-bottom: 1px grey solid;
  background-color: rgba(128, 128, 128, 0.098);
}
/* Arrow */
.select::after {
  content: "\25BC";
  position: absolute;
  top: 0;
  right: 0;
  padding: 1em;
  color: grey;
  transition: 0.25s all ease;
  pointer-events: none;
}
/* Transition */
label {
  margin-left: 10px;
}

label {
  font-size: 14px;
  padding-left: 5px;
}

select {
  outline: 10px red;
  border: 0;
  box-shadow: none;
  flex: 1;
  padding: 0 1em;
  background-image: none;
  cursor: pointer;
}
select::-ms-expand {
  display: none;
}

</style>
