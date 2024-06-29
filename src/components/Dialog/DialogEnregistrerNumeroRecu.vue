<script setup>
// import my plugins
import { Service } from "@/plugins/service";

// import my Pinia plugins
import { useDialogStore } from "@/pinia/dialog";
import { useInscriptionStore } from "@/pinia/inscription";

// instance of my plugins
const service = new Service();

// instance of my pinia plugins
const dialog = useDialogStore();
const inscription = useInscriptionStore();

// authorize the Student
function oui() {
  inscription.giveAutorisations(dialog.data);
  dialog.hide();
}

// remove authorization
function non() {
  inscription.removeAutorisations(dialog.data);
  dialog.hide();
}

function annuler() {
  dialog.hide();
}
</script>

<template>
  <!-- saving "Numero recu" -->
  <v-card-text class="pt-10">
    <v-container>
      <v-row no-gutters>
        <v-col cols="12">
          <v-text-field
            type="text"
            variant="solo"
            label="Prénoms"
            readonly
            v-model="dialog.data.nom"
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field
            type="text"
            variant="solo"
            label="Prénoms"
            readonly
            v-model="dialog.data.prenoms"
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field
            type="number"
            label="Numéro du recu"
            v-model="dialog.data.numeroRecu"
            clearable
            @keypress.enter="oui"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>
  </v-card-text>

  <!-- Making decision Yes or No -->
  <v-card-actions class="d-flex justify-space-around">
    <v-btn
      rounded="pill"
      class="px-6"
      prepend-icon="mdi-comment-check"
      variant="tonal"
      color="success"
      @click="oui"
      >OUI</v-btn
    >
    <v-btn
      rounded="pill"
      class="px-6"
      prepend-icon="mdi-comment-check"
      variant="tonal"
      color="warning"
      @click="annuler"
      >Annuler</v-btn
    >
    <v-btn
      rounded="pill"
      class="px-6"
      prepend-icon="mdi-comment-remove"
      variant="tonal"
      color="red"
      @click="non"
      >NON</v-btn
    >
  </v-card-actions>
</template>
