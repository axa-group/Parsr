<template functional>
	<g class="TableContainer">
		<component
			:is="props.components.TableRow"
			v-for="element in props.element.content"
			:key="element.id"
			:element="element"
			:fonts="props.fonts"
		></component>
		<rect
			class="Table"
			:key="props.element.id"
			:x="props.element.box.l"
			:y="props.element.box.t"
			:width="props.element.box.w"
			:height="props.element.box.h"
		/>
	</g>
</template>

<script>
import TableRow from '@/components/DocumentPreview/TableRow';
import pageElementMixin from '@/mixins/pageElementMixin';

export default {
	props: {
		components: {
			type: Object,
			default() {
				return {
					TableRow,
				};
			},
		},
	},
	mixins: [pageElementMixin],
};
</script>
