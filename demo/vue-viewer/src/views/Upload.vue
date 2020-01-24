<template>
  <div class="main v-application v-application--is-ltr" v-if="!loadingConfig">
    <form @submit.prevent="upload">
      <fieldset>
        <legend>Input file</legend>
        <input type="file" id="file" name="file" @change="fileChanged" style="margin:10px 0px" />
      </fieldset>

      <fieldset>
        <legend>Extractor configuration</legend>
        <v-select
          :items="['pdfminer', 'pdfjs']"
          v-model="defaultConfig.extractor.pdf"
          :flat="true"
          :hide-details="true"
          background-color="transparent"
          color="rgba(0, 0, 0, 0.54)"
          height="20px"
          class="selectOptionExtractor"
          prefix="Pdf"
          solo
        ></v-select>
        <v-select
          :items="[
            'tesseract',
            'abbyy',
            'google-vision',
            'ms-cognitive-services',
            'amazon-textract',
          ]"
          v-model="defaultConfig.extractor.img"
          :flat="true"
          :hide-details="true"
          background-color="transparent"
          color="rgba(0, 0, 0, 0.54)"
          height="20px"
          class="selectOptionExtractor"
          prefix="OCR"
          solo
        ></v-select>
        <div
          class="selectOptionExtractor ocrParameters"
          v-if="defaultConfig.extractor.img === 'google-vision'"
        >
          <legend>GOOGLE_APPLICATION_CREDENTIALS<sup>*</sup></legend>
          <input
            type="file"
            @change="googleCredentialsChanged"
            id="googleVisionCredentials"
            name="googleVisionCredentials"
            accept="application/json"
          />
        </div>
        <div
          class="selectOptionExtractor ocrParameters"
          v-if="defaultConfig.extractor.img === 'ms-cognitive-services'"
        >
          <legend>Ocp-Apim-Subscription-Key<sup>*</sup></legend>
          <input style="border-style: groove" id="MSAPIKEY" name="MSAPIKEY" v-model="msApiKey" />

          <legend>Endpoint<sup>*</sup></legend>
          <input
            style="border-style: groove"
            id="MSENDPOINT"
            name="MSENDPOINT"
            v-model="msEndpoint"
          />
        </div>
        <div
          class="selectOptionExtractor ocrParameters"
          v-if="defaultConfig.extractor.img === 'amazon-textract'"
        >
          <legend>Access_key_id<sup>*</sup></legend>
          <input
            style="border-style: groove"
            id="awsKeyId"
            name="awsKeyId"
            v-model="awsAccessKeyId"
          />

          <legend>Secret_access_key<sup>*</sup></legend>
          <input
            style="border-style: groove"
            id="awsSecretKey"
            name="awsSecretKey"
            v-model="awsSecretAccessKey"
          />
        </div>

        <div
          class="selectOptionExtractor ocrParameters"
          v-if="defaultConfig.extractor.img === 'abbyy'"
        >
          <legend>Abbyy_server_url<sup>*</sup></legend>
          <input
            style="border-style: groove"
            id="abbyyServerUrl"
            name="abbyyServerUrl"
            v-model="abbyyServerUrl"
          />

          <legend>Abbyy_server_ver<sup>*</sup></legend>
          <input
            style="border-style: groove"
            id="abbyyServerVer"
            name="abbyyServerVer"
            v-model="abbyyServerVer"
          />

          <legend>Abbyy_server_workflow<sup>*</sup></legend>
          <input
            style="border-style: groove"
            id="abbyyServerWorkflow"
            name="abbyyServerWorkflow"
            v-model="abbyyServerWorkflow"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>Modules configuration</legend>
        <configItem
          v-for="(item, index) in defaultConfig.cleaner"
          :key="'Item_' + index"
          :model="customConfig.cleaner"
          :value="item"
          @change="configChange"
        />
      </fieldset>

      <v-btn rounded class="submit" :disabled="isSubmitDisabled" @click="upload">SUBMIT</v-btn>
      <p class="required"><span>*</span> Required fields</p>
    </form>

    <v-overlay :absolute="false" opacity="0.5" :value="shouldDisplayOverlay" :dark="false">
      <div class="processTracker">
        <p v-for="status in processStatus" :key="status">
          <span v-html="status" />
          <img :src="checkIcon" />
        </p>
        <p v-if="processError">
          <span style="vertical-align:middle">Process failed</span>
          <v-icon size="20" color="red" style="margin-left:10px">mdi-alert-circle</v-icon>
          <span v-html="processError" />
        </p>
        <v-btn v-if="processError" rounded class="submit" @click="closeProcessTrack">CLOSE</v-btn>
        <v-progress-circular
          v-if="loading"
          color="#00008a"
          indeterminate
          size="24"
        ></v-progress-circular>
        <strong v-if="processStatusCompleted">Process completed</strong>
      </div>
    </v-overlay>
  </div>
</template>
<script>
import CheckIcon from '@/assets/check.png';
import { mapState } from 'vuex';
import { setInterval, clearInterval, setTimeout } from 'timers';
import ConfigItem from '@/components/UploadConfig/ConfigItem';
export default {
  data() {
    return {
      items: [true, false],
      checkIcon: CheckIcon,
      file: null,
      gvCredentials: null,
      msApiKey: null,
      msEndpoint: 'https://westeurope.api.cognitive.microsoft.com/',
      awsAccessKeyId: null,
      awsSecretAccessKey: null,
      abbyyServerUrl: null,
      abbyyServerVer: null,
      abbyyServerWorkflow: null,
      loading: false,
      processStatus: [],
      processStatusCompleted: false,
      processError: null,
      customConfig: null,
    };
  },
  components: { ConfigItem },
  computed: {
    ...mapState({
      defaultConfig: state => state.defaultConfig,
      loadingConfig: state => state.loadingConfig,
    }),
    modulesOrder() {
      return this.defaultConfig.cleaner.map(el => {
        if (Array.isArray(el)) {
          return el[0];
        }
        return el;
      });
    },
    isSubmitDisabled() {
      return (
        !this.file ||
        (this.customConfig.extractor.img === 'google-vision' && !this.gvCredentials) ||
        (this.customConfig.extractor.img === 'ms-cognitive-services' &&
          !(this.msApiKey && this.msEndpoint)) ||
        (this.customConfig.extractor.img === 'amazon-textract' &&
          !(this.awsAccessKeyId && this.awsSecretAccessKey)) ||
        (this.customConfig.extractor.img === 'abbyy' &&
          !(this.abbyyServerUrl && this.abbyyServerVer && this.abbyyServerWorkflow))
      );
    },
    /*
			this function takes the config in 'specs' format and returns only the values of each parameter
			ex:
				parameter: {
					value: 'foo',
					range: ['foo', 'bar']
				}

			returns parameter: 'foo'
		*/
    keyValueConfig() {
      // i have to make sure to clone the values and not the references of the configs
      const config = JSON.parse(JSON.stringify({ ...this.defaultConfig, ...this.customConfig }));
      config.cleaner = config.cleaner.map(mod => {
        if (Array.isArray(mod)) {
          Object.keys(mod[1]).forEach(key => {
            mod[1][key] = mod[1][key].value;
          });
        }
        return mod;
      });
      return config;
    },
    configAsBinary() {
      var data = this.encode(JSON.stringify(this.keyValueConfig));
      return new Blob([data], {
        type: 'application/json',
      });
    },
    shouldDisplayOverlay() {
      return this.processStatus.length > 0 || this.processError;
    },
  },
  beforeMount() {
    this.customConfig = { ...this.defaultConfig };
  },
  watch: {
    loadingConfig(newVal, oldVal) {
      if (oldVal && !newVal) {
        //finished loading
        this.customConfig = { ...this.defaultConfig };
      }
    },
  },
  methods: {
    configChange(configItem) {
      if (configItem.selected) {
        this.customConfig.cleaner.push(configItem.item);
        const moduleName = configItem => {
          if (Array.isArray(configItem)) {
            return configItem[0];
          }
          return configItem;
        };
        const correctOrder = this.modulesOrder;
        this.customConfig.cleaner.sort((a, b) => {
          return correctOrder.indexOf(moduleName(a)) - correctOrder.indexOf(moduleName(b));
        });
      } else {
        this.customConfig.cleaner = this.customConfig.cleaner.filter(el => el !== configItem.item);
      }
    },
    fileChanged(event) {
      this.file = event.target.files[0];
    },
    googleCredentialsChanged(event) {
      this.gvCredentials = event.target.files[0];
    },
    trackPipeStatus() {
      const interval = setInterval(() => {
        this.$store
          .dispatch('getDocumentStatus')
          .then(response => {
            const currentStatus = response.status
              ? response.status
                  .split(', Options')
                  .join("<p style='font-size:0.8em;color:#a8a8a8'> - Options") + '</p>'
              : null;
            if (currentStatus && [...this.processStatus].pop() != currentStatus) {
              this.processStatus.push(currentStatus);
            } else if (response.id) {
              this.loading = false;
              this.processStatusCompleted = true;
              clearInterval(interval);
              setTimeout(() => {
                this.$router.push('viewer');
              }, 1000);
            }
          })
          .catch(error => {
            const errorMessage = error.response.data.split('Error:');
            this.processError =
              "<p style='font-size:0.8em;color:#a8a8a8;text-align:left'>" +
              errorMessage[1] +
              '</p>';

            this.loading = false;
            clearInterval(interval);
          });
      }, 1000);
    },
    upload() {
      this.loading = true;
      this.$store
        .dispatch('postDocument', {
          file: this.file,
          configuration: this.configAsBinary,
          credentials: {
            googleVision: this.gvCredentials,
            msApiKey: this.msApiKey,
            msEndpoint: this.msEndpoint,
            awsAccessKeyId: this.awsAccessKeyId,
            awsSecretAccessKey: this.awsSecretAccessKey,
            abbyyServerUrl: this.abbyyServerUrl,
            abbyyServerVer: this.abbyyServerVer,
            abbyyServerWorkflow: this.abbyyServerWorkflow,
          },
        })
        .then(() => {
          this.processStatus = ['Upload Completed'];
          //this.loading = false;
          this.trackPipeStatus();
        })
        .catch(error => {
          this.processError =
            "<p style='font-size:0.8em;color:#a8a8a8;text-align:left;width:100%;'>" +
            error.message +
            '</p>';

          this.loading = false;
        });
    },
    encode(string) {
      var out = [];
      for (var i = 0; i < string.length; i++) {
        out[i] = string.charCodeAt(i);
      }
      return new Uint8Array(out);
    },
    closeProcessTrack() {
      console.log('Close');
      this.processStatus = [];
      this.processError = null;
    },
  },
};
</script>

<style lang="scss">
.selectOptionExtractor div.v-input__control {
  min-height: auto !important;
}
.selectOptionExtractor div.v-input__control div.v-input__slot {
  padding: 0 !important;
}
.selectOptionExtractor div.v-input__control div.v-select__slot {
  width: 210px;
}
.selectOptionExtractor div.v-input__control div.v-select__slot div.v-text-field__prefix {
  min-width: 60px;
  text-align: left;
}
.selectOptionExtractor div.v-input__control div.v-input__slot div.v-select__selection {
  border: solid 1px #cccccc;
  min-width: 120px;
  text-align: center;
  display: block;
  padding: 0 5px;
}
.selectOptionExtractor div.v-input__control div.v-input__slot input {
  width: 0 !important;
  max-width: 0 !important;
}
</style>
<style lang="scss" scoped>
.main {
  padding-top: 20px;
  flex-direction: column;
}
.submit {
  margin-top: 10px;
  background-color: #00008a !important;
  color: #ffffff !important;
}
form {
  min-width: 600px;
  max-width: 50%;
  margin: 0 auto;
}
fieldset {
  margin-bottom: 0px;
  border-left: 0px;
  border-right: 0px;
  border-bottom: 0px;
  border-top: 1px solid #cccccc;
}
fieldset legend {
  text-align: left;
  padding-right: 10px;
}
label {
  margin-right: 10px;
  max-width: 20%;
  min-width: 150px;
  display: inline-block;
  text-align: right;
}

label span {
  color: #00008a;
  font-weight: bold;
}
.required {
  font-size: 0.8em;
  margin-top: 5px;
}
.required span {
  color: #00008a;
  font-weight: bold;
}

.processTracker {
  background-color: white;
  border-radius: 10px;
  min-width: 600px;
  max-width: 50%;
  margin: 0 auto;
  padding: 10px 0px;
}
.processTracker p {
  margin: 0;
  white-space: pre-wrap;
}
.processTracker p span {
  display: inline-block;
  max-width: 80%;
  vertical-align: top;
}
.processTracker p img {
  margin-left: 10px;
}

.processTracker span > p {
  border: solid 1px red;
  display: block;
  max-width: 80%;
}

.processTracker + strong {
  margin-top: 10px;
  font-size: 1.2em;
}

.selectOptionExtractor {
  vertical-align: middle;
  color: rgba(0, 0, 0, 0.54);
  width: 300px;
  margin: 10px auto !important;
}
.selectOptionExtractor div {
  min-height: auto !important;
}

.ocrParameters {
  padding-left: 60px;
  text-align: left;
}

.ocrParameters legend {
  font-size: 0.8em;
}
.ocrParameters input {
  font-size: 0.8em;
  width: 230px;
  color: rgba(0, 0, 0, 0.87);
}
</style>
