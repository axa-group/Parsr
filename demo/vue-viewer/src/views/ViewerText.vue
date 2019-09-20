<template>
	<div class="main viewer">
		<pre class='text'>{{ documentText }}</pre>
	</div>
</template>
<script>
import { mapState } from 'vuex';

export default {
	computed: {
		documentTextFetched() {
			return this.documentText != null;
		},
		...mapState({
			inputFileName: state => state.inputFileName,
			documentText: state => state.documentText,
		}),
	},
	mounted() {
		if (!this.documentTextFetched) {
			this.documentText = this.$store.dispatch('fetchDocumentText').catch(error => {
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
	margin: 62px;
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
