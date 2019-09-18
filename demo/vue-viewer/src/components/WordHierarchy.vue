<template>
	<div v-if="selectedElement" class="PageInspector">
		<header>
			<h1>Word hierarchy</h1>
		</header>
		<div class="PageInspectorContainer">
			<v-treeview
				v-if="selectedElement"
				:items="items"
				:open="openItems"
				:active="activeItem"
				:dense="true"
				:transition="true"
				style="text-align:left"
				:open-all="true"
				activatable
				color="f9f9fd"
				@update:active="onActiveUpdated"
			>
				<!--template v-slot:label="{ item, active }">
					<span>{{ item.name }}</span>
					<v-icon v-if="active" size="20" style="margin-left:10px" title="Inspected">
						mdi-crosshairs
					</v-icon>
				</template-->
			</v-treeview>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			wordHierachy: [],
			items: [],
			openItems: [],
			activeItem: [],
		};
	},
	props: {
		pageElements: {
			type: Array,
			required: false,
		},
		selectedElement: {
			type: Object,
			required: false,
		},
		fonts: {
			type: Array,
			required: false,
		},
	},
	mounted() {
		console.log('Mounted');
		console.log(this.selectedElement);
		if (this.selectedElement) {
			this.populateTreeView();
		}
	},
	watch: {
		selectedElement(element) {
			if (!element) {
				return;
			}
			console.log('SELECTED ELEMENT');
			console.log(element);
			this.populateTreeView();
		},
	},
	methods: {
		onActiveUpdated(selection) {
			if (selection.length === 0) {
				this.$store.commit('setParentElementSelected', null);
				return;
			}
			const element = this.wordHierachy.filter(el => el.id === selection[0]).shift();
			if (element) {
				this.$store.commit('setParentElementSelected', element);
			}
		},
		populateTreeView() {
			const hierachy = { parents: [this.selectedElement] };
			this.parentElement(this.selectedElement.id, this.pageElements, hierachy);
			if (hierachy.parents.length > 0) {
				this.wordHierachy = hierachy.parents.reverse();

				const itemsObject = this.wordHierachy.map(el => {
					return { id: el.id, key: el.id, name: el.type, children: [] };
				});
				itemsObject.forEach((el, index) => {
					if (index + 1 < itemsObject.length) {
						el.children = [itemsObject[index + 1]];
						if (index === 0) this.items = [el];
					} else {
						this.activeItem.push(el.id);
					}
					this.openItems.push(el.id);
				});
			}
		},
		parentElement(childId, elements, hierachy) {
			const parent = elements
				.filter(el => {
					if (Array.isArray(el.content)) {
						const child = el.content.filter(child => child.id === childId).shift();
						if (child) return true;
						else {
							return this.parentElement(childId, el.content, hierachy);
						}
					}
				})
				.shift();

			if (parent) {
				hierachy.parents.push(parent);
				return true;
			} else {
				return false;
			}
		},
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
