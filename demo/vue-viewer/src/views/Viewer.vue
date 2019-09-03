<template>
	<div class="main viewer">
		<thumbnails
			v-if="documentFetched"
			title="Title.pdf"
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
			}"
		/>
		<pageInspector v-if="documentFetched" :filters="inspectorFilters" />
	</div>
</template>

<script>
import Thumbnails from '@/components/Thumbnails';
import PageInspector from '@/components/PageInspector';
import DocPreview from '@/components/DocumentPreview';
import { docComputed } from '../vuex/helpers.js';
import { mapState } from 'vuex';

export default {
	components: { Thumbnails, PageInspector, DocPreview },
	computed: {
		documentFetched() {
			return this.document != null;
		},
		...mapState({
			document: state => state.document,
			selectedPage: state => state.selectedPage,
			zoom: state => state.zoom,
			inspectorFilters: state => state.inspectorFilters,
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
