<template>
	<div class="main viewer">
		<div v-for="(csv, index) in documentCsvs" :key="index">
			<span class="tableIndex">- Table {{ index + 1 }}</span>
			<pre class="text">{{ csv }}</pre>
		</div>
		<div v-if="noTablesDetected" class="tableEmpty">There are no tables to export as CSV</div>
		<v-overlay :absolute="false" opacity="0.5" :value="this.loading || this.error" :dark="false">
			<div class="overlayContent">
				<div v-if="error" class="errorMessage">
					<p style="text-align:center;">
						<strong style="font-size:1em;">Error</strong
						><v-icon size="20" color="red" style="margin-left:10px">mdi-alert-circle</v-icon>
					</p>
					<p style="text-align: left; padding: 0 20px;">
						{{ error }}
					</p>
					<v-btn v-if="error" rounded class="submit" @click="closeOverlay">CLOSE</v-btn>
				</div>
				<v-progress-circular
					v-if="loading && !error"
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
	data() {
		return { error: null, errorThrown: false };
	},
	computed: {
		documentCsvsFetched() {
			return this.documentCsvs.length > 0;
		},
		uploadedDocument() {
			return this.documentId !== null;
		},
		noTablesDetected() {
			return (
				this.uploadedDocument &&
				this.documentCsvs.length === 0 &&
				!this.loading &&
				!this.errorThrown
			);
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
				this.errorThrown = true;
				this.error = error.response.data;
			});
		}
	},
	methods: {
		closeOverlay() {
			this.error = null;
		},
	},
};
</script>

<style lang="scss" scoped>
.overlayContent {
	background-color: white;
	border-radius: 10px;
	min-width: 600px;
	max-width: 50%;
	margin: 0 auto;
	padding: 10px 0px;
}

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
.errorMessage {
	padding: 0 10px;
	font-size: 0.9em;
}
.submit {
	margin-top: 10px;
	background-color: #00008a !important;
	color: #ffffff !important;
}
</style>
