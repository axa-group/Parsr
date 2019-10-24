<template>
	<div v-if="selectedElement" class="v-application v-application--is-ltr PageInspector">
		<v-expansion-panels v-model="wordHierarchySwitch">
			<v-expansion-panel>
				<v-expansion-panel-header>
					<header>
						<h1>Word hierarchy</h1>
					</header>
				</v-expansion-panel-header>
				<v-expansion-panel-content>
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
				</v-expansion-panel-content>
			</v-expansion-panel>
		</v-expansion-panels>
	</div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
	data() {
		return {
			wordHierachy: [],
			items: [],
			openItems: [],
			activeItem: [],
			lastParentSelected: null,
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
	},
	mounted() {
		if (this.selectedElement) {
			this.populateTreeView();
		}
		//});
	},
	watch: {
		selectedElement(element) {
			if (!element) {
				return;
			}
			this.populateTreeView();
		},
	},
	methods: {
		...mapMutations(['switchExpansionPanel']),
		capitalize(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		highlightSelectedElement(element) {
			const domElement = document.getElementById(this.capitalize(element.type) + '_' + element.id);
			if (domElement) {
				domElement.classList.add('highlighted');
			} else {
				console.log('No DOM for Highlight ' + this.capitalize(element.type));
			}
		},
		unHighlightSelectedElement(element) {
			const domElement = document.getElementById(this.capitalize(element.type) + '_' + element.id);
			if (domElement) {
				domElement.classList.remove('highlighted');
			} else {
				console.log('No DOM for Highlight ' + this.capitalize(element.type));
			}
		},
		onActiveUpdated(selection) {
			if (this.lastParentSelected) {
				this.unHighlightSelectedElement(this.lastParentSelected);
			}
			if (selection.length === 0) {
				this.$store.commit('setParentElementSelected', null);
				return;
			}
			const element = this.wordHierachy.filter(el => el.id === selection[0]).shift();
			if (element && element.id != this.selectedElement.id) {
				this.$store.commit('setParentElementSelected', element);
				this.lastParentSelected = element;
				this.highlightSelectedElement(element);
			} else {
				this.$store.commit('setParentElementSelected', null);
				this.lastParentSelected = null;
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
	},
	computed: {
		...mapGetters(['wordHierarchySwitchState']),
		wordHierarchySwitch: {
			get() {
				return this.wordHierarchySwitchState;
			},
			set(value) {
				this.switchExpansionPanel({ panel: 'wordHierarchy', value });
			},
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
	padding: 5px 0px;
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

div.v-expansion-panels div.v-expansion-panel {
	background-color: transparent;
}
div.v-expansion-panels div.v-expansion-panel:before {
	box-shadow: none;
}
div.v-expansion-panels button.v-expansion-panel-header {
	padding: 0;
	min-height: 0;
	color: rgba(0, 0, 0, 0.54);
	background-color: #ebebf1;
	border-radius: 0;
}

div.v-expansion-panels button.v-expansion-panel-header .v-icon {
	color: rgba(0, 0, 0, 0.24) !important;
}
</style>
<style lang="scss">
.PageInspector div.v-expansion-panels div.v-expansion-panel-content__wrap {
	padding: 0;
}
</style>
