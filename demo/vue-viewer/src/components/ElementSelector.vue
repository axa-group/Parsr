<template>
	<div class="v-application v-application--is-ltr ElementSelector">
		<v-expansion-panels v-model="elementSelectorSwitch">
			<v-expansion-panel>
				<v-expansion-panel-header>
					<header>
						<h1>Element Selector</h1>
					</header>
				</v-expansion-panel-header>
				<v-expansion-panel-content>
					<div class="ElementSelectorContainer">
						<v-autocomplete
							label="Element Type with ID"
							:clearable="true"
							color="#00008a"
							:auto-select-first="true"
							:items="items"
							:value="selectedElement"
							@change="selectedElementEvent"
						/>
					</div>
				</v-expansion-panel-content>
			</v-expansion-panel>
		</v-expansion-panels>
	</div>
</template>
<script>
import { mapMutations, mapState, mapGetters } from 'vuex';
export default {
	props: {
		pageElements: {
			type: Array,
			required: false,
		},
	},
	methods: {
		...mapMutations(['setElementSelected', 'switchExpansionPanel']),
		selectedElementEvent(element) {
			// removes all other highlighted elements when this selector is used
			const highlightedElements = document.getElementsByClassName('highlighted');
			Array.from(highlightedElements || []).forEach(element => {
				element.classList.remove('highlighted');
			});

			if (element) {
				document.getElementById(this.buildID(element)).classList.add('highlighted');
			}

			this.setElementSelected(element);
		},
		capitalize(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		buildID(element) {
			return this.capitalize(element.type).concat('_', element.id);
		},
		flatten(element) {
			var flattend = [];
			!(function flat(element, buildID) {
				flattend.push({ text: buildID(element), value: element });
				element.content.forEach(function(el) {
					flattend.push({ text: buildID(el), value: el });
					if (Array.isArray(el.content)) {
						flat(el, buildID);
					}
				});
			})(element, this.buildID);
			return flattend;
		},
		sortFunction({ value: elementA }, { value: elementB }) {
			if (elementA.type === elementB.type) {
				return elementA.id - elementB.id;
			} else {
				return elementA.type.localeCompare(elementB.type);
			}
		},
	},
	computed: {
		...mapState(['selectedElement']),
		...mapGetters(['elementSelectorSwitchState']),
		elementSelectorSwitch: {
			get() {
				return this.elementSelectorSwitchState;
			},
			set(value) {
				this.switchExpansionPanel({ panel: 'elementSelector', value });
			},
		},
		items() {
			return this.pageElements
				.map(this.flatten)
				.reduce((prev, curr) => prev.concat(curr), [])
				.sort(this.sortFunction);
		},
	},
};
</script>
<style lang="scss" scoped>
.ElementSelector {
	text-align: center;
	display: block;
}
.ElementSelectorContainer {
	padding-left: 10px;
}
.ElementSelector header {
	background-color: #ebebf1;
	color: #2c3034;
	text-align: left;
	padding: 5px 0px;
}
.ElementSelector header h1 {
	font-size: 1em;
	padding: 0.5em;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	max-width: 70%;
	display: inline-block;
	vertical-align: middle;
}

div.v-expansion-panels div.v-expansion-panel {
	background-color: transparent;
}
div.v-expansion-panels div.v-expansion-panel:before {
	box-shadow: none;
}
div.v-expansion-panels button.v-expansion-panel-header {
	padding: 0;
	min-height: 0;
	color: rgba(0, 0, 0, 0.54);
	background-color: #ebebf1;
	border-radius: 0;
}
</style>
<style lang="scss">
.ElementSelector div.v-expansion-panels div.v-expansion-panel-content__wrap {
	padding: 0;
}
</style>
