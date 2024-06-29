<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";
import { Cookies } from "@/plugins/cookies";

// import Vuejs's plugins
import { onBeforeMount, watch, ref, reactive, onBeforeUnmount } from "vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useOverlayStore } from "@/pinia/overlay";
import { useDialogStore } from "@/pinia/dialog";
import { useNiveauStore } from "@/pinia/niveau";
import { useEtudiantStore } from "@/pinia/etudiant";
import { useParcoursStore } from "@/pinia/parcours";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";
import { usedisableStore } from "@/pinia/disable";

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();
const cookies = new Cookies();

// instance my Pinia plugins
const alert = useAlertStore();
const overlay = useOverlayStore();
const dialog = useDialogStore();
const etudiant = useEtudiantStore();
const niveau = useNiveauStore();
const parcours = useParcoursStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const disable = usedisableStore();

// creating variables
const moyenne = ref(null);
const condition = reactive({
  moyenne: false,
  nombre: true,
});


function lookReleveNote(value) {
  dialog.showFullScreen(
    "",
    "DialogVisualiserUE",
    value
  );
}




function redouble(id) {
  restApi
    .put(`/api/redoublement/${parcours.id[0]}/${parcours.id[1]}/${id}`, {
      code_redoublement: 4,
    })
    .then((response) => {
      console.log(response);
      alert.successSave();
      overlay.show();
      restApi
        .get(`/api/releve-note/dp/${parcours.id[0]}/${parcours.id[1]}`)
        .then((response) => {
          etudiant.list = response.data;
          etudiant.list.sort((a, b) => b.moyenne - a.moyenne);
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    })
    .catch((error) => {
      console.error(error);
      alert.error();
    });
}

function exlure(id) {
  restApi
    .put(`/api/redoublement/${parcours.id[0]}/${parcours.id[1]}/${id}`, {
      code_redoublement: 0,
    })
    .then((response) => {
      console.log(response);
      alert.successSave();
      overlay.show();
      restApi
        .get(`/api/releve-note/dp/${parcours.id[0]}/${parcours.id[1]}`)
        .then((response) => {
          etudiant.list = response.data;
          etudiant.list.sort((a, b) => b.moyenne - a.moyenne);
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    })
    .catch((error) => {
      console.error(error);
      alert.error();
    });
}

// // update
function saveDeliberation() {
  dialog.show(
    "Faire la délibération ?",
    "DialogEnregistrerEtudiantDeliberation"
  );
}

// // watch if anneeUniversitaire.id is changing
watch(
  () => anneeUniversitaire.id,
  (newIdAU) => {
    niveau.id = null;
    parcours.id = null;
    if (service.verifyIfNotEmpty(newIdAU)) {
      restApi
        .get(`/api/definition-parcours/annee/${newIdAU}`)
        .then((response) => {
          parcours.list = response.data;
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    }
  }
);



// watch if parcours.id is changing
watch(
  () => parcours.id,
  (newParcoursId) => {
    etudiant.list = [];
    if (service.verifyIfNotEmpty(newParcoursId)) {
      if (parcours.id.length == 2) {
        overlay.show();
        restApi
          .get(`/api/releve-note/dp/${parcours.id[0]}/${parcours.id[1]}`)
          .then((response) => {
            etudiant.list = response.data;
            etudiant.list.sort((a, b) => b.moyenne - a.moyenne);
            overlay.hide();
          })
          .catch((error) => {
            alert.error();
            console.error(error);
            overlay.hide();
          });
      }
      if (parcours.id.length == 1) {
        etudiant.list = [];
      }
    }
  }
);

// // Called before mounting
onBeforeMount(() => {
  scroll.toTop();
  etudiant.list = [];
  parcours.hide = true;
  parcours.id = null;
  niveau.id = null;
  moyenne.value = etudiant.deliberation.mgv;
  restApi.get(`/api/enseignant/personne/${cookies.get("idPersonne")}`);
});

onBeforeUnmount(() => {
  parcours.hide = false;
  etudiant.list = [];
  niveau.id = null;
  parcours.id = null;
});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Délibération des étudiants</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col
      cols="8"
      class="pr-2"
      v-if="
        service.verifyIfNotEmpty(parcours.list) &&
        service.verifyIfNotEmpty(niveau.id)
      "
    >
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Sélectionnez les deux parcours formant l'année universitaire
      </p>
      <v-select
        multiple
        chips
        label="Parcours"
        :items="parcours.listWithSemestre"
        item-title="designation"
        item-value="id"
        v-model="parcours.id"
      ></v-select>
    </v-col>
    <v-col cols="12" v-if="service.verifyIfNotEmpty(etudiant.list)">
      <v-card>
        <v-container>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="font-weight-black pb-2 text-subtitle-1">
                - Remplir les conditions d'admission
              </p>
            </v-col>
            <v-col cols="4" class="pr-2">
              <v-text-field
                @input="moyenneFunct"
                v-model="etudiant.deliberation.mgv"
                clearable
                label="Moyenne"
                type="number"
                min="0"
                max="20"
              ></v-text-field>
              <p>{{ ueValide }}</p>
            </v-col>
            <v-col cols="4" class="px-2">
              <v-text-field
                @input="ueFunct"
                v-model="etudiant.deliberation.uec"
                clearable
                label="Moyenne UE compensée"
                type="number"
                min="0"
                max="20"
              ></v-text-field>
            </v-col>
            <v-col cols="4" class="pl-2">
              <v-text-field
                v-model="etudiant.deliberation.ece"
                clearable
                label="Note EC éliminé"
                type="number"
                min="0"
                max="20"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="px-2 text-center">
              <v-btn
                size="x-large"
                rounded="pill"
                prepend-icon="mdi-content-save-all"
                color="indigo darken-4"
                class="text-transform-class text-none"
                @click="saveDeliberation"
                >Enregistrer</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4" v-if="service.verifyIfNotEmpty(etudiant.list)">
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th></th>
            <th>Nom</th>
            <th>Prénoms</th>
            <th>Moyenne</th>
            <th class="text-center">Exclure</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(value, index) in etudiant.list"
            :key="index"
            :class="{
              className: value.codeRedoublement === 0 ? true : false,
              classNameTwo: value.codeRedoublement === 4 ? true : false,
            }"
          >
          <td>
              <v-icon
                icon="mdi-file-eye"
                color="indigo-darken-1"
                style="cursor: pointer"
                @click="lookReleveNote(value)"
              ></v-icon>
            </td>
            <td>{{ value.nom }}</td>
            <td>{{ value.prenoms }}</td>
            <td>{{ value.moyenne }}</td>
            <td class="Exlure">
              <v-btn
                class="bt2"
                @click="redouble(value.idEtudiant)"
                color="yellow"
                v-if="disable.disableOne"
              >
                Redoublé
              </v-btn>
              <v-btn
                class="btn"
                v-if="disable.disableOne"
                @click="exlure(value.idEtudiant)"
                color="red"
              >
                Exclure
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>

<style scoped>
.Exlure {
  width: 220px;
}

.bt2 {
  font-size: 10px;
  margin: 2px 8px;
  width: 80px;
}
.btn {
  font-size: 10px;
  margin: 8px 0px;
  width: 80px;
}

.className {
  background-color: rgba(255, 0, 0, 0.566);
  text-decoration: line-through;
  color: white;
}

.classNameTwo {
  background-color: rgba(255, 136, 0, 0.623);
  text-decoration: line-through;
  color: white;
}
</style>
