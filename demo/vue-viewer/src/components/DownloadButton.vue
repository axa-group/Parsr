<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on }">
      <v-btn icon color="indigo" v-on="on">
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item-group color="primary">
        <v-list-item v-for="(item, i) in items" :key="i">
          <v-list-item-content @click="download(item.value)">
            <v-list-item-title v-html="item.text"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  methods: {
    download(link) {
      window.open(link, '_blank');
    },
  },
  computed: {
    ...mapGetters(['downloadLinks']),
    items() {
      return Object.keys(this.downloadLinks).map(format => ({
        text: format,
        value: this.downloadLinks[format],
      }));
    },
  },
};
</script>
