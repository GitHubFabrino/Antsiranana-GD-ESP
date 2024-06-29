<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's component
import { onBeforeMount, ref, watch } from "vue";

// import my pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
import { useConcoursStore } from "@/pinia/concours";
import { useOverlayStore } from "@/pinia/overlay";
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
const overlay = useOverlayStore();
const disable = usedisableStore();
const enseignant = useEnseignantStore();

// create variables
const index = ref(0);
const idx = ref(0);
const neWliste = ref([]);
const nomEn = ref(null);
const choseChef = ref(null);
const prenomsEn = ref(null);
const telephone = ref(null);
const nomCentreCTCI = ref(null);
const idxAdjoint = ref(0);
const choseChefAdjoint = ref(null);
const codePostale = ref(null);
const newMatiere = ref(null);
const newCenter = ref(null);
const newCenterCode = ref(null);
const listCenterCode = ref([]);
const newlistCentre = ref([]);
const dateDebut = ref("");
const dateFin = ref("");
const Id = ref(null);

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

function chefdeCentreAdjoint() {
  for (let i of nomEn.value) {
    if (i === choseChefAdjoint.value) {
      idxAdjoint.value = nomEn.value.indexOf(i);
      concours.centreConcoursTCI.nomAdjoint = nomEn.value[idxAdjoint.value];
      concours.centreConcoursTCI.prenomsAdjoint =
        prenomsEn.value[idxAdjoint.value];
    }
  }
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
    choseChef.value = "";
    concours.nomAdjoint = "";
    concours.prenomAdjoint = "";
  } else alert.warningForm();
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
function update() {
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
  }
  let formTestData = {
    sessionCTCI: concours.sessionCTCI,
    descriptionCTCI: concours.descriptionCTCI,
    dateDebutConcours: concours.debutSessionCTCI,
    dateFinConcours: concours.finSessionCTCI,
  };
  if (service.verifyFormIfOK(formTestData))
    dialog.show("Enregistrer le concours ?", "DialogEnregistrerConcours");
  else alert.warningForm();
}

function updatePostalCode() {
  for (let b of newlistCentre.value) {
    if (b === nomCentreCTCI.value) {
      index.value = newlistCentre.value.indexOf(b);
      codePostale.value = listCenterCode.value[index.value];
    }
  }
}

// watch the change on concours id
watch(
  () => concours.idCTCI,
  (newIdCTCI) => {
    if (service.verifyIfNotEmpty(newIdCTCI)) {
      overlay.show();
      Promise.all([
        restApi.get(`/api/concours/${newIdCTCI}`),
        restApi.get(`/api/concours/${newIdCTCI}/centre`),
        restApi.get(`/api/concours/${newIdCTCI}/matiere`),
        restApi.get(`/api/concours/${newIdCTCI}/calendrier`),
      ])
        .then((response) => {
          concours.idCTCI = response[0].data.id;
          dateDebut.value = response[0].data.dateDebutConcours;
          concours.debutSessionCTCI = new Date(dateDebut.value);
          const jourDebut = String(
            concours.debutSessionCTCI.getDate() + 1
          ).padStart(2, "0");
          const moisDebut = String(
            concours.debutSessionCTCI.getMonth() + 1
          ).padStart(2, "0");
          const yearsDebut = String(
            concours.debutSessionCTCI.getFullYear()
          ).padStart(2, "0");
          concours.debutSessionCTCI = `${yearsDebut}-${moisDebut}-${jourDebut}`;

          dateFin.value = response[0].data.dateFinConcours;
          concours.finSessionCTCI = new Date(dateFin.value);
          const jourFin = String(
            concours.finSessionCTCI.getDate() + 1
          ).padStart(2, "0");
          const moisFin = String(
            concours.finSessionCTCI.getMonth() + 1
          ).padStart(2, "0");
          const yearsFin = String(
            concours.finSessionCTCI.getFullYear()
          ).padStart(2, "0");
          concours.finSessionCTCI = `${yearsFin}-${moisFin}-${jourFin}`;

          concours.sessionCTCI = response[0].data.sessionCTCI;
          concours.descriptionCTCI = response[0].data.descriptionCTCI;
          concours.matiereConcoursTCI = response[2].data;
          concours.calendrierConcoursTCI = response[3].data;
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
    if (service.verifyIfEmpty(newIdCTCI)) {
      concours.idCTCI = null;
      concours.sessionCTCI = null;
      concours.descriptionCTCI = null;
      concours.centreConcoursTCI = [];
      concours.matiereConcoursTCI = [];
      concours.calendrierConcoursTCI = [];
    }
  }
);

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
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

  restApi
    .get(`/api/concours/${concours.idCTCI}`)
    .then((response) => {
      concours.idCTCI = response.data.id;
      dateDebut.value = response.data.dateDebutConcours;
      concours.debutSessionCTCI = new Date(dateDebut.value);
      const jourDebut = String(
        concours.debutSessionCTCI.getDate() + 1
      ).padStart(2, "0");
      const moisDebut = String(
        concours.debutSessionCTCI.getMonth() + 1
      ).padStart(2, "0");
      const yearsDebut = String(
        concours.debutSessionCTCI.getFullYear()
      ).padStart(2, "0");
      concours.debutSessionCTCI = `${yearsDebut}-${moisDebut}-${jourDebut}`;

      dateFin.value = response.data.dateFinConcours;
      concours.finSessionCTCI = new Date(dateFin.value);
      const jourFin = String(concours.finSessionCTCI.getDate() + 1).padStart(
        2,
        "0"
      );
      const moisFin = String(concours.finSessionCTCI.getMonth() + 1).padStart(
        2,
        "0"
      );
      const yearsFin = String(concours.finSessionCTCI.getFullYear()).padStart(
        2,
        "0"
      );
      concours.finSessionCTCI = `${yearsFin}-${moisFin}-${jourFin}`;
    })
    .catch((e) => {
      console.error(e);
    });
});
</script>

<template>
  <v-row no-gutters class="mt-8">
    <v-col cols="12">
      <h5 class="text-h5">Modification du concours</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-8">
    <v-col cols="12">
      <v-card>
        <v-container>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="font-weight-black text-subtitle-1 pb-2">
                - Modifiez la désignation du concours
              </p>
            </v-col>
            <v-col cols="6" class="pr-2">
              <v-text-field
                type="date"
                density="comfortable"
                label="Date de début"
                v-model="concours.debutSessionCTCI"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="6" class="pl-2">
              <v-text-field
                type="date"
                density="comfortable"
                label="Date de fin"
                v-model="concours.finSessionCTCI"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="pr-2">
              <v-textarea
                label="Description"
                density="comfortable"
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
            <th>Nom de l'Adjoint</th>
            <th>Prénoms de l'Adjoint</th>
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
              <p class="font-weight-black text-subtitle-1 pb-2">
                - Remplir le formulaire pour ajouter un centre d'examen
              </p>
            </v-col>
            <v-col class="pr-2">
              <v-select
                v-model="nomCentreCTCI"
                hide-details
                density="comfortable"
                :items="newlistCentre"
                clearable
                label="Centre"
              ></v-select>
            </v-col>
            <v-col cols="4" class="px-2 v-select">
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
            <v-col cols="4" class="mt-4 v-select">
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
                :disabled="!choseChef || !nomCentreCTCI"
                class="text-transform-class text-none"
                @click="addCenter"
                @keypress.enter="addCenter"
                >Ajouter</v-btn
              >
            </v-col>
          </v-row>
          <v-row no-gutters class="mt-2">
            <v-col cols="12">
              <p class="font-weight-black pb-2 text-subtitle-1">
                - Ajouter un nouveau Centre et son Code Postal
              </p>
            </v-col>
            <v-col cols="6">
              <v-text-field
                density="comfortable"
                label="Nouveau Centre"
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
                label="Code Postal"
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
    <v-col>
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Nom de la matière</th>
            <th>Crédit de la matière</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="matiereConcoursTCI in concours.matiereConcoursTCI">
            <td>{{ matiereConcoursTCI.nomMCTCI }}</td>
            <td>{{ matiereConcoursTCI.creditMCTCI }}</td>
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
              <p class="font-weight-black text-subtitle-1 pb-2">
                - Remplir le formulaire pour ajouter une matière
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
            <v-col cols="4" class="px-2">
              <v-text-field
                hide-details
                density="comfortable"
                v-model="concours.creditMCTCI"
                clearable
                label="Coefficient de la matière"
                type="number"
                min="0"
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
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Liste des jours d'examen
      </p>
    </v-col>
    <v-col class="pb-8">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Matière</th>
            <th>Date</th>
            <th>Heure de debut</th>
            <th>Heure de fin</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="calendrierConcoursTCI in concours.calendrierConcoursTCI">
            <td style="width: 250px !important">
              {{ calendrierConcoursTCI.nomMCTCI }}
            </td>
            <td>
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="calendrierConcoursTCI.dateCalendrierCTCI"
                hide-details="true"
                type="date"
                style="width: 170px"
              ></v-text-field>
            </td>
            <td>
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="calendrierConcoursTCI.debutHeureCalendrierCTCI"
                hide-details="true"
                type="time"
                style="width: 170px"
              ></v-text-field>
            </td>
            <td>
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
    <v-col class="text-center">
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
        @click="update"
        >Enregistrer</v-btn
      >
    </v-col>
  </v-row>
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
