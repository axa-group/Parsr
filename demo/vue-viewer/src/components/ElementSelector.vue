<template>
	<div class="v-application v-application--is-ltr ElementSelector">
		<v-expansion-panels :value="0">
			<v-expansion-panel>
				<v-expansion-panel-header>
					<header>
						<h1>Element Selector</h1>
					</header>
				</v-expansion-panel-header>
				<v-expansion-panel-content>
					<div class="ElementSelectorContainer">
						<v-autocomplete
							label="Element"
							:clearable="true"
							:auto-select-first="true"
							:items="items"
							@change="selectedElement"
						/>
					</div>
				</v-expansion-panel-content>
			</v-expansion-panel>
		</v-expansion-panels>
	</div>
</template>
<script>
import { mapMutations } from 'vuex';
export default {
	data: () => ({
		lastSelectedElement: null,
	}),
	props: {
		pageElements: {
			type: Array,
			required: false,
		},
	},
	methods: {
		...mapMutations(['setElementSelected']),
		selectedElement(element) {
			if (this.lastSelectedElement) {
				document
					.getElementById(this.buildID(this.lastSelectedElement))
					.classList.remove('highlighted');
			}

			if (element) {
				document.getElementById(this.buildID(element)).classList.add('highlighted');
			}
			this.lastSelectedElement = element;
			this.setElementSelected(element);
		},
		capitalize(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		buildID(element) {
			return this.capitalize(element.type).concat('_', element.id);
		},
		contentMapper(element) {
			if (Array.isArray(element.content)) {
				return [
					...element.content.map(this.contentMapper),
					{ text: this.buildID(element), value: element },
				];
			} else {
				return [{ text: this.buildID(element), value: element }];
			}
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
		items() {
			return this.pageElements
				.map(this.contentMapper)
				.flat(3)
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
.ElementSelectorContainerv {
	padding: 0 10px;
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
