<template>
	<div class="PageInspector">
		<header>
			<h1>Inspect</h1>
		</header>
		<div class="PageInspectorContainer">
			<v-icon v-if="!selectedElement" size="40" color="#cccccc" style="margin-top:10px;"
				>mdi-selection-ellipse-arrow-inside</v-icon
			>
			<span v-if="!selectedElement" class="noSelection">Select a word to inspect properties</span>
			<ul v-if="selectedElement" class="elementProperties">
				<li><span>Type:</span> {{ selectedElement.type }}</li>
				<li><span>Id:</span> {{ selectedElement.id }}</li>
				<li>
					<span>Font:</span> {{ selectedElement.font }}
					<span>{{ fontInfo(selectedElement.font) }}</span>
				</li>
				<li><span>Content:</span> {{ selectedElement.content }}</li>
				<li>
					<span>Properties:</span>
					<ul>
						<li
							v-for="(option, index) in Object.keys(selectedElement.properties)"
							:key="'Item_' + index"
						>
							<span>{{ option }}:</span> {{ selectedElement.properties[option] }}
						</li>
					</ul>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		selectedElement: {
			type: Object,
			required: false,
		},
		fonts: {
			type: Array,
			required: false,
		},
	},
	methods: {
		fontInfo(fontId) {
			const font = this.fonts.filter(font => font.id === fontId).shift();
			if (font) {
				return '(' + font.name + ', ' + font.weight + ', size ' + font.size + ')';
			}
			return null;
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
.PageInspectorContainer span.noSelection {
	display: block;
	margin: 10px 20px;
}
.PageInspectorContainer .elementProperties {
	list-style-type: none;
	padding-left: 0;
	margin: 0;
}
.PageInspectorContainer .elementProperties li {
	text-align: left;
	border-bottom: solid 1px #ebebf1;
	padding: 8px 0 8px 8px;
}
.PageInspectorContainer .elementProperties li span {
	color: #6c6c6c;
}
.PageInspectorContainer .elementProperties li ul li {
	border: 0;
	padding: 0;
}
</style>
