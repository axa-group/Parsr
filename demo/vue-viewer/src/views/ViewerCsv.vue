<template>
	<div class="main viewer">
		<div v-for="(csv, index) in documentCsvs" :key="index">
			<span class="tableIndex">- Table {{ index + 1 }}</span>
			<pre class="text">{{ csv }}</pre>
		</div>
		<div v-if="noTablesDetected" class="tableEmpty">There are no tables to export as CSV</div>
		<v-overlay :absolute="false" opacity="0.5" :value="this.loading" :dark="false">
			<div class="overlayContent">
				<v-progress-circular
					v-if="loading"
					color="#00008a"
					indeterminate
					size="24"
				></v-progress-circular>
			</div>
		</v-overlay>
	</div>
</template>
<script>
import { mapState } from 'vuex';

export default {
	computed: {
		documentCsvsFetched() {
			return this.documentCsvs.length > 0;
		},
		uploadedDocument() {
			return this.documentId !== null;
		},
		noTablesDetected() {
			return this.uploadedDocument && this.documentCsvs.length === 0 && !this.loading;
		},
		...mapState({
			documentId: state => state.uuid,
			documentCsvs: state => state.outputs.csv.csvs,
			loading: state => state.outputs.csv.loading,
		}),
	},
	mounted() {
		if (!this.documentCsvsFetched && this.uploadedDocument) {
			this.$store.dispatch('fetchDocumentCsvList').catch(error => {
				console.log(error.message);
			});
		}
	},
};
</script>

<style lang="scss" scoped>
.viewer {
	background-color: #f9f9fd;
}
.tableIndex {
	display: block;
	margin: 20px 20px 0px 20px;
	text-align: left;
	font-weight: bold;
}
.tableEmpty {
	margin: 20px;
	font-weight: bold;
}
.text {
	margin: 20px;
	background-color: white;
	border: 1px solid rgb(204, 204, 231);
	padding: 16px;
	// word wrap
	white-space: pre-wrap;
	white-space: -moz-pre-wrap;
	white-space: -pre-wrap;
	white-space: -o-pre-wrap;
	word-wrap: break-word;
	text-align: left;
}
</style>
