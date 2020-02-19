import Vue from 'vue';

export default {
  methods: {
    getCredential(credential) {
      return this.customConfig.extractor.credentials[credential];
    },
    setCredential(credential, value) {
      Vue.set(this.customConfig.extractor.credentials, credential, value);
    },
  },
  computed: {
    GOOGLE_APPLICATION_CREDENTIALS: {
      get() {
        return this.getCredential('GOOGLE_APPLICATION_CREDENTIALS');
      },
      set(value) {
        this.setCredential('GOOGLE_APPLICATION_CREDENTIALS', value);
      },
    },
    OCP_APIM_SUBSCRIPTION_KEY: {
      get() {
        return this.getCredential('OCP_APIM_SUBSCRIPTION_KEY');
      },
      set(value) {
        this.setCredential('OCP_APIM_SUBSCRIPTION_KEY', value);
      },
    },
    OCP_APIM_ENDPOINT: {
      get() {
        return this.getCredential('OCP_APIM_ENDPOINT');
      },
      set(value) {
        this.setCredential('OCP_APIM_ENDPOINT', value);
      },
    },
    AWS_ACCESS_KEY_ID: {
      get() {
        return this.getCredential('AWS_ACCESS_KEY_ID');
      },
      set(value) {
        this.setCredential('AWS_ACCESS_KEY_ID', value);
      },
    },
    AWS_SECRET_ACCESS_KEY: {
      get() {
        return this.getCredential('AWS_SECRET_ACCESS_KEY');
      },
      set(value) {
        this.setCredential('AWS_SECRET_ACCESS_KEY', value);
      },
    },
    ABBYY_SERVER_URL: {
      get() {
        return this.getCredential('ABBYY_SERVER_URL');
      },
      set(value) {
        this.setCredential('ABBYY_SERVER_URL', value);
      },
    },
    ABBYY_SERVER_VER: {
      get() {
        return this.getCredential('ABBYY_SERVER_VER');
      },
      set(value) {
        this.setCredential('ABBYY_SERVER_VER', value);
      },
    },
    ABBYY_WORKFLOW: {
      get() {
        return this.getCredential('ABBYY_WORKFLOW');
      },
      set(value) {
        this.setCredential('ABBYY_WORKFLOW', value);
      },
    },
  },
};
