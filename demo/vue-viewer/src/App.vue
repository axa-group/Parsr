<template>
  <div id="app">
    <v-app>
      <app-nav />
      <router-view />
    </v-app>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import AppNav from '@/components/NavBar';

export default {
  components: { AppNav },
  methods: {
    ...mapActions(['getDefaultConfiguration']),
  },
  mounted() {
    this.getDefaultConfiguration();
  },
};
</script>

<style>
body,
h1 {
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.main {
  box-shadow: 0 -2px rgb(217, 217, 217), 0 -3px rgb(154, 154, 154);
  margin-top: 3px;
}
</style>
