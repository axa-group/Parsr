<template>
	<div class="main v-application v-application--is-ltr" v-if="!loadingConfig">
		<form @submit.prevent="upload">
			<fieldset>
				<legend>Input file</legend>
				<input type="file" id="file" name="file" @change="fileChanged($event)" style="margin:10px 0px" />
			</fieldset>

			<fieldset>
				<legend>Extractor configuration</legend>
				<v-select
					:items="['pdf2json', 'pdfminer']"
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
			</fieldset>

			<fieldset>
				<legend>Modules configuration</legend>
				<configItem
					v-for="(item, index) in defaultConfig.cleaner"
					:key="'Item_' + index"
					:model="customConfig.cleaner"
					:value="item"
					:params="moduleParams(item)"
					@change="configChange"
				/>
			</fieldset>

			<v-btn rounded class="submit" :disabled="isSubmitDisabled" @click="upload">SUBMIT</v-btn>
			<p class="required">
				<span>*</span> Required fields
			</p>
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
				<v-progress-circular v-if="loading" color="#00008a" indeterminate size="24"></v-progress-circular>
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
			return !this.file;
		},
		configAsBinary() {
			var data = this.encode(JSON.stringify({ ...this.defaultConfig, ...this.customConfig }));
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
			if (oldVal && !newVal) { //finished loading
				this.customConfig = { ...this.defaultConfig };
			}
		},
	},
	methods: {
		moduleParams(configItem) {
			if (Array.isArray(configItem)) {
				const moduleParams = {};
				let defaultValues = this.defaultValuesForModule(configItem);
				if (defaultValues != {}) moduleParams['defaultValues'] = defaultValues;
				let sliderValues = this.sliderValuesForModule(configItem);
				if (sliderValues != {}) moduleParams['sliders'] = sliderValues;
				return moduleParams;
			}
			return {};
		},
		sliderValuesForModule(module) {
			const sliders = {};
			Object.keys(module[1]).forEach(element => {
				switch (element) {
					case 'percentageOfRedundancy':
					case 'lineHeightUncertainty':
					case 'topUncertainty':
					case 'maxInterline':
						sliders[element] = { min: 0, max: 10, multiplier: 10, decimals: 1 };
						break;
					case 'minWidth':
					case 'maxMarginPercentage':
					case 'minColumnWidthInPagePercent':
					case 'minVerticalGapWidth':
					case 'maximumSpaceBetweenWords':
					case 'alignUncertainty':
						sliders[element] = { min: 0, max: 100, multiplier: 1, decimals: 0 };
						break;
					case 'tolerance':
						sliders[element] = { min: 0, max: 100, multiplier: 100, decimals: 2 };
						break;
				}
			});
			return sliders;
		},
		defaultValuesForModule(module) {
			const defaults = {};
			Object.keys(module[1]).forEach(element => {
				switch (element) {
					case 'flavor':
						defaults[element] = ['lattice', 'stream'];
						break;
					case 'addNewline':
					case 'checkFont':
					case 'mergeTableElements':
						defaults[element] = [true, false];
						break;
				}
			});
			return defaults;
		},
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
	width: 100px;
}
.selectOptionExtractor div.v-input__control div.v-select__slot div.v-text-field__prefix {
	min-width: 60px;
	text-align: left;
}
.selectOptionExtractor div.v-input__control div.v-input__slot div.v-select__selection {
	border: solid 1px #cccccc;
	min-width: 90px;
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
</style>
