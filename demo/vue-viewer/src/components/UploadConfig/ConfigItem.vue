<template>
	<fieldset style="border:0px">
		<v-switch
			class="switch"
			color="indigo darken-3"
			v-model="isSelected"
			:hide-details="true"
			:label="itemKey"
			@change="switchChange"
		>
			<template v-if="itemHasOptions" v-slot:append>
				<v-expansion-panels>
					<v-expansion-panel>
						<v-expansion-panel-header>- Options</v-expansion-panel-header>
						<v-expansion-panel-content>
							<ul>
								<li v-for="(option, index) in Object.keys(itemOptions)" :key="'Item_' + index">
									<span v-if="params.defaultValues[option] == null" v-html="option" />
									<input
										v-if="params.defaultValues[option] == null"
										type="text"
										:value="itemOptions[option]"
										@change="optionChange(option, $event)"
									/>
									<v-select
										v-if="params.defaultValues[option]"
										:items="params.defaultValues[option]"
										v-model="itemOptions[option]"
										:flat="true"
										:hide-details="true"
										background-color="transparent"
										color="rgba(0, 0, 0, 0.54)"
										height="20px"
										class="selectOption"
										:prefix="option"
										solo
									>
									</v-select>
									<v-slider
										v-if="params.sliders[option]"
										:value="itemOptions[option] * params.sliders[option].multiplier"
										:max="params.sliders[option].max"
										:min="params.sliders[option].min"
										hide-details
										class="slider"
										@input="optionChangeSlider(option, $event)"
									>
									</v-slider>
								</li>
							</ul>
						</v-expansion-panel-content>
					</v-expansion-panel>
				</v-expansion-panels>
			</template>
		</v-switch>
		<v-btn
			icon
			text
			small
			color="transparent"
			target="_blank"
			:href="`https://github.com/axa-group/Parsr/blob/develop/docs/modules/${itemKey}-module.md`"
		>
			<v-icon size="20" color="#cccccc">mdi-information-outline</v-icon>
		</v-btn>
	</fieldset>
</template>

<script>
export default {
	data() {
		return {
			isSelected: this.model.includes(this.value),
		};
	},
	props: {
		model: {
			type: Array,
			required: true,
		},
		value: {
			type: [String, Array],
			required: true,
		},
		params: {
			type: Object,
		},
	},
	computed: {
		itemKey() {
			if (Array.isArray(this.value)) {
				return this.value[0];
			}
			return this.value;
		},
		itemOptions() {
			if (Array.isArray(this.value)) {
				return this.value[1];
			}
			return [];
		},
		itemHasOptions() {
			return Array.isArray(this.value);
		},
	},
	methods: {
		optionChange(item, event) {
			this.value[1][item] = event.target.value;
		},
		optionChangeSlider(item, value) {
			this.value[1][item] = (value / this.params.sliders[item].multiplier).toFixed(
				this.params.sliders[item].decimals,
			);
		},
		switchChange() {
			this.$emit('change', { selected: this.isSelected, item: this.value });
		},
	},
};
</script>

<style lang="scss">
.slider div.v-input__control {
	width: 100%;
}
.slider div.v-input__control div.v-slider--horizontal {
	margin: 0;
}
.selectOption div.v-input__control {
	min-height: auto !important;
}
.selectOption div.v-input__control div.v-input__slot {
	padding: 0 !important;
}
.selectOption div.v-input__control div.v-input__slot div.v-select__selection {
	border: solid 1px #cccccc;
	min-width: 60px;
	text-align: center;
	display: block;
}
.selectOption div.v-input__control div.v-input__slot input {
	width: 0;
}
.switch div.v-expansion-panels div.v-expansion-panel {
	background-color: transparent;
}
.switch div.v-expansion-panels div.v-expansion-panel:before {
	box-shadow: none;
}
.switch div.v-expansion-panels {
	margin-left: 40px;
	width: 273px;
}
.switch div.v-expansion-panels button.v-expansion-panel-header {
	padding: 0;
	min-height: 10px;
	font-size: 0.8em;
	color: rgba(0, 0, 0, 0.54);
}

.switch div.v-expansion-panels button.v-expansion-panel-header .v-icon {
	color: rgba(0, 0, 0, 0.24) !important;
}

.switch div.v-expansion-panels div.v-expansion-panel-content__wrap {
	padding-bottom: 0;
}
</style>
<style lang="scss" scoped>
.selectOption {
	font-size: 0.8em;
	vertical-align: middle;
	color: rgba(0, 0, 0, 0.54);
}
.selectOption div {
	min-height: auto !important;
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
}
.switch ul {
	margin-left: 0px;
	margin-top: 10px;
	padding: 0;
}
.switch ul li:not(:last-child) {
	margin-bottom: 5px;
}

.switch input {
	border: solid 1px #cccccc;
	width: 60px;
	font-size: 0.8em;
	vertical-align: middle;
	margin-left: 5px;
	text-align: center;
}
.switch + a {
	margin-top: 10px;
	display: inline-block;
}
</style>
