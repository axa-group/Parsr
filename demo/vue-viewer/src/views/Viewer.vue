<template>
	<div class="main viewer">
		<thumbnails
			v-if="documentFetched"
			:title="inputFileName"
			:totalPages="documentPages"
			:selectedPage="selectedPage"
		/>
		<docPreview
			v-if="documentFetched"
			:document="document"
			:selectedPage="selectedPage"
			:zoom="zoom"
			:class="{
				VisibleWords: isWordFilter,
				VisibleLines: isLineFilter,
				VisibleParagraphs: isParagraphFilter,
				VisibleHeadings: isHeadingFilter,
				VisibleTables: isTableFilter,
				VisibleLists: isListFilter,
			}"
		/>
		<div style="border-left: solid 1px #ebebf1;">
			<pageInspector v-if="documentFetched" :filters="inspectorFilters" />
			<fontInspector v-if="documentFetched" />
			<ElementSelector
				v-if="documentFetched"
				:pageElements="document.pages[selectedPage - 1].elements"
			/>
			<elementInspector
				v-if="documentFetched"
				:selectedElement="selectedElement"
				:selectedParentElement="selectedParentElement"
				:fonts="document.fonts"
			/>
			<wordHierarchy
				v-if="documentFetched"
				:selectedElement="selectedElement"
				:pageElements="document.pages[selectedPage - 1].elements"
			/>
		</div>
	</div>
</template>

<script>
import Thumbnails from '@/components/Thumbnails';
import PageInspector from '@/components/PageInspector';
import WordHierarchy from '@/components/WordHierarchy';
import ElementInspector from '@/components/ElementInspector';
import ElementSelector from '@/components/ElementSelector';
import FontInspector from '@/components/FontInspector';
import DocPreview from '@/components/DocumentPreview';
import { docComputed } from '../vuex/helpers.js';
import { mapState } from 'vuex';

export default {
	components: {
		Thumbnails,
		PageInspector,
		DocPreview,
		WordHierarchy,
		ElementInspector,
		ElementSelector,
		FontInspector,
	},
	computed: {
		documentFetched() {
			return this.document != null;
		},
		...mapState({
			inputFileName: state => state.inputFileName,
			document: state => state.document,
			selectedPage: state => state.selectedPage,
			zoom: state => state.zoom,
			inspectorFilters: state => state.inspectorFilters,
			selectedElement: state => state.selectedElement,
			selectedParentElement: state => state.selectedParentElement,
		}),
		...docComputed,
		isWordFilter() {
			return this.inspectorFilters.words;
		},
		isLineFilter() {
			return this.inspectorFilters.lines;
		},
		isParagraphFilter() {
			return this.inspectorFilters.paragraphs;
		},
		isHeadingFilter() {
			return this.inspectorFilters.headings;
		},
		isTableFilter() {
			return this.inspectorFilters.tables;
		},
		isListFilter() {
			return this.inspectorFilters.lists;
		},
	},
	mounted() {
		if (!this.documentFetched) {
			this.$store.dispatch('fetchDocument').catch(error => {
				console.log(error.message);
			});
		}
	},
};
</script>

<style lang="scss" scoped>
.viewer {
	display: grid;
	grid-template-columns: minmax(200px, 20%) auto minmax(200px, 20%);
	height: calc(100vh - 72px);
}
</style>
