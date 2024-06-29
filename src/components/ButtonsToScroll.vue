<script setup>
// import my plugins
import { Scroll } from '@/plugins/scroll';

// instance my plugins
const scroll = new Scroll();

// scroll to top
function scrollToTop() {
  scroll.toTop();
}

// scroll to bottom
function scrollToBottom() {
  scroll.toBottom();
}
</script>

<template>
  <div class="d-flex flex-column">
    <v-btn color="indigo-darken-4" icon="mdi-arrow-up-bold" title="Vers le haut ?" @click="scrollToTop"></v-btn>
    <v-btn color="indigo-darken-4" icon="mdi-arrow-down-bold" title="Vers le bas ?" @click="scrollToBottom"></v-btn>
  </div>
</template>
