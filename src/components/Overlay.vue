<script setup>
import { useOverlayStore } from '@/pinia/overlay';

const overlay = useOverlayStore();
</script>

<template>
  <v-overlay :model-value="overlay.state" class="align-center justify-center text-center" persistent>
    <v-progress-circular color="green-accent-2" indeterminate size="100" width="10"></v-progress-circular>
    <p class="text-green-accent-2 text-center">Chargement</p>
  </v-overlay>
</template>