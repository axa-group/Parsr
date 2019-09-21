<template>
	<div class="main viewer">
		<v-tabs
			v-if="documentMarkdownFetched"
			class="markdownTabs"
			color="#00008a"
			background-color="#f9f9fd"
			centered
		>
			<v-tab>Code</v-tab>
			<v-tab>Render</v-tab>

			<v-tab-item class="tabItem">
				<pre class="text">{{ documentMarkdown }}</pre>
			</v-tab-item>
			<v-tab-item class="tabItem">
				<vueMarkdown class="text">{{ documentMarkdown }}</vueMarkdown>
			</v-tab-item>
		</v-tabs>

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
import VueMarkdown from 'vue-markdown';

export default {
	components: { VueMarkdown },
	computed: {
		uploadedDocument() {
			return this.documentId !== null;
		},
		documentMarkdownFetched() {
			return this.documentMarkdown !== null;
		},
		...mapState({
			documentId: state => state.uuid,
			documentMarkdown: state => state.outputs.markdown.code,
			loading: state => state.outputs.markdown.loading,
		}),
	},
	mounted() {
		if (!this.documentMarkdownFetched && this.uploadedDocument) {
			this.$store.dispatch('fetchDocumentMarkdown').catch(error => {
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

.text {
	margin: 0 20px;
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
.overlayContent {
	background-color: white;
	border-radius: 10px;
	min-width: 600px;
	max-width: 50%;
	margin: 0 auto;
	padding: 10px 0px;
}
.markdownTabs {
	margin: 0px;
	background-color: transparent;
}
.tabItem {
	background-color: #f9f9fd !important;
}
</style>
