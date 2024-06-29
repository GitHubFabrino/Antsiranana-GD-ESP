<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, watch, ref, onBeforeUnmount } from "vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useOverlayStore } from "@/pinia/overlay";
import { useEtudiantStore } from "@/pinia/etudiant";
import { useNiveauStore } from "@/pinia/niveau";
import { useParcoursStore } from "@/pinia/parcours";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";
import { useDialogStore } from "@/pinia/dialog";
import { usePdfStore } from "@/pinia/pdf";
import { useMentionStore } from "@/pinia/mention";

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my Pinia plugins
const alert = useAlertStore();
const overlay = useOverlayStore();
const etudiant = useEtudiantStore();
const niveau = useNiveauStore();
const parcours = useParcoursStore();
const mention = useMentionStore();
const anneeUniversitaire = useAnneeUniversitaireStore();
const dialog = useDialogStore();
const pdf = usePdfStore();

// creates variables
const au = ref(null);

// autorisation les passants à s'inscrire
function autorisationInscription() {
  if (service.verifyIfNotEmpty(au.value))
    dialog.show(
      "Autoriser les étudiants non exclus à s'inscrire ?",
      "DialogEnregistrerAutorisationInscription",
      au.value
    );
  if (service.verifyIfEmpty(au.value)) alert.warningForm();
}

function getResultsFinAU(result, list) {
  overlay.show();
  setTimeout(() => {
    let parcours1 = parcours.list.filter((item) => item.id == parcours.id)[0];
    let data = {
      result,
      list,
      au: anneeUniversitaire.getAU(anneeUniversitaire.id),
      niveau: niveau.getNiveau(niveau.id),
      parcours: parcours.getParcours(parcours.id),
      mention: mention.getMentionFullName(parcours1.idDM),
    };
    pdf.getResultsFinAU(data);
  }, 1000);
}

function getAttestation(data) {
  if (
    service.verifyIfNotEmpty(data.idPersonne) &&
    service.verifyIfNotEmpty(parcours.id)
  ) {
    overlay.show();
    restApi
      .get(`/api/etudiant/attestation/${data.idPersonne}/${parcours.id}`)
      .then((response) => {
        data.niveau = niveau.getNiveau(niveau.id);
        data.anneeUniversitaire = anneeUniversitaire.getAU(
          anneeUniversitaire.id
        );
        data.mention = response.data.mention.mention;
        data.nomRM = response.data.mention.nom;
        data.prenomsRM = response.data.mention.prenoms;
        data.parcours = response.data.parcours;
        data.dateNaissance = response.data.personne.dateNaissance;
        data.lieuNaissance = response.data.personne.lieuNaissance;
        data.numeroCIN = response.data.personne.numeroCIN;
        data.sexe = response.data.personne.sexe;
        data.sexeRM = response.data.mention.sexe;
        data.anneeFin = response.data.anneeFin;
        data.numeroInscription = etudiant.getNumeroInscription(
          data.niveau,
          data.anneeFin,
          data.idEtudiant
        );
        pdf.getAttestation(data);
        overlay.hide();
      })
      .catch((error) => {
        alert.error();
        console.error(error);
        overlay.hide();
      });
  }
}

// watch if anneeUniversitaire.id is changing
watch(
  () => anneeUniversitaire.id,
  (newIdAU) => {
    niveau.id = null;
    parcours.id = null;
    if (service.verifyIfNotEmpty(newIdAU)) {
      Promise.all([
        restApi.get(`/api/definition-parcours/annee/${newIdAU}`),
        restApi.get(`/api/definition-mention/annee/${newIdAU}`),
      ])
        .then((response) => {
          parcours.list = response[0].data;
          mention.list = response[1].data;
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }
);

// watch if niveau.id is changing
watch(
  () => niveau.id,
  (newIdNiveau) => {
    etudiant.list = [];
  }
);

// watch if parcours.id is changing
watch(
  () => parcours.id,
  (newParcoursId) => {
    if (service.verifyIfNotEmpty(newParcoursId)) {
      overlay.show();
      restApi
        .get(`/api/etudiant/resultat/dp/${newParcoursId}`)
        .then((response) => {
          etudiant.setListResultat(response.data);
          overlay.hide();
        })
        .catch((error) => {
          alert.error();
          console.error(error);
          overlay.hide();
        });
    }
  }
);

// Called before mounting
onBeforeMount(() => {
  scroll.toTop();
  etudiant.list = [];
  etudiant.listNotes = [];
  niveau.id = null;
  parcours.id = null;
  etudiant.resultat = true;
});

onBeforeUnmount(() => {
  niveau.id = null;
  parcours.id = null;
  etudiant.resultat = false;
  etudiant.listAdmis = [];
  etudiant.listAdmisCompensation = [];
  etudiant.listAdmisCondition = [];
  etudiant.listRedoublant = [];
  etudiant.listExclu = [];
});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Résultat du fin d'année universitaire</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col cols="7">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Listes des étudiants :
        <strong class="text-h5 text-green">ADMIS</strong>
      </p>
    </v-col>
    <v-col cols="2">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Effectifs :
        <strong class="text-h5 text-red">{{
          etudiant.listAdmis.length
        }}</strong>
      </p>
    </v-col>
    <v-col
      cols="3"
      class="text-right"
      v-if="service.verifyIfNotEmpty(etudiant.listAdmis)"
    >
      <v-btn
        class="text-none"
        color="indigo-darken-4"
        rounded="pill"
        prepend-icon="mdi-download"
        @click="getResultsFinAU('ADMIS', etudiant.listAdmis)"
        >Télécharger en PDF</v-btn
      >
    </v-col>
    <v-col cols="12" v-if="service.verifyIfNotEmpty(etudiant.listAdmis)">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Nom</th>
            <th>Prénoms</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, index) in etudiant.listAdmis" :key="index">
            <td>{{ Number(index + 1) }}</td>
            <td class="text-truncate">{{ value.nom }}</td>
            <td class="text-truncate">{{ value.prenoms }}</td>
            <td style="width: 20px">
              <v-icon
                color="indigo"
                icon="mdi-file"
                @click="getAttestation(value)"
              ></v-icon>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col cols="7">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Listes des étudiants :
        <strong class="text-h6 text-green">ADMIS PAR COMPENSATION</strong>
      </p>
    </v-col>
    <v-col cols="2">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Effectif :
        <strong class="text-h5 text-red">{{
          etudiant.listAdmisCompensation.length
        }}</strong>
      </p>
    </v-col>
    <v-col
      cols="3"
      class="text-right"
      v-if="service.verifyIfNotEmpty(etudiant.listAdmisCompensation)"
    >
      <v-btn
        class="text-none"
        color="indigo-darken-4"
        rounded="pill"
        prepend-icon="mdi-download"
        @click="
          getResultsFinAU(
            'ADMIS PAR COMPENSATION',
            etudiant.listAdmisCompensation
          )
        "
        >Télécharger en PDF</v-btn
      >
    </v-col>
    <v-col
      cols="12"
      v-if="service.verifyIfNotEmpty(etudiant.listAdmisCompensation)"
    >
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Nom</th>
            <th>Prénoms</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(value, index) in etudiant.listAdmisCompensation"
            :key="index"
          >
            <td>{{ Number(index + 1) }}</td>
            <td class="text-truncate">{{ value.nom }}</td>
            <td class="text-truncate">{{ value.prenoms }}</td>
            <td style="width: 20px">
              <v-icon
                color="indigo"
                icon="mdi-file"
                @click="getAttestation(value)"
              ></v-icon>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col cols="7">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Listes des étudiants :
        <strong class="text-h6 text-green">ADMIS SOUS CONDITION</strong>
      </p>
    </v-col>
    <v-col cols="2">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Effectifs :
        <strong class="text-h5 text-red">{{
          etudiant.listAdmisCondition.length
        }}</strong>
      </p>
    </v-col>
    <v-col
      cols="3"
      class="text-right"
      v-if="service.verifyIfNotEmpty(etudiant.listAdmisCondition)"
    >
      <v-btn
        class="text-none"
        color="indigo-darken-4"
        rounded="pill"
        prepend-icon="mdi-download"
        @click="
          getResultsFinAU('ADMIS PAR CONDITION', etudiant.listAdmisCondition)
        "
        >Télécharger en PDF</v-btn
      >
    </v-col>
    <v-col
      cols="12"
      v-if="service.verifyIfNotEmpty(etudiant.listAdmisCondition)"
    >
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Nom</th>
            <th>Prénoms</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(value, index) in etudiant.listAdmisCondition"
            :key="index"
          >
            <td>{{ Number(index + 1) }}</td>
            <td class="text-truncate">{{ value.nom }}</td>
            <td class="text-truncate">{{ value.prenoms }}</td>
            <td style="width: 20px">
              <v-icon
                color="indigo"
                icon="mdi-file"
                @click="getAttestation(value)"
              ></v-icon>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col cols="7">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Listes des étudiants :
        <strong class="text-h6 text-green">REDOUBLANTS</strong>
      </p>
    </v-col>
    <v-col cols="2">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Effectifs :
        <strong class="text-h5 text-red">{{
          etudiant.listRedoublant.length
        }}</strong>
      </p>
    </v-col>
    <!-- <v-col
      cols="3"
      class="text-right"
      v-if="service.verifyIfNotEmpty(etudiant.listRedoublant)"
    >
      <v-btn
        class="text-none"
        color="indigo-darken-4"
        rounded="pill"
        prepend-icon="mdi-download"
        @click="getResultsFinAU('REDOUBLANTS', etudiant.listRedoublant)"
        >Télécharger en PDF</v-btn
      >
    </v-col> -->
    <v-col cols="12" v-if="service.verifyIfNotEmpty(etudiant.listRedoublant)">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Nom</th>
            <th>Prénoms</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, index) in etudiant.listRedoublant" :key="index">
            <td>{{ Number(index + 1) }}</td>
            <td class="text-truncate">{{ value.nom }}</td>
            <td class="text-truncate">{{ value.prenoms }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col cols="7">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Listes des étudiants :
        <strong class="text-h6 text-green">EXCLU</strong>
      </p>
    </v-col>
    <v-col cols="2">
      <p class="font-weight-black text-subtitle-1 pb-2">
        - Effectifs :
        <strong class="text-h5 text-red">{{
          etudiant.listExclu.length
        }}</strong>
      </p>
    </v-col>
    <v-col
      cols="3"
      class="text-right"
      v-if="service.verifyIfNotEmpty(etudiant.listExclu)"
    >
      <v-btn
        class="text-none"
        color="indigo-darken-4"
        rounded="pill"
        prepend-icon="mdi-download"
        @click="getResultsFinAU('EXCLU', etudiant.listExclu)"
        >Télécharger en PDF</v-btn
      >
    </v-col>
    <v-col cols="12" v-if="service.verifyIfNotEmpty(etudiant.listExclu)">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénoms</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, index) in etudiant.listExclu" :key="index">
            <td class="text-truncate">{{ value.nom }}</td>
            <td class="text-truncate">{{ value.prenoms }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row
    no-gutters
    class="mt-4"
    v-if="
      service.verifyIfNotEmpty(etudiant.listAdmis) ||
      service.verifyIfNotEmpty(etudiant.listAdmisCompensation) ||
      service.verifyIfNotEmpty(etudiant.listAdmisCondition) ||
      service.verifyIfNotEmpty(etudiant.listRedoublant)
    "
  >
    <v-col cols="12">
      <v-card>
        <v-container>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="font-weight-black text-subtitle-1 pb-2">
                - Sélectionner l'année universitaire
              </p>
            </v-col>
            <v-col cols="6" class="pr-2">
              <v-select
                density="comfortable"
                label="Sélectionnez l'année universitaire"
                clearable
                :items="anneeUniversitaire.list"
                item-title="nomAU"
                item-value="id"
                v-model="au"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="6" class="text-center">
              <v-btn
                size="large"
                rounded="pill"
                prepend-icon="mdi-checkbox-marked-circle-outline"
                color="indigo darken-4"
                class="text-transform-class text-none py-2"
                @click="autorisationInscription"
                >Autoriser les étudiants à s'inscrire</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>
