<template>
	<div class="next-prev">
		<v-btn
			light
			icon
			x-small
			:elevation="3"
			:disabled="!hasPreviousElement"
			@click="selectPrevElementOfSameType"
		>
			<v-icon size="20">mdi-chevron-left</v-icon>
		</v-btn>
		<v-btn
			light
			icon
			x-small
			:elevation="3"
			:disabled="!hasNextElement"
			@click="selectNextElementOfSameType"
		>
			<v-icon size="20">mdi-chevron-right</v-icon>
		</v-btn>
	</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
	props: {
		element: {
			type: Object,
			required: true,
			default: () => ({}),
		},
	},
	computed: {
		...mapGetters(['currentPageElements']),
		hasPreviousElement() {
			return this.elementIndex > 0;
		},
		hasNextElement() {
			return this.allOfType.length > this.elementIndex + 1;
		},
		elementIndex() {
			return this.allOfType.findIndex(e => e.id === this.element.id);
		},
		allOfType() {
			const allOfType = this.getAllElementsOfType(this.element.type);
			allOfType.sort(this.sortFunction);
			return allOfType;
		},
	},
	methods: {
		...mapMutations(['setElementSelected']),
		capitalize(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		buildID(element) {
			return this.capitalize(element.type).concat('_', element.id);
		},
		setElement(element) {
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
		sortFunction(a, b) {
			return a.properties.order - b.properties.order;
		},
		selectPrevElementOfSameType() {
			this.setElement(this.allOfType[this.elementIndex - 1]);
		},
		selectNextElementOfSameType() {
			this.setElement(this.allOfType[this.elementIndex + 1]);
		},
		getAllElementsOfType(type) {
			const all = [];

			function recursiveSearch(element) {
				if (element.type === type) {
					all.push(element);
				} else if (Array.isArray(element.content)) {
					return element.content.map(recursiveSearch);
				}
			}
			this.currentPageElements.forEach(recursiveSearch);
			return all;
		},
	},
};
</script>
<style>
.next-prev button {
	margin-right: 10px;
}
</style>
