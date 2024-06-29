<script setup>
// import my plugins
import { RestApi } from '@/plugins/restApi';
import { Service } from '@/plugins/service';
import { Scroll } from '@/plugins/scroll';

// import Vuejs's component
import { onBeforeMount, watch } from 'vue';

// import my pinia plugins
import { useAlertStore } from '@/pinia/alert';
import { useConcoursStore } from '@/pinia/concours';

// instance my plugins
const restApi = new RestApi();
const service = new Service();
const scroll = new Scroll();

// instance my pinia plugins
const alert = useAlertStore();
const concours = useConcoursStore();

// called before mounting
onBeforeMount(() => {
  scroll.toTop();
  if (service.verifyIfNotEmpty(concours.idCTCI)) {
    Promise
    .all([
      restApi.get(`/api/concours/${concours.idCTCI}`),
      restApi.get(`/api/concours/${concours.idCTCI}/centre`),
      restApi.get(`/api/concours/${concours.idCTCI}/matiere`),
      restApi.get(`/api/concours/${concours.idCTCI}/calendrier`)
    ])
    .then(response => {
      concours.idCTCI = response[0].data.id;
      concours.sessionCTCI = response[0].data.sessionCTCI;    
      concours.descriptionCTCI = response[0].data.descriptionCTCI;
      concours.centreConcoursTCI = response[1].data;
      concours.matiereConcoursTCI = response[2].data;
      concours.calendrierConcoursTCI = response[3].data;
    })
    .catch(error => { alert.error(); console.error(error); });
  } 
  if (service.verifyIfEmpty(concours.idCTCI)) {
    concours.idCTCI = null;
    concours.sessionCTCI = null;
    concours.descriptionCTCI = null;
    concours.centreConcoursTCI = [];
    concours.matiereConcoursTCI = [];
    concours.calendrierConcoursTCI = [];
  }
})
</script>

<template>  
  <v-row no-gutters class="mt-8">
    <v-col cols="12">
      <h5 class="text-h5">Les détails de ce concours</h5>
    </v-col>
  </v-row>
  <v-row no-gutters class="mt-4">
    <v-col cols="12" class="ml-4">
      <ul>
        <li class="mt-4">Session : <strong class="font-weight-black text-green">{{ concours.sessionCTCI }}</strong></li>
        <li class="mt-4">Description : <strong class="font-weight-black text-green">{{ concours.descriptionCTCI }}</strong></li>
        <li class="mt-4">Centres : 
          <ul class="ml-8 font-weight-black text-green">
            <li class="pl-2" v-for="item in concours.centreConcoursTCI" :key="item.nomCentreCTCI">- {{ item.nomCentreCTCI }} &nbsp;&nbsp;&nbsp;&nbsp;(code postal :  {{ item.codePostale }})</li>
          </ul>
        </li>
        <li class="mt-4">Matières :
          <ul class="ml-8 font-weight-black text-green">
            <li class="pl-2" v-for="item in concours.matiereConcoursTCI" :key="item.nomMCTCI">- {{ item.nomMCTCI }} &nbsp;&nbsp;&nbsp;&nbsp;({{ item.creditMCTCI }} crédit)</li>
          </ul>          
        </li>
      </ul>
    </v-col>
  </v-row>
</template>

<style scoped>
li{
  list-style: none;
  }

</style>