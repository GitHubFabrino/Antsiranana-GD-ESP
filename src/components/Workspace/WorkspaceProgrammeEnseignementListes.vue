<script setup>
// // import my plugins
import { Scroll } from "@/plugins/scroll";
import { RestApi } from "@/plugins/restApi";
import { Service } from "@/plugins/service";

// import Vuejs's plugins
import { onBeforeMount, watch, reactive, ref } from "vue";

// import my pinia plugins
import { useAlertStore } from "@/pinia/alert";
import { useDialogStore } from "@/pinia/dialog";
import { useEnseignantStore } from "@/pinia/enseignant";
import { useParcoursStore } from "@/pinia/parcours";
import { usePEStore } from "@/pinia/pe";
import { usedisableStore } from "@/pinia/disable";


// instance my plugins
const scroll = new Scroll();
const restApi = new RestApi();
const service = new Service();

// instance my pinia plugins
const alert = useAlertStore();
const disable = usedisableStore();
const dialog = useDialogStore();
const enseignant = useEnseignantStore();
const parcours = useParcoursStore();
const pe = usePEStore();
const listeue = ref([])
const listeec = ref([])

// update
function update(itemPE) {
  dialog.showForm(
    "Modifier le programme d'enseignement ?",
    "DialogModifierProgrammeEnseignement",
    itemPE
  );
}

// delete
function deletePE(item) {
  dialog.show(
    "Supprimer l'élément constitutif ?",
    "DialogSupprimerProgrammeEnseignement",
    item
  );
}

// watch the changement into parcours
watch(
  () => parcours.id,
  (newIdParcours) => {
    if (service.verifyIfNotEmpty(newIdParcours)) {
      restApi
        .get(`/api/programme-enseignement/dp/${newIdParcours}`)
        .then((response) => {
          pe.list = response.data;
        })
        .catch((error) => {
          alert.error();
          console.error(error);
        });
    }
  }
);

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  restApi
    .get(`/api/enseignant`)
    .then((response) => {
      enseignant.list = response.data;
      enseignant.setAllFullName();
    })
    .catch((error) => {
      alert.error();
      console.error(error);
    });
  if (service.verifyIfNotEmpty(parcours.id)) {
    restApi
      .get(`/api/programme-enseignement/dp/${parcours.id}`)
      .then((response) => {
        pe.list = response.data;
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });
  }

  Promise.all([restApi.get(`/api/programme-enseignement/dp/ec`), restApi.get(`/api/programme-enseignement/dp/ue`)])
      .then((response) => {
        listeec.value = response[0].data
        listeec.value = listeec.value.map((l)=>{
          return l.codeEc
        })

        listeue.value = response[1].data
        listeue.value = listeue.value.map((l)=>{
          return l.codeUe
        })
      })
      .catch((error) => {
        alert.error();
        console.error(error);
      });

});
</script>

<template>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <h5 class="text-h5">Liste des programmes d'enseignement</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col cols="12">
      <v-table class="elevation-1" density="compact">
        <thead>
          <tr>
            <th class="text-truncate">Unité Enseignement</th>
            <th class="text-truncate">Élément Constitutif</th>
            <th class="text-truncate">ET</th>
            <th>ED</th>
            <th>TP</th>
            <th class="text-truncate">Crédit EC</th>
            <th class="text-truncate">Résponsable EC</th>
            <th></th>
            <th class="text-truncate">Résponsable UE</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(itemPE, indexPE) in pe.list" :key="indexPE">
            <td class="text-truncate">
              {{ itemPE.nomUE[0] }}
            </td>
            <td class="text-truncate">
              <table>
                <tr v-for="(item, index) in itemPE.nomEC" :key="index">
                  <td>{{ item.nomEC }}</td>
                </tr>
              </table>
            </td>
            <td class="text-truncate">
              <table>
                <tr
                  v-for="(item, index) in itemPE.volumeHoraireET"
                  :key="index"
                >
                  <td>{{ item }}</td>
                </tr>
              </table>
            </td>
            <td class="text-truncate">
              <table>
                <tr
                  v-for="(item, index) in itemPE.volumeHoraireED"
                  :key="index"
                >
                  <td>{{ item }}</td>
                </tr>
              </table>
            </td>
            <td class="text-truncate">
              <table>
                <tr
                  v-for="(item, index) in itemPE.volumeHoraireTP"
                  :key="index"
                >
                  <td>{{ item }}</td>
                </tr>
              </table>
            </td>
            <td class="text-truncate">
              <table>
                <tr v-for="(item, index) in itemPE.creditEC" :key="index">
                  <td>{{ item }}</td>
                </tr>
              </table>
            </td>
            <td class="text-truncate">
              <table>
                <tr v-for="(item, index) in itemPE.responsableEC" :key="index">
                  <td>{{ item.nom }}</td>
                </tr>
              </table>
            </td>
            <td>
              <table>
                <tr v-for="(item, index) in itemPE.codeEC" :key="index">
                  <td>
                    <v-icon
                      size="small"
                      color="red"
                      style="cursor: pointer"
                      icon="mdi-delete-forever"
                      @click="deletePE(item)"
                    ></v-icon>
                  </td>
                </tr>
              </table>
            </td>
            <td class="text-truncate">
              {{ itemPE.responsableUE[0].nom }}
            </td>
            <td>
              <v-icon
                color="blue"
                style="cursor: pointer"
                icon="mdi-pen"
                @click="update(itemPE)"
              ></v-icon>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
    <div class="alert">
        <Transition>
          <p v-if="disable.disableTwo" class="message">Suppression impossible car UE déjà utiliser !</p>
        </Transition>
      </div>
  </v-row>
</template>

<style scoped>
.alert {
  text-align: center;
  display: flex;
  padding-bottom: 10px;
  margin: 0 auto;
}
.message {
  width: 100%;
  margin: 0 auto;
  border-radius: 15px;
  color: red;
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;

}

.v-enter-from {
  opacity: 0;
}
.v-enter-active {
  transition: opacity 2s ease;
}

.v-enter-to {
  opacity: 1;
}
.v-leave-from {
  opacity: 1;
}

.v-leave-active {
  transition: opacity 2s ease;
}
.v-leave-to {
  opacity: 0;
}
</style>