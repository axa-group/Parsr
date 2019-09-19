<template functional>
	<g>
		<rect
			:id="'Table-cell_' + props.element.id"
			class="TableCell"
			:key="props.element.id"
			:x="props.element.box.l"
			:y="props.element.box.t"
			:width="props.element.box.w"
			:height="props.element.box.h"
		/>
		<component
			:is="props.components.Paragraph"
			v-for="element in props.element.content"
			:key="element.id"
			:element="element"
			:fonts="props.fonts"
			@custom-event="listeners['custom-event']"
		></component>
	</g>
</template>

<script>
import pageElementMixin from '@/mixins/pageElementMixin';
import Paragraph from '@/components/DocumentPreview/Paragraph';

export default {
	props: {
		components: {
			type: Object,
			default() {
				return {
					Paragraph,
				};
			},
		},
	},
	mixins: [pageElementMixin],
};
</script>
