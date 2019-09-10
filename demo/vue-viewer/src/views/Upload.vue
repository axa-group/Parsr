<template>
	<div class="main v-application v-application--is-ltr">
		<form @submit.prevent="upload">
			<fieldset>
				<legend>Input file</legend>
				<input
					type="file"
					id="file"
					name="file"
					accept="application/pdf"
					@change="fileChanged($event)"
					style="margin:10px 0px"
				/>
			</fieldset>

			<fieldset>
				<legend>Modules configuration</legend>
				<configItem
					v-for="(item, index) in defaultConfig.cleaner"
					:key="'Item_' + index"
					:model="customConfig.cleaner"
					:value="item"
					:defaultValues="defaultValues(item)"
					@change="configChange"
				/>
			</fieldset>

			<v-btn rounded class="submit" :disabled="isSubmitDisabled" @click="upload">SUBMIT</v-btn>
			<p class="required"><span>*</span> Required fields</p>
		</form>

		<v-overlay :absolute="false" opacity="0.5" :value="processStatus.length > 0" :dark="false">
			<div v-if="processStatus.length > 0" class="processTracker">
				<p v-for="status in processStatus" :key="status">
					<span v-html="status" /> <img :src="checkIcon" />
				</p>
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
			loading: false,
			processStatus: [],
			processStatusCompleted: false,
			customConfig: null,
		};
	},
	components: { ConfigItem },
	computed: {
		...mapState({
			defaultConfig: state => state.defaultConfig,
		}),
		isSubmitDisabled() {
			return !this.file;
		},
		configAsBinary() {
			var data = this.encode(JSON.stringify({ ...this.defaultConfig, ...this.customConfig }));
			return new Blob([data], {
				type: 'application/json',
			});
		},
	},
	beforeMount() {
		this.customConfig = { ...this.defaultConfig };
	},
	methods: {
		defaultValues(configItem) {
			if (Array.isArray(configItem)) {
				console.log('IS Array');
				console.log(configItem);
				return this.defaultValuesForModule(Object.keys(configItem[1]));
			}
			return null;
		},
		defaultValuesForModule(moduleParam) {
			console.log('Module');
			console.log(moduleParam);
			const defaults = {};
			moduleParam.forEach(element => {
				switch (element) {
					case 'flavor':
						defaults[element] = ['lattice', 'stream'];
						break;
					case 'addNewline':
					case 'checkFont':
						defaults[element] = [true, false];
						break;
				}
			});
			return defaults;
		},
		configChange(configItem) {
			if (configItem.selected) {
				this.customConfig.cleaner.push(configItem.item);
			} else {
				this.customConfig.cleaner = this.customConfig.cleaner.filter(el => el !== configItem.item);
			}
			//this.$store.commit('updateConfig', configItem);
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
					configuration: this.configAsBinary,
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
</style>
