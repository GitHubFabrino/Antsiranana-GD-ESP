<script setup>
// pinia's plugins
import { useAlertStore } from '@/pinia/alert';

// instance of pinia's plugins
const alert = useAlertStore();
</script>

<template>
  <!-- The Alert component -->
  <div id="alert">
    <template v-for="(value, index) in alert.list">
        <v-alert :type="value.type" v-show="value.isShow" width="auto" density="compact" border="start" prominent class="mt-2 d-flex justify-space-between">
          {{ value.message }}<v-btn icon variant="plain" class="ml-2" @click="alert.remove(index)"><v-icon>mdi-close</v-icon></v-btn>
        </v-alert>
    </template>
  </div>
</template>

<style>
#alert {
  position: fixed;
  top: 36px;
  right: 12px;
  margin: auto;
  z-index: 1000;
}
</style>