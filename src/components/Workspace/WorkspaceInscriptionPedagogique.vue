<script setup>
// import my plugins
import { Cookies } from "@/plugins/cookies";
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, watch } from "vue";

// import my pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
import { useNavigationStore } from "@/pinia/navigation";
import { usePersonneStore } from "@/pinia/personne";
import { useNiveauStore } from "@/pinia/niveau";
import { useMentionStore } from "@/pinia/mention";
import { useSemestreStore } from "@/pinia/semestre";
import { useParcoursStore } from "@/pinia/parcours";
import { useEtudiantStore } from "@/pinia/etudiant";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";
import { useRegexStore } from "@/pinia/regex";
import { ref } from "vue";

// instancing my plugins
const restApi = new RestApi();
const cookies = new Cookies();
const service = new Service();
const scroll = new Scroll();

// instancing my pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const personne = usePersonneStore();
const niveau = useNiveauStore();
const mention = useMentionStore();
const semestre = useSemestreStore();
const parcours = useParcoursStore();
const etudiant = useEtudiantStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const regex = useRegexStore();
const status = ref(["PASSANT", "REDOUBLANT"]);
const statueValue = ref(null);

// Doing "Inscription Pedagogique"
function pedagogicalRegistration() {
  let requestData = {
    telephone: personne.telephone,
    email: personne.email,
    idDP: parcours.id,
    idEtudiant: etudiant.id,
    status_etudiant: statueValue.value,
  };
  // if (service.verifyFormIfOK(requestData))
  dialog.show(
    "Enregistrer l'inscription pédagogique ?",
    "DialogEnregistrerInscriptionPedagogique",
    requestData
  );
  // else alert.warningForm();
}

// watch if anneeUniversitaire.id is changing
watch(
  () => anneeUniversitaire.id,
  (newIdAU) => {
    niveau.id = null;
    mention.id = null;
    parcours.id = null;
    if (service.verifyIfNotEmpty(newIdAU)) {
      Promise.all([
        restApi.get(`/api/definition-mention/annee/${newIdAU}`),
        restApi.get(`/api/definition-parcours/annee/${newIdAU}`),
      ])
        .then((response) => {
          mention.list = response[0].data;
          parcours.list = response[1].data;
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    }
  }
);

// watch if niveau.id is changing
watch(
  () => niveau.id,
  (newIdNiveau) => {
    mention.id = null;
    parcours.id = null;
    mention.prepareListWithNiveau();
    parcours.prepareListWithSemestre();
  }
);

// called before Mounting
onBeforeMount(() => {
  scroll.toTop();
  anneeUniversitaire.list = [];
  mention.list = [];
  niveau.list = [];
  semestre.list = [];
  parcours.list = [];
  Promise.all([
    restApi.get(`/api/annee`),
    restApi.get(`/api/niveau`),
    restApi.get(`/api/semestre`),
    restApi.get(`/api/personne/${cookies.get("idPersonne")}`),
    restApi.get(`/api/etudiant/personne/${cookies.get("idPersonne")}`),
  ])
    .then((response) => {
      anneeUniversitaire.list = response[0].data;
      niveau.list = response[1].data;
      semestre.list = response[2].data;
      personne.set(response[3].data);
      etudiant.set(response[4].data);
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
  if (service.verifyIfNotEmpty(anneeUniversitaire.id)) {
    Promise.all([
      restApi.get(`/api/definition-mention/annee/${anneeUniversitaire.id}`),
      restApi.get(`/api/definition-parcours/annee/${anneeUniversitaire.id}`),
    ])
      .then((response) => {
        mention.list = response[0].data;
        parcours.list = response[1].data;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  }
});
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <h4 class="mb-8 text-h4">Inscription ou Réinscription pédagogique</h4>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">
          Faire l'inscription pédagogique
        </p>
      </v-col>
      <v-col cols="4" class="pr-2">
        <v-text-field
          density="comfortable"
          v-model="personne.telephone"
          clearable
          label="Numéro du téléphone"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="px-2">
        <v-text-field
          density="comfortable"
          v-model="personne.email"
          @input.lazy="regex.validationEmail()"
          clearable
          label="Adresse e-mail"
          type="mail"
        ></v-text-field>
        <Transition>
          <p class="alert" v-if="!regex.valide && personne.email">
            Votre Adresse e-mail est Invalide !
          </p>
        </Transition>
      </v-col>
      <v-col cols="4" class="pl-2">
        <Transition>
          <v-select
            density="comfortable"
            label="Année universitaire"
            :items="anneeUniversitaire.list"
            item-title="nomAU"
            v-if="personne.email"
            item-value="id"
            v-model="anneeUniversitaire.id"
          ></v-select>
        </Transition>
      </v-col>
      <v-col cols="4" class="pr-2">
        <Transition>
          <v-select
            density="comfortable"
            label="Niveau"
            :items="niveau.list"
            item-title="niveau"
            v-if="personne.email && anneeUniversitaire.id"
            item-value="id"
            v-model="niveau.id"
          ></v-select>
        </Transition>
      </v-col>
      <v-col cols="4" class="px-2">
        <Transition>
          <v-select
            density="comfortable"
            label="Parcours"
            chips
            multiple
            :items="parcours.listWithSemestre"
            v-if="personne.email && anneeUniversitaire.id && niveau.id"
            item-title="designation"
            item-value="id"
            v-model="parcours.id"
          ></v-select>
        </Transition>
      </v-col>
      <v-col cols="4" class="pl-2">
        <Transition>
          <v-select
            density="comfortable"
            label="Status"
            :items="status"
            item-title="Status"
           
            item-value="status"
            v-model="statueValue"
          ></v-select>
        </Transition>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="text-center">
        <v-btn
          size="large"
          rounded="pill"
          prepend-icon="mdi-content-save-all"
          color="indigo darken-4"
          :disabled="!parcours.id"
          class="text-transform-class text-none"
          @click="pedagogicalRegistration"
          >Enregistrer</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.alert {
  text-align: center;
  color: red;
  margin-bottom: 20px;
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
