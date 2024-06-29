<script setup>
// import my Pinia plugins
import { useDialogStore } from '@/pinia/dialog';
import { useEtudiantStore } from '@/pinia/etudiant';

// instance my Pinia plugins
const dialog = useDialogStore();
const etudiant = useEtudiantStore();

// when the user is saying YES
function oui() {
  etudiant.administrativeRegistration(dialog.data);
  dialog.hide();
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