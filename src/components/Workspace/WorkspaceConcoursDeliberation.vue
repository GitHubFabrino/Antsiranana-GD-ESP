<script setup>
// import my plugins
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";
import { Scroll } from "@/plugins/scroll";

// import Vuejs's plugins
import { onBeforeMount, ref, watch, reactive } from "vue";

// import my Pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
import { useConcoursStore } from "@/pinia/concours";
import { useOverlayStore } from "@/pinia/overlay";

// instancing my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instancing my Pinia plugins
const alert = useAlertStore();
const dialog = useDialogStore();
const concours = useConcoursStore();
const overlay = useOverlayStore();

// creating variables
const moyenne = ref(null);
const list = ref([]);
const nombre = ref(null);
const admis = ref([]);
const condition = reactive({
  moyenne: false,
  nombre: true,
});

// Getting previous deliberation
function autoCheckByPreviousDeliberaton() {
  admis.value = [];
  concours.listCandidateMoyenne.map((candidat) => {
    if (candidat.passationCandidatCTCI === true) admis.value.push(candidat.id);
  });
}

// auto checking when he has "moyenne"
function autoCheckByMoyenne(moyenne) {
  if (service.verifyIfEmpty(moyenne)) {
    admis.value = [];
    concours.listCandidateMoyenne.map((candidat) => {
      if (candidat.passationCandidatCTCI == true) admis.value.push(candidat.id);
    });
  }
  if (service.verifyIfNotEmpty(moyenne)) {
    admis.value = [];
    concours.listCandidateMoyenne.map((candidat) => {
      if (candidat.moyenneCandidatCTCI >= moyenne)
        admis.value.push(candidat.id);
    });
  }
}

// auto checking
function autoCheck() {
  concours.listCandidateMoyenne.map((candidat) => {
    if (admis.value.some((item) => candidat.id == item)) {
      candidat.passationCandidatCTCI = true;
    } else {
      candidat.passationCandidatCTCI = false;
    }
  });
}

// autocheck by nombre
function autoCheckByNombre(nombreAdmis) {
  admis.value = [];
  if (service.verifyIfNotEmpty(nombreAdmis)) {
    concours.listCandidateMoyenne.map((item, index) => {
      if (index < nombreAdmis) {
        admis.value.push(item.id);
      }
    });
    getLastMoyenne();
  }
}

// getting the last moyenne
function getLastMoyenne() {
  concours.listCandidateMoyenne.map((item) => {
    if (item.id == service.getLastItem(admis.value)) {
      moyenne.value = item.moyenneCandidatCTCI;
    }
  });
}

// Saving "Deliberation"
function saveDeliberation() {
  dialog.show(
    "Enregistrer la délibération ?",
    "DialogEnregistrerDeliberationConcours"
  );
}

// check if if clicked
function clickedAndCheckByNombre() {
  condition.nombre = true;
  condition.moyenne = false;
  autoCheckByNombre(nombre.value);
}

function clickedAndCheckByMoyenne() {
  condition.nombre = false;
  condition.moyenne = true;
  autoCheckByMoyenne(moyenne.value);
}

// Watch if idCTCI is changing
watch(
  () => concours.idCTCI,
  (newIdCTCI) => {
    concours.nombre = null;
    nombre.value = null;
    concours.idCentreCTCI = null;
    concours.listCentre = [];
    concours.listCandidateMoyenne = [];
    overlay.show();
    Promise.all([
      restApi.get(`/api/concours/${newIdCTCI}`),
      restApi.get(`/api/concours/${newIdCTCI}/centre`),
    ])
      .then((response) => {
        concours.idCTCI = response[0].data.id;
        concours.sessionCTCI = response[0].data.sessionCTCI;
        concours.anneeCTCI = response[0].data.anneeCTCI;
        concours.descriptionCTCI = response[0].data.descriptionCTCI;
        concours.listCentre = response[1].data;
      })
      .catch((err) => {
        alert.error();
        console.error(err);
        overlay.hide();
      });

    restApi
      .get(`/api/candidat/concours/${newIdCTCI}`)
      .then((response) => {
        concours.listCandidateMoyenne = response.data;
        concours.listCandidateMoyenne.sort(
          (a, b) => b.moyenneCandidatCTCI - a.moyenneCandidatCTCI
        );
        autoCheckByPreviousDeliberaton();
        concours.listCandidateMoyenne.forEach((e) => {
          if (e.passationCandidatCTCIAttente === true) {
            concours.nombre = concours.nombre + 1;
          }
        });
        overlay.hide();
      })
      .catch((err) => {
        alert.error();
        console.error(err);
        overlay.hide();
      });
  }
);

// watch if idCentreCTCI is changing
watch(
  () => concours.idCentreCTCI,
  (newIdCentreCTCI) => {
    concours.listCandidateMoyenne = [];
    if (service.verifyIfNotEmpty(newIdCentreCTCI)) {
      concours.listCentre.map((item) => {
        if (item.id == newIdCentreCTCI) {
          concours.idCentreCTCI = item.id;
          concours.nomCentreCTCI = item.nomCentreCTCI;
          concours.codePostale = item.codePostale;
        }
      });
      overlay.show();
      Promise.all([
        restApi.get(`/api/candidat/centre/${newIdCentreCTCI}`),
        restApi.get(
          `/api/candidat/concours/${concours.idCTCI}/centre/${newIdCentreCTCI}`
        ),
      ])
        .then((response) => {
          concours.listCandidate = response[0].data;
          concours.listCandidateMoyenne = response[1].data;
          concours.listCandidateMoyenne.sort(
            (a, b) => b.moyenneCandidatCTCI - a.moyenneCandidatCTCI
          );
          autoCheckByPreviousDeliberaton();
          overlay.hide();
        })
        .catch((err) => {
          alert.error();
          console.error(err);
          overlay.hide();
        });
    } else {
      concours.nomCentreCTCI = null;
      concours.codePostale = null;
    }
  }
);

// auto checking Candidat if has "Moyenne"
watch(moyenne, (newMoyenne) => {
  if (condition.moyenne == true) {
    autoCheckByMoyenne(newMoyenne);
    condition.nombre = false;
  }
});

watch(nombre, (newNombre) => {
  if (condition.nombre == true) {
    autoCheckByNombre(newNombre);
    condition.moyenne = false;
  }
});

// auto count "Candidat" has "Moyenne"
watch(admis, (newAdmis) => {
  nombre.value = newAdmis.length;
  autoCheck();
});

// Called before Mounting
onBeforeMount(() => {
  scroll.toTop();
  restApi
    .get(`/api/concours`)
    .then((response) => {
      concours.listConcours = response.data;
    })
    .catch((err) => {
      alert.error();
      console.error(err);
    });
  if (service.verifyIfNotEmpty(concours.idCTCI)) {
    overlay.show();
    Promise.all([
      restApi.get(`/api/concours/${concours.idCTCI}`),
      restApi.get(`/api/concours/${concours.idCTCI}/centre`),
    ])
      .then((response) => {
        concours.idCTCI = response[0].data.id;
        concours.sessionCTCI = response[0].data.sessionCTCI;
        concours.anneeCTCI = response[0].data.anneeCTCI;
        concours.descriptionCTCI = response[0].data.descriptionCTCI;
        concours.listCentre = response[1].data;
      })
      .catch((err) => {
        alert.error();
        console.error(err);
        overlay.hide();
      });
  }
  restApi
    .get(`/api/candidat/concours/${concours.idCTCI}`)
    .then((response) => {
      concours.nombre = null;
      concours.listCandidateMoyenne = response.data;
      concours.listCandidateMoyenne.sort(
        (a, b) => b.moyenneCandidatCTCI - a.moyenneCandidatCTCI
      );
      autoCheckByPreviousDeliberaton();
      concours.listCandidateMoyenne.forEach((e) => {
        if (e.passationCandidatCTCIAttente === true) {
          concours.nombre = concours.nombre + 1;
        }
      });
      overlay.hide();
    })
    .catch((err) => {
      console.error(err);
      overlay.hide();
    });
  concours.idCentreCTCI = null;
  concours.listCentre = [];
  concours.listCandidateMoyenne = [];
  concours.nomCentreCTCI = null;
  concours.codePostale = null;
});
</script>

<template>
  <v-row no-gutters class="mt-8" v-if="service.verifyIfNotEmpty(concours.listCandidateMoyenne)">
    <v-col cols="12">
      <h5 class="text-h5">Faire la délibération des candidats</h5>
    </v-col>
  </v-row>
  <v-row
    no-gutters
    v-if="service.verifyIfNotEmpty(concours.listCandidateMoyenne)"
  >
    <v-col cols="12">
      <v-card>
        <v-container>
          <v-row no-gutters>
            <v-col cols="12">
              <p class="font-weight-black pb-2 text-subtitle-1">
                - Remplir les conditions d'admission
              </p>
            </v-col>
            <v-col class="pr-2">
              <v-text-field
                v-model="moyenne"
                clearable
                label="Moyenne"
                type="number"
                hide-details="true"
                @click="clickedAndCheckByMoyenne"
              ></v-text-field>
            </v-col>
            <v-col class="px-2">
              <v-text-field
                v-model="nombre"
                clearable
                label="Nombre admis"
                type="number"
                hide-details="true"
                @click="clickedAndCheckByNombre"
              ></v-text-field>
            </v-col>
            <v-col class="px-2">
              <v-text-field
                v-model="concours.nombreAttente"
                clearable
                label="Nombre en attente"
                type="number"
                hide-details="true"
              ></v-text-field>
            </v-col>
            <v-col class="pl-2 text-center">
              <h3>
                Nombre des admis : &nbsp;
                <strong class="text-h4 text-red">{{ nombre }}</strong>
              </h3>
            </v-col>
            <v-col class="pl-2 text-center">
              <h3>
                En attente : &nbsp;
                <strong class="text-h4 text-red">{{ concours.nombre }}</strong>
              </h3>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
  <v-row
    class="mt-4"
    no-gutters
    v-if="service.verifyIfNotEmpty(concours.listCandidateMoyenne)"
  >
    <v-col cols="12">
      <p class="font-weight-black pb-2 text-subtitle-1">
        - Liste des candidats
      </p>
    </v-col>
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Centre</th>
            <th>Moyenne</th>
            <th>Admis</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(candidat, keyCandidat) in concours.listCandidateMoyenne"
            :key="keyCandidat"
          >
            <td>{{ candidat.numeroCandidatCTCI }}</td>
            <td>{{ candidat.nomCentreConcours }}</td>
            <td>{{ candidat.moyenneCandidatCTCI }}</td>
            <td
              :class="{
                'text-green':
                  candidat.passationCandidatCTCI === true &&
                  candidat.passationCandidatCTCIAttente === false
                    ? true
                    : false,
                'text-yellow':
                  candidat.passationCandidatCTCIAttente === true &&
                  candidat.passationCandidatCTCI === false
                    ? true
                    : false,
                'text-red':
                  candidat.passationCandidatCTCIAttente === false &&
                  candidat.passationCandidatCTCI === false
                    ? true
                    : false,
              }"
            >
              <v-chip>{{
                candidat.passationCandidatCTCI ? "Oui" : "Non"
              }}</v-chip>
            </td>
            <td>
              <input type="checkbox" v-model="admis" :value="candidat.id" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
  <v-row
    class="mt-4"
    no-gutters
    v-if="service.verifyIfNotEmpty(concours.listCandidateMoyenne)"
  >
    <v-col class="text-center">
      <v-btn
        size="large"
        rounded="pill"
        prepend-icon="mdi-content-save-all"
        color="indigo darken-4"
        class="text-transform-class text-none"
        @click="saveDeliberation"
        >Enregistrer</v-btn
      >
    </v-col>
  </v-row>
</template>
