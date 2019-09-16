<template functional>
	<g>
		<component
			:is="props.components.TableCell"
			v-for="element in props.element.content"
			:key="element.id"
			:element="element"
			:fonts="props.fonts"
		></component>
		<line
			class="TableRow"
			:x1="props.element.box.l"
			:y1="props.element.box.t + props.element.box.h"
			:x2="props.element.box.l + props.element.box.w"
			:y2="props.element.box.t + props.element.box.h"
		/>
	</g>
</template>

<script>
import pageElementMixin from '@/mixins/pageElementMixin';
import TableCell from '@/components/DocumentPreview/TableCell';

export default {
	props: {
		components: {
			type: Object,
			default() {
				return {
					TableCell,
				};
			},
		},
	},
	mixins: [pageElementMixin],
};
</script>
