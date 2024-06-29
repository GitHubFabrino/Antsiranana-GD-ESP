<script setup>
// import my pinia plugins
import { useDialogStore } from '@/pinia/dialog';
import { useDirectionStore } from '@/pinia/direction';

// instance my pinia plugins
const dialog = useDialogStore();
const direction = useDirectionStore();

// when the user is saying YES
function oui() {
  direction.deleteDirection(dialog.data);
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