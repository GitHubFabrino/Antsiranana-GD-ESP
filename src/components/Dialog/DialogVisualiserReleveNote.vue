<script setup>
// import my plugins
import { Service } from "@/plugins/service";
import { RestApi } from "@/plugins/restApi";

// import Vuejs plugins
import { onBeforeMount, ref } from "vue";

// importing my pinia plugins
import { useDialogStore } from "@/pinia/dialog";
import { useSemestreStore } from "@/pinia/semestre";
import { useUEStore } from "@/pinia/ue";
import { useParcoursStore } from "@/pinia/parcours";
import { useAlertStore } from "@/pinia/alert";
import { usePdfStore } from "@/pinia/pdf";
import { useOverlayStore } from "@/pinia/overlay";
import { useAnneeUniversitaireStore } from "@/pinia/anneeUniversitaire";
import { useNiveauStore } from "@/pinia/niveau";
import { useMentionStore } from "@/pinia/mention";
import { useDirectionStore } from "@/pinia/direction";

// instance My plugins
const service = new Service();
const restApi = new RestApi();

// create instance of my pinia plugins
const dialog = useDialogStore();
const ue = useUEStore();
const semestre = useSemestreStore();
const parcours = useParcoursStore();
const alert = useAlertStore();
const pdf = usePdfStore();
const overlay = useOverlayStore();
const au = useAnneeUniversitaireStore();
const niveau = useNiveauStore();
const mention = useMentionStore();
const direction = useDirectionStore();

// creates variables
const semestre1 = ref([]);
const semestre2 = ref([]);
const semestreValidite = ref([]);
const status = ref("");
const statusValue = ref("");

// get ReleveNote
function getReleveNote() {
  if (dialog.data.moyenne >= 10 && semestreValidite.value.includes(3)) {
    status.value = "Admis sous condition";
    statusValue.value = 3;
  }

  if (
    dialog.data.moyenne >= 10 &&
    semestreValidite.value.includes(2) &&
    !semestreValidite.value.includes(3)
  ) {
    status.value = "Admis par compensation";
    statusValue.value = 2;
  }

  if (
    dialog.data.moyenne >= 10 &&
    semestreValidite.value.includes(1) &&
    !semestreValidite.value.includes(2) &&
    !semestreValidite.value.includes(3)
  ) {
    status.value = "Admis";
    statusValue.value = 1;
  } else if (dialog.data.moyenne < 10) {
    status.value = "Redoublant";
    statusValue.value = 4;
  }

  restApi
    .put(
      `/api/releve-note/etudiant/${dialog.data.idEtudiant}/dp/${parcours.id[0]}/${parcours.id[1]}`,
      {
        codeRedoublement: statusValue.value,
      }
    )
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error);
    });

  overlay.show();
  setTimeout(() => {
    let parcours0 = parcours.list.filter(
      (item) => item.id == parcours.id[0]
    )[0];
    let parcours1 = parcours.list.filter(
      (item) => item.id == parcours.id[1]
    )[0];
    dialog.data.semestre1 = semestre1.value;
    dialog.data.semestre2 = semestre2.value;
    dialog.data.au = au.getAU(au.id);
    dialog.data.niveau = niveau.getNiveau(niveau.id);
    dialog.data.parcours = parcours.getParcours(parcours.id[1]);
    dialog.data.mention = mention.getMentionFullName(parcours1.idDM);
    dialog.data.semestre1Nom = semestre.getSemestre(parcours0.idSemestre);
    dialog.data.semestre2Nom = semestre.getSemestre(parcours1.idSemestre);
    dialog.data.codeRedoublement = status.value;
    // switch (dialog.data.codeRedoublement) {
    //   case 0:
    //     dialog.data.codeRedoublement = "Exclu";
    //     break;
    //   case 1:
    //     dialog.data.codeRedoublement = "Admis";
    //     break;
    //   case 2:
    //     dialog.data.codeRedoublement = "Admis par compensation";
    //     break;
    //   case 3:
    //     dialog.data.codeRedoublement = "Admis par condition";
    //     break;
    //   case 4:
    //     dialog.data.codeRedoublement = "Redoublant";
    //     break;
    // }
    dialog.data.directeur = `${direction.directeur.nom} ${direction.directeur.prenoms}`;
    pdf.getReleveNote(dialog.data);
    pdf.getReleveNote(
      semestre1,
      semestre2,
      dialog.data,
      au.getAU(au.id),
      niveau.getNiveau(niveau.id),
      parcours.getParcours(parcours.id[1]),
      mention.getMentionFullName(oneIdDM.idDM)
    );
  }, 100);
  setTimeout(() => {
    overlay.hide();
  }, 10000);
}

function fermer() {
  dialog.hide();
}

// called on before mounted
onBeforeMount(() => {
  if (service.verifyIfNotEmpty(parcours.id)) {
    Promise.all([
      restApi.get(
        `/api/releve-note/etudiant/${dialog.data.idEtudiant}/dp/${parcours.id[0]}`
      ),
      restApi.get(
        `/api/releve-note/etudiant/${dialog.data.idEtudiant}/dp/${parcours.id[1]}`
      ),
      restApi.get(`/api/definition-mention/annee/${au.id}`),
      restApi.get(`/api/direction/directeur`),
    ])
      .then((response) => {
        semestre1.value = response[0].data;
        semestre2.value = response[1].data;
        mention.list = response[2].data;
        direction.directeur = response[3].data;

        semestreValidite.value = [
          ...semestre1.value.map((l) => {
            return l.validationUE;
          }),
          ...semestre2.value.map((l) => {
            return l.validationUE;
          }),
        ];
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
      <v-col cols="12" class="text-left py-4">
        <p>
          Nom et prénoms :
          <strong>{{ dialog.data.nom }} {{ dialog.data.prenoms }}</strong>
        </p>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="12" class="text-left py-2">
        <p>
          <strong>{{ semestre.getSemestre(1) }}</strong>
        </p>
      </v-col>
      <v-col cols="12">
        <v-table density="compact" class="elevation-1">
          <thead>
            <tr>
              <th style="width: 300px">Unité d'enseignement</th>
              <th style="width: 300px">Element constitutif</th>
              <th class="text-truncate">Note d'EC</th>
              <th class="text-truncate">Moyenne d'UE</th>
              <th class="text-truncate">Crédit UE</th>
              <th class="text-truncate">Observation</th>
            </tr>
          </thead>
          <tbody class="text-left">
            <tr v-for="(value, index) in semestre1" :key="index">
              <td>{{ value.nomUE }}</td>
              <td>
                <table>
                  <tbody>
                    <tr
                      v-for="(itemNomEC, indexNomEC) in value.nomEC"
                      :key="indexNomEC"
                    >
                      <td>{{ itemNomEC }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td>
                <table>
                  <tr
                    v-for="(itemNote, indexNote) in value.noteEC"
                    :key="indexNote"
                  >
                    {{
                      itemNote
                    }}
                  </tr>
                </table>
              </td>
              <td>{{ value.moyenneUE }}</td>
              <td>{{ value.creditUE }}</td>
              <td>{{ ue.getObservation(value.validationUE) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="12" class="text-left py-2">
        <p>
          <strong>{{ semestre.getSemestre(2) }}</strong>
        </p>
      </v-col>
      <v-col cols="12">
        <v-table density="compact" class="elevation-1">
          <thead>
            <tr>
              <th style="width: 300px">Unité d'enseignement</th>
              <th style="width: 300px">Element constitutif</th>
              <th class="text-truncate">Note d'EC</th>
              <th class="text-truncate">Moyenne d'UE</th>
              <th class="text-truncate">Crédit UE</th>
              <th class="text-truncate">Observation</th>
            </tr>
          </thead>
          <tbody class="text-left">
            <tr v-for="(value, index) in semestre2" :key="index">
              <td>{{ value.nomUE }}</td>
              <td>
                <table>
                  <tr
                    v-for="(itemNomEC, indexNomEC) in value.nomEC"
                    :key="indexNomEC"
                  >
                    {{
                      itemNomEC
                    }}
                  </tr>
                </table>
              </td>
              <td>
                <table>
                  <tr
                    v-for="(itemNote, indexNote) in value.noteEC"
                    :key="indexNote"
                  >
                    {{
                      itemNote
                    }}
                  </tr>
                </table>
              </td>
              <td>{{ value.moyenneUE }}</td>
              <td>{{ value.creditUE }}</td>
              <td>{{ ue.getObservation(value.validationUE) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="12" class="text-center py-4">
        Moyenne générale : <strong>{{ dialog.data.moyenne }}/20</strong>
      </v-col>
    </v-row>
    <v-row no-gutters class="d-flex justify-center">
      <v-col cols="6" class="d-flex justify-space-around pt-6">
        <v-btn
          size="large"
          rounded="pill"
          prepend-icon="mdi-download"
          color="indigo darken-4"
          class="text-transform-class text-none"
          title="PDF ?"
          @click="getReleveNote"
          >PDF du relevé de notes</v-btn
        >
        <v-btn
          size="large"
          rounded="pill"
          class="px-10"
          prepend-icon="mdi-comment-remove"
          variant="tonal"
          color="red"
          @click="fermer"
          >FERMER</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>
