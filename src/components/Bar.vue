<script setup>
// import my plugins
import { URL } from '@/plugins/url';

// import my pinia plugins
import { useDialogStore } from '@/pinia/dialog';

// import VueRouter's plugins
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/pinia/theme';

// instance my plugins
const url = new URL();

// instance my pinia plugins
const dialog = useDialogStore();
const theme = useThemeStore();

// instance VueRouter's plugins
const router = useRouter();

// select workspace
function select(path) {
  router.replace({ path: path });
}

// Exiting my workspace
function logout() {
  dialog.show("Se deconnecter ?", "DialogDeconnexion");
}
</script>

<template>
  <v-app-bar flat border>
    <template v-slot:prepend>      
      <v-img id="img-logo-espa" :src="`${url.images}/logo-esp-antsiranana.png`" style="cursor: pointer;" width="200" @click="select(`/`)"></v-img>
    </template>
    <!-- <v-spacer></v-spacer>
    <v-spacer></v-spacer> -->
    <template v-slot:append>
      <v-btn size="large" variant="tonal" class="text-none mr-4" prepend-icon="mdi-folder-account" @click="select('/informations-personnelles')">Moi</v-btn>
      <v-btn size="large" variant="tonal" class="text-none mr-4" prepend-icon="mdi-theme-light-dark" @click="theme.toggle()">Thème</v-btn>
      <v-btn size="large" variant="tonal" class="text-none" prepend-icon="mdi-logout" title="Deconnecter ?" @click="logout">Se deconnecter</v-btn>
    </template>
  </v-app-bar>
</template>

<style scoped>
#img-logo-espa {
  height: 50px;
  width: 100px;
}
</style>