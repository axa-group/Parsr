<template>
	<div class="v-application v-application--is-ltr PageInspector">
		<header>
			<h1>Visibility Filters</h1>
		</header>
		<div class="PageInspectorContainer">
			<v-switch
				v-model="wordsFilter"
				label="Words"
				class="switch"
				color="indigo darken-3"
				:hide-details="true"
				@change="swapFilters()"
			></v-switch>
			<v-switch
				v-model="linesFilter"
				label="Lines"
				class="switch"
				color="indigo darken-3"
				:hide-details="true"
				@change="swapFilters()"
			></v-switch>
			<v-switch
				v-model="paragraphsFilter"
				label="Paragraphs"
				class="switch"
				color="indigo darken-3"
				:hide-details="true"
				@change="swapFilters()"
			></v-switch>
			<v-switch
				v-model="tablesFilter"
				label="Tables (todo)"
				class="switch"
				color="indigo darken-3"
				:hide-details="true"
				@change="swapFilters()"
			></v-switch>
			<v-switch
				v-model="headingsFilter"
				label="Headings (todo)"
				class="switch"
				color="indigo darken-3"
				:hide-details="true"
				@change="swapFilters()"
			></v-switch>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			wordsFilter: this.filters.words,
			linesFilter: this.filters.lines,
			paragraphsFilter: this.filters.paragraphs,
			tablesFilter: this.filters.tables,
			headingsFilter: this.filters.headings,
		};
	},
	props: {
		filters: {
			type: Object,
			required: true,
		},
	},
	methods: {
		swapFilters() {
			const newFilters = {
				words: this.wordsFilter,
				lines: this.linesFilter,
				paragraphs: this.paragraphsFilter,
				tables: this.tablesFilter,
				headings: this.headingsFilter,
			};
			this.$store.commit('setInspectorFilters', newFilters);
		},
	},
};
</script>

<style lang="scss" scoped>
.PageInspector {
	text-align: center;
	display: block;
}
.PageInspector header {
	background-color: #ebebf1;
	color: #2c3034;
	text-align: left;
}
.PageInspector header h1 {
	font-size: 1em;
	padding: 0.5em;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	max-width: 70%;
	display: inline-block;
	vertical-align: middle;
}

.switch {
	border-bottom: 1px solid #ebebf1;
	margin: 0;
	padding: 10px;
}
</style>
