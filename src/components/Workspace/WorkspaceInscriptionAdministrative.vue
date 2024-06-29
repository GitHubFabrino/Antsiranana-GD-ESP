<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Cookies } from "@/plugins/cookies";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, ref, watch } from "vue";

// import my pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
import { useSexeStore } from "@/pinia/sexe";
import { useBaccStore } from "@/pinia/bacc";
import { usePersonneStore } from "@/pinia/personne";
import { useEtudiantStore } from "@/pinia/etudiant";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";
import { useRegexStore } from "@/pinia/regex";

// instancing my plugins
const restApi = new RestApi();
const cookies = new Cookies();
const service = new Service();
const scroll = new Scroll();

// instancing my pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const sexe = useSexeStore();
const bacc = useBaccStore();
const personne = usePersonneStore();
const etudiant = useEtudiantStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const regex = useRegexStore();

// creates variables
const niveauNom = ref(null);
const annee1 = ref(null)
const annee2 = ref(null)
const annee3 = ref(null)
const etude1 = ref("")
const etude2 = ref("")
const etude3 = ref("")






// doing "Inscription Administrative"
function administrativeRegistration() {
  const requestData = ref({});
  requestData.value = {
    idPersonne: personne.id,
    nom: personne.nom,
    prenoms: personne.prenoms,
    sexe: personne.sexe,
    dateNaissance: personne.dateNaissance,
    lieuNaissance: personne.lieuNaissance,
    villeNaissance: personne.villeNaissance,
    paysNaissance: personne.paysNaissance,
    nationalite: personne.nationalite,
    adresse: personne.adresse,
    numeroCIN: personne.numeroCIN,
    dateDelivreCIN: personne.dateDelivreCIN,
    villeDelivreCIN: personne.villeDelivreCIN,
    affiliation1: personne.affiliation1,
    affiliation2: personne.affiliation2,
    telephone: personne.telephone,
    email: personne.email,
    idBacc: etudiant.bacc,
    anneeBacc: etudiant.anneeBacc,
    idAU: anneeUniversitaire.id,
    numeroMatricule: etudiant.numeroMatricule,
    annee1 : String(annee1.value),
    annee2 : String(annee2.value),
    annee3 : String(annee3.value) ,
    etude1 : etude1.value,
    etude2 : etude2.value,
    etude3 : etude3.value,



  };
  if (
    service.verifyIfNotEmpty(anneeUniversitaire.id) &&
    service.verifyIfNotEmpty(niveauNom.value)
  )
    dialog.show(
      "Enregistrer l'inscription administrative ?",
      "DialogEnregistrerInscriptionAdministrative",
      requestData.value
    );
  else alert.add("error", "Veuillez sélectionner une année universitaire !");
}

watch(
  () => anneeUniversitaire.id,
  (newIdAU) => {
    if (service.verifyIfNotEmpty(newIdAU)) {
      restApi
        .get(
          `/api/autorisation/personne/${cookies.get(
            "idPersonne"
          )}/au/${newIdAU}`
        )
        .then((response) => {
          niveauNom.value = response.data.niveau;
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          niveauNom.value = null;
        });
    }
  }
);

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  Promise.all([
    restApi.get(`/api/personne/${cookies.get("idPersonne")}`),
    restApi.get(`/api/bacc`),
    restApi.get(`/api/etudiant/personne/${cookies.get("idPersonne")}`),
    restApi.get(`/api/annee`),
  ])
    .then((response) => {
      console.log(response)
      personne.set(response[0].data);
      bacc.list = response[1].data;
      etudiant.set(response[2].data);
      anneeUniversitaire.list = response[3].data;
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
    //console.log(etudiant.numeroMatricule)
});

</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <h4 class="mb-8 text-h4">
          Inscription ou Réinscription administrative
        </h4>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="12">
        <p class="font-weight-black text-subtitle-1 pb-2">
          Faire l'inscription administrative
        </p>
      </v-col>
      <v-col cols="4" class="pr-2">
        <v-text-field
          density="comfortable"
          v-model="personne.nom"
          clearable
          label="Nom"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="px-2">
        <v-text-field
          density="comfortable"
          v-model="personne.prenoms"
          clearable
          label="Prénoms"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pl-2">
        <v-select
          density="comfortable"
          label="Sexe"
          :items="sexe.list"
          item-title="genre"
          item-value="genre"
          v-model="personne.sexe"
        ></v-select>
      </v-col>
      <v-col cols="4" class="pr-2">
        <v-text-field
          density="comfortable"
          v-model="personne.dateNaissance"
          clearable
          label="Date de naissance"
          type="date"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="px-2">
        <v-text-field
          density="comfortable"
          v-model="personne.lieuNaissance"
          clearable
          label="Lieu de naissance"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pl-2">
        <v-text-field
          density="comfortable"
          v-model="personne.villeNaissance"
          clearable
          label="Ville de naissance"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pr-2">
        <v-text-field
          density="comfortable"
          v-model="personne.paysNaissance"
          clearable
          label="Pays de naissance"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="px-2">
        <v-text-field
          density="comfortable"
          v-model="personne.adresse"
          clearable
          label="Adresse du domicile"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pl-2">
        <v-text-field
          density="comfortable"
          v-model="personne.nationalite"
          clearable
          label="Nationalité"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pr-2">
        <v-text-field
          density="comfortable"
          v-model="personne.numeroCIN"
          clearable
          label="Numéro de la CIN/passport"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pr-2">
          <v-text-field
            density="comfortable"
            v-model="etudiant.numeroMatricule"
            clearable
            label="Numéro Matricule"
          ></v-text-field>
        </v-col>
      <v-col cols="4" class="px-2">
        <v-text-field
          density="comfortable"
          v-model="personne.dateDelivreCIN"
          clearable
          label="CIN/passport délivrée le"
          type="date"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pl-2">
        <v-text-field
          density="comfortable"
          v-model="personne.villeDelivreCIN"
          clearable
          label="CIN/passport délivrée à"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pr-2">
        <v-text-field
          density="comfortable"
          v-model="personne.affiliation1"
          clearable
          label="Affiliation 1"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="px-2">
        <v-text-field
          density="comfortable"
          v-model="personne.affiliation2"
          clearable
          label="Affiliation 2"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pl-2">
        <v-text-field
          density="comfortable"
          v-model="personne.telephone"
          clearable
          label="Numéro du téléphone"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pr-2">
        <v-text-field
          density="comfortable"
          @input.lazy="regex.validationEmail()"
          v-model="personne.email"
          clearable
          label="Adresse e-mail"
        ></v-text-field>
        <Transition>
          <p class="alert" v-if="!regex.valide && personne.email">
            Votre Adresse e-mail est Invalide !
          </p>
        </Transition>
      </v-col>
      <v-col cols="4" class="px-2">
        <v-select
          density="comfortable"
          label="Serie du BACC"
          :items="bacc.list"
          item-title="bacc"
          item-value="id"
          v-model="etudiant.bacc"
        ></v-select>
      </v-col>
      <v-col cols="4" class="pl-2">
        <v-text-field
          density="comfortable"
          v-model="etudiant.anneeBacc"
          clearable
          label="Année de l'obtention"
          type="number"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pr-2">
        <v-select
          label="Année universitaire"
          density="comfortable"
          :items="anneeUniversitaire.list"
          item-title="nomAU"
          item-value="id"
          v-model="anneeUniversitaire.id"
        ></v-select>
      </v-col>
      <v-col cols="4" class="px-2">
        <v-text-field
          density="comfortable"
          v-model="niveauNom"
          readonly
          label="Niveau"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row no-gutters class="mt-4" v-if="niveauNom === 'L1'">
      <v-col cols="12">
        <p class="font-weight-black pb-2 text-subtitle-1">
          - Parcours pendant les 3 années antérieurs :
        </p>
      </v-col>
      <v-col cols="10 " class="center">
        <v-table class="elevation-1" density="compact">
          <thead>
            <tr>
              <th style="width: 150px !important">Année</th>
              <th style="width: 200px !important">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr class="mt-2">
              <td>
                <v-text-field
                  density="comfortable"
                  clearable
                  type="number"
                  class="mt-2"
                  v-model="annee1"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  variant="outlined"
                  density="compact"
                  hide-details="true"
                  v-model="etude1"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>
                <v-text-field
                  density="comfortable"
                  clearable
                  type="number"
                  class="mt-2"
                  v-model="annee2"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  variant="outlined"
                  density="compact"
                  hide-details="true"
                  v-model="etude2"

                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>
                <v-text-field
                  density="comfortable"
                  clearable
                  class="mt-2"
                  type="number"
                  v-model="annee3"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  variant="outlined"
                  density="compact"
                  hide-details="true"
                  v-model="etude3"
                ></v-text-field>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row col="12" v-if="niveauNom === 'L1'" class="mt-5 center">
      <p class="bold" >*En validant, vous accepter les termes et les conditions de l'école sur l'utilisations de vos informations* </p>
    </v-row>
    <v-row no-gutters class="mt-5">
      <v-col class="text-center">
        <v-btn
          size="large"
          rounded="pill"
          prepend-icon="mdi-content-save-all"
          color="indigo darken-4"
          :disabled="
            !anneeUniversitaire.id ||
            !niveauNom ||
            !etudiant.bacc ||
            !etudiant.anneeBacc
          "
          class="text-transform-class text-none"
          @click="administrativeRegistration"
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

.bold{
  font-weight: bold;
  margin: 0 auto;
  color: rgba(255, 0, 0, 0.758);
}
.v-leave-to {
  opacity: 0;
}

.center {
  margin: 0 auto;
}
</style>
