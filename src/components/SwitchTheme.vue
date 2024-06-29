<script setup>
// import my pinia plugins
import { useThemeStore } from '@/pinia/theme';

// instance my pinia plugins
const theme = useThemeStore();
</script>

<template>
  <v-btn append-icon="mdi-theme-light-dark" variant="tonal" @click="theme.toggle()" title="Changer de mode ?" rounded="pill" class="text-transform-class text-none">
    Thème
  </v-btn>
</template>