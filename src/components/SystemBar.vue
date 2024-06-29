<script setup>
// import my pinia plugins
import { useStatusStore } from '@/pinia/status';

// import Vuejs plugins
import { computed } from 'vue';

// import VueRouter
import { useRouter } from 'vue-router';

// instance my pinia plugins
const status = useStatusStore();

// instance VueRouter
const router = useRouter();

// create variables
const page = computed(() => router.currentRoute.value.name );
</script>

<template>
  <v-system-bar color="indigo" height="30">
    <v-chip prepend-icon="mdi-arrow-right-bold" variant="text">{{ page }}</v-chip>
    <v-spacer></v-spacer>
    <v-chip prepend-icon="mdi-account" v-for="(item, index) in status.list" size="x-small" :key="index" class="ml-2"><strong>{{ item }}</strong></v-chip>
  </v-system-bar>
</template>