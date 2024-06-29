<script setup>
// import my pinia plugins
import { useDialogStore } from "@/pinia/dialog";
import { usedisableStore } from '@/pinia/disable';


// instance my pinia plugins
const dialog = useDialogStore();
const disable = usedisableStore()

// when the user is saying OK
function ok() {
  dialog.hide();
  disable.disableLoginFunction()
}

</script>

<template>
  <v-card-text class="pt-10">
    <v-container>
      <v-row no-gutters>
        <v-col cols="12">
          <v-text-field
            label="Identifiant ou e-mail"
            variant="solo"
            v-model="dialog.data.login"
            prepend-inner-icon="mdi-card-account-details"
            type="text"
            readonly
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Mot de passe"
            variant="solo"
            v-model="dialog.data.motDePasse"
            prepend-inner-icon="mdi-eye"
            type="text"
            readonly
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
      @click="ok"
      >OK</v-btn
    >
  </v-card-actions>
</template>
