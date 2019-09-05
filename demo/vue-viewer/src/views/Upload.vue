<template>
	<div class="main v-application v-application--is-ltr">
		<form @submit.prevent="upload">
			<fieldset>
				<label for="file">Input file <span class="required">*</span></label>
				<input
					type="file"
					id="file"
					name="file"
					accept="application/pdf"
					@change="fileChanged($event)"
				/>
			</fieldset>
			<fieldset>
				<label for="config">Modules config</label>
				<input
					type="file"
					id="config"
					name="config"
					accept="application/json"
					@change="configChanged($event)"
				/>
			</fieldset>
			<!-- fieldset>
				<div>
					<v-switch
						v-model="customConfig.cleaner"
						value="out-of-page-removal"
						label="Out of page removal"
						class="switch"
						color="indigo darken-3"
						:hide-details="true"
					></v-switch>
					<a
						href="https://github.com/axa-group/Parsr/blob/develop/docs/modules/out-of-page-removal-module.md"
						target="_blank"
						><img :src="infoIcon"
					/></a>
				</div>
				<div>
					<v-switch
						v-model="customConfig.cleaner"
						value="whitespace-removal"
						label="White space removal"
						class="switch"
						color="indigo darken-3"
						:hide-details="true"
					></v-switch
					><a
						href="https://github.com/axa-group/Parsr/blob/develop/docs/modules/whitespace-removal-module.md"
						target="_blank"
						><img :src="infoIcon"
					/></a>
				</div>
				<div>
					<v-switch
						v-model="customConfig.cleaner"
						value="redundancy-detection"
						label="Redundancy detection"
						class="switch"
						color="indigo darken-3"
						:hide-details="true"
					></v-switch
					><a
						href="https://github.com/axa-group/Parsr/blob/develop/docs/modules/redundancy-detection-module.md"
						target="_blank"
						><img :src="infoIcon"
					/></a>
				</div>
				<div>
					<v-switch
						v-model="customConfig.cleaner"
						value="reading-order-detection"
						label="Reading order detection"
						class="switch"
						color="indigo darken-3"
						:hide-details="true"
					></v-switch
					><a
						href="https://github.com/axa-group/Parsr/blob/develop/docs/modules/reading-order-detection-module.md"
						target="_blank"
						><img :src="infoIcon"
					/></a>
				</div>
				<div>
					<v-switch
						v-model="customConfig.cleaner"
						value="link-detection"
						label="Link detection"
						class="switch"
						color="indigo darken-3"
						:hide-details="true"
					></v-switch
					><a
						href="https://github.com/axa-group/Parsr/blob/develop/docs/modules/link-detection-module.md"
						target="_blank"
						><img :src="infoIcon"
					/></a>
				</div>
				<div>
					<v-switch
						v-model="customConfig.cleaner"
						value="words-to-line"
						label="Words to line"
						class="switch"
						color="indigo darken-3"
						:hide-details="true"
					>
						<template v-slot:append>
							<span>Max. space between words</span>
							<input type="text" value="100" />
						</template> </v-switch
					><a
						href="https://github.com/axa-group/Parsr/blob/develop/docs/modules/words-to-line-module.md"
						target="_blank"
						><img :src="infoIcon"
					/></a>
				</div>
				<div>
					<v-switch
						v-model="customConfig.cleaner"
						value="lines-to-paragraph"
						label="Lines to paragraph"
						class="switch"
						color="indigo darken-3"
						:hide-details="true"
					></v-switch
					><a
						href="https://github.com/axa-group/Parsr/blob/develop/docs/modules/lines-to-paragraph-module.md"
						target="_blank"
						><img :src="infoIcon"
					/></a>
				</div>
				<div>
					<v-switch
						v-model="customConfig.cleaner"
						value="heading-detection"
						label="Heading detection"
						class="switch"
						color="indigo darken-3"
						:hide-details="true"
					></v-switch
					><a
						href="https://github.com/axa-group/Parsr/blob/develop/docs/modules/heading-detection-module.md"
						target="_blank"
						><img :src="infoIcon"
					/></a>
				</div>
				<div>
					<v-switch
						v-model="customConfig.cleaner"
						value="header-footer-detection"
						label="Header/Footer detection"
						class="switch"
						color="indigo darken-3"
						:hide-details="true"
					>
						<template v-slot:append>
							<span>Max. margin percentage</span>
							<input type="text" value="15" />
						</template> </v-switch
					><a
						href="https://github.com/axa-group/Parsr/blob/develop/docs/modules/header-footer-detection-module.md"
						target="_blank"
						><img :src="infoIcon"
					/></a>
				</div>
				<div>
					<v-switch
						v-model="customConfig.cleaner"
						value="hierarchy-detection"
						label="Hierarchy detection"
						class="switch"
						color="indigo darken-3"
						:hide-details="true"
					></v-switch
					><a
						href="https://github.com/axa-group/Parsr/blob/develop/docs/modules/hierarchy-detection-module.md"
						target="_blank"
						><img :src="infoIcon"
					/></a>
				</div>
			</fieldset -->
			<v-btn rounded class="submit" :loading="loading" :disabled="isSubmitDisabled" @click="upload"
				>SUBMIT</v-btn
			>
			<p class="required"><span>*</span> Required fields</p>
		</form>
		<div v-if="processStatus.length > 0" class="processTracker">
			<p v-for="status in processStatus" :key="status">
				<span v-html="status" /> <img :src="checkIcon" />
			</p>
		</div>
		<strong v-if="processStatusCompleted">Process completed</strong>
	</div>
</template>
<script>
import InfoIcon from '@/assets/info.png';
import CheckIcon from '@/assets/check.png';
import { mapState } from 'vuex';
import { setInterval, clearInterval, setTimeout } from 'timers';
export default {
	data() {
		return {
			infoIcon: InfoIcon,
			checkIcon: CheckIcon,
			file: null,
			loading: false,
			uploadConfig: null,
			processStatus: [],
			processStatusCompleted: false,
			config: {
				version: 0.5,
				extractor: {
					pdf: 'pdf2json',
					img: 'tesseract',
					language: ['eng', 'fra'],
				},
				cleaner: [
					'out-of-page-removal',
					'whitespace-removal',
					'redundancy-detection',
					['table-detection', { pages: 'all', flavor: 'lattice' }],
					['header-footer-detection', { maxMarginPercentage: 15 }],
					['reading-order-detection', { minColumnWidthInPagePercent: 15 }],
					'link-detection',
					['words-to-line', { maximumSpaceBetweenWords: 100 }],
					'lines-to-paragraph',
					['page-number-detection', { maxMarginPercentage: 15 }],
					'heading-detection',
					'hierarchy-detection',
				],
				output: {
					granularity: 'word',
					includeMarginals: false,
					formats: {
						json: true,
						text: true,
						csv: true,
						markdown: true,
						pdf: false,
					},
				},
			},
		};
	},

	/*watch: {
		customCleaner() {
			console.log('Change');
			console.log({ ...this.config, ...this.customConfig });
		},
	},*/
	computed: {
		...mapState({
			customConfig: state => state.customConfig,
		}),
		isSubmitDisabled() {
			return !this.file || !this.config;
		},
		configAsBinary() {
			//var data = this.encode(JSON.stringify({ ...this.config, ...this.customConfig }));
			var data = this.encode(JSON.stringify(this.config));
			return new Blob([data], {
				type: 'application/json',
			});
		},
		/*customCleaner() {
			return this.customConfig.cleaner.slice();
		},*/
	},
	methods: {
		fileChanged(event) {
			this.file = event.target.files[0];
		},
		configChanged(event) {
			this.uploadConfig = event.target.files[0];
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
						console.log(error.message);
						this.loading = false;
					});
			}, 1000);
		},
		upload() {
			this.loading = true;
			this.$store
				.dispatch('postDocument', {
					file: this.file,
					configuration: this.uploadConfig ? this.uploadConfig : this.configAsBinary,
				})
				.then(() => {
					this.processStatus = ['Upload Completed'];
					//this.loading = false;
					this.trackPipeStatus();
				})
				.catch(error => {
					console.log(error.message);
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
	},
};
</script>
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
	margin-bottom: 10px;
	border: 0px;
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
.switch {
	border-bottom: 1px solid #ebebf1;
	margin: 0;
	padding: 10px;
	display: inline-block;
	vertical-align: top;
	width: 300px;
}

.switch span {
	font-size: 0.8em;
	vertical-align: middle;
	color: rgba(0, 0, 0, 0.54);
	margin-top: 3px;
	margin-left: 38px;
}
.switch input {
	border: solid 1px #cccccc;
	width: 40px;
	font-size: 0.8em;
	vertical-align: middle;
	margin-left: 5px;
	text-align: center;
}
.switch + a {
	margin-top: 10px;
	display: inline-block;
}

.processTracker {
	border-top: 1px solid #cccccc;
	border-bottom: 1px solid #cccccc;
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
</style>
