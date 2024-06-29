<script setup>
// import my plugins
import { useAlertStore } from "@/pinia/alert";
import { RestApi } from "@/plugins/restApi";
import { Scroll } from "@/plugins/scroll";

// import Vuejs plugins
import { onBeforeMount, ref } from "vue";

// instance my plugins
const scroll = new Scroll();
const restApi = new RestApi();

// instance my pinia plugins
const alert = useAlertStore();

// creates variables
const file = ref(null);

// called on before mounting
onBeforeMount(() => {
  scroll.toTop();
});
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <h3 class="text-h4">Séléction des dossiers</h3>
      </v-col>
      <v-col cols="12">
        <iframe src="" frameborder="0"></iframe>
      </v-col>
    </v-row>
  </v-container>
</template>
