<script setup>
// import my pinia plugins
import { useDialogStore } from '@/pinia/dialog';
import { useEnseignantStore } from '@/pinia/enseignant';

// instance my pinia plugins
const dialog = useDialogStore();
const enseignant = useEnseignantStore();

// when the user is saying YES
function oui() {
  enseignant.updateEnseignant(dialog.data);
  dialog.hide();
}

// when the user is saying NO
function non() {
  dialog.hide();
}
</script>

<template>
  <v-card-text class="pt-8">
    <v-container>
      <v-row no-gutters>
        <v-col cols="12">
          <v-text-field label="Nom" density="comfortable" v-model="dialog.data.nom" type="text" readonly></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field label="Prénoms" density="comfortable" v-model="dialog.data.prenoms" type="text" readonly></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field label="Diplôme" density="comfortable" v-model="dialog.data.status" type="text" clearable></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field label="e-mail" density="comfortable" v-model="dialog.data.email" type="text" clearable></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field label="Grade" density="comfortable" v-model="dialog.data.grade" type="text" clearable></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field label="Spécialité" density="comfortable" v-model="dialog.data.specialite" type="text" clearable></v-text-field>
        </v-col>
      </v-row>
    </v-container>
  </v-card-text>

  <!-- Making decision Yes or No -->
  <v-card-actions class="d-flex justify-space-around">
    <v-btn rounded="pill" class="px-6" prepend-icon="mdi-comment-check" variant="tonal" color="success" @click="oui">OUI</v-btn>
    <v-btn rounded="pill" class="px-6" prepend-icon="mdi-comment-remove" variant="tonal" color="red" @click="non">NON</v-btn>
  </v-card-actions>
</template>