<script setup>
// some of my plugins
import { Cookies } from '@/plugins/cookies';

// import router plugins from VueRouter
import { useRouter } from 'vue-router';

// import pinia plugins
import { useViewStore } from '@/pinia/view';
import { useAlertStore } from '@/pinia/alert';
import { useDialogStore } from '@/pinia/dialog';
import { usePersonneStore } from '@/pinia/personne';

// instance of my plugins
const cookies = new Cookies();

// instance the router
const router = useRouter();

// instance pinia plugins
const view = useViewStore();
const alert = useAlertStore();
const dialog = useDialogStore();
const personne = usePersonneStore();

// when the user is saying YES 
function oui() {
  cookies.delete('accessToken');
  cookies.delete('idPersonne');
  cookies.delete('status');
  router.replace({ path: "/" });
  view.set('Authentification');
  alert.add("success", "Déconnexion réussi !");
  dialog.hide();
  personne.data = [];
  window.location.reload();
}

// when the user is saying NO
function non() {
  dialog.hide();
}
</script>

<template>
  <!-- Making decision Yes or No -->
  <v-card-actions class="d-flex justify-space-around pt-16">
    <v-btn rounded="pill" class="px-6" prepend-icon="mdi-comment-check" variant="tonal" color="success" @click="oui">OUI</v-btn>
    <v-btn rounded="pill" class="px-6" prepend-icon="mdi-comment-remove" variant="tonal" color="red" @click="non">NON</v-btn>
  </v-card-actions>
</template>