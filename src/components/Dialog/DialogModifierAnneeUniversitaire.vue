<script setup>
// import my Pinia plugins
import { useDialogStore } from '@/pinia/dialog';
import { useAnneeUniversitaireStore } from '@/pinia/anneeUniversitaire';

// instance my Pinia plugins
const dialog = useDialogStore();
const anneeUniversitaire = useAnneeUniversitaireStore();

// when the user is saying YES
function oui() {
  anneeUniversitaire.editAU(dialog.data);
  dialog.hide();
}

// when the user is saying NO
function non() {
  dialog.hide();
}
</script>

<template>
  <!-- Form to modify an AU -->
  <v-card-text class="mt-8">
    <v-row no-gutters>
      <v-col cols="12">
        <v-text-field v-model="dialog.data.nomAU" clearable label="Désignation"></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-text-field v-model="dialog.data.debutAU" clearable label="Debut" type="date"></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-text-field v-model="dialog.data.finAU" clearable label="Fin" type="date"></v-text-field>
      </v-col>
    </v-row>  
  </v-card-text>
  <v-card-actions class="d-flex justify-space-around">
    <v-btn rounded="pill" class="px-6" prepend-icon="mdi-comment-check" variant="tonal" color="success" @click="oui">OUI</v-btn>
    <v-btn rounded="pill" class="px-6" prepend-icon="mdi-comment-remove" variant="tonal" color="red" @click="non">NON</v-btn>
  </v-card-actions>
</template>