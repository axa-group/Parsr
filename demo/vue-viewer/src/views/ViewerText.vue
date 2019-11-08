<template>
  <div class="main viewer">
    <pre v-if="documentTextFetched" class="text">{{ documentText }}</pre>
    <v-overlay :absolute="false" opacity="0.5" :value="this.loading" :dark="false">
      <div class="overlayContent">
        <v-progress-circular
          v-if="loading"
          color="#00008a"
          indeterminate
          size="24"
        ></v-progress-circular>
      </div>
    </v-overlay>
  </div>
</template>
<script>
import { mapState } from 'vuex';

export default {
  computed: {
    documentTextFetched() {
      return this.documentText != null;
    },
    uploadedDocument() {
      return this.documentId !== null;
    },
    ...mapState({
      documentId: state => state.uuid,
      documentText: state => state.outputs.text.code,
      loading: state => state.outputs.text.loading,
    }),
  },
  mounted() {
    if (!this.documentTextFetched && this.uploadedDocument) {
      this.$store.dispatch('fetchDocumentText').catch(error => {
        console.log(error.message);
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.viewer {
  background-color: #f9f9fd;
}

.text {
  margin: 20px;
  background-color: white;
  border: 1px solid rgb(204, 204, 231);
  padding: 16px;
  // word wrap
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
  text-align: left;
}
</style>
