<template>
  <div class="main viewer">
    <v-tabs
      v-if="documentMarkdownFetched"
      class="markdownTabs"
      color="#00008a"
      background-color="#f9f9fd"
      centered
    >
      <v-tab>Code</v-tab>
      <v-tab>Render</v-tab>

      <v-tab-item class="tabItem">
        <pre class="text">{{ documentMarkdown }}</pre>
      </v-tab-item>
      <v-tab-item class="tabItem">
        <vueMarkdown class="text">{{ documentMarkdown }}</vueMarkdown>
      </v-tab-item>
    </v-tabs>

    <v-overlay :absolute="false" opacity="0.5" :value="this.loading || this.error" :dark="false">
      <div class="overlayContent">
        <div v-if="error" class="errorMessage">
          <p style="text-align:center;">
            <strong style="font-size:1em;">Error</strong
            ><v-icon size="20" color="red" style="margin-left:10px">mdi-alert-circle</v-icon>
          </p>
          <p style="text-align: left; padding: 0 20px;">
            {{ error }}
          </p>
          <v-btn v-if="error" rounded class="submit" @click="closeOverlay">CLOSE</v-btn>
        </div>
        <v-progress-circular
          v-if="loading && !error"
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
import VueMarkdown from 'vue-markdown';

export default {
  data() {
    return { error: null };
  },
  components: { VueMarkdown },
  computed: {
    uploadedDocument() {
      return this.documentId !== null;
    },
    documentMarkdownFetched() {
      return this.documentMarkdown !== null;
    },
    ...mapState({
      documentId: state => state.uuid,
      documentMarkdown: state => state.outputs.markdown.code,
      loading: state => state.outputs.markdown.loading,
    }),
  },
  mounted() {
    if (!this.documentMarkdownFetched && this.uploadedDocument) {
      this.$store.dispatch('fetchDocumentMarkdown').catch(error => {
        this.error = error.response.data;
      });
    }
  },
  methods: {
    closeOverlay() {
      this.error = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.viewer {
  background-color: #f9f9fd;
}

.text {
  margin: 0 20px;
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
.overlayContent {
  background-color: white;
  border-radius: 10px;
  min-width: 600px;
  max-width: 50%;
  margin: 0 auto;
  padding: 10px 0px;
}
.markdownTabs {
  margin: 0px;
  background-color: transparent;
}
.tabItem {
  background-color: #f9f9fd !important;
}
.errorMessage {
  padding: 0 10px;
  font-size: 0.9em;
}
.submit {
  margin-top: 10px;
  background-color: #00008a !important;
  color: #ffffff !important;
}
</style>
