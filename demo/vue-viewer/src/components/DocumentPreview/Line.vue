<template functional>
	<g>
		<line
			:id="'Line_' + props.element.id"
			:x1="props.element.box.l"
			:y1="props.element.box.t + props.element.box.h"
			:x2="props.element.box.l + props.element.box.w"
			:y2="props.element.box.t + props.element.box.h"
		/>
		<component
			:is="props.components.Word"
			v-for="element in props.element.content.filter(el => el.type === 'word')"
			:key="element.id"
			:element="element"
			:fonts="props.fonts"
			@custom-event="listeners['custom-event']"
		></component>
	</g>
</template>

<script>
import pageElementMixin from '@/mixins/pageElementMixin';
import Word from '@/components/DocumentPreview/Word';

export default {
	props: {
		components: {
			type: Object,
			default() {
				return {
					Word,
				};
			},
		},
	},
	mixins: [pageElementMixin],
};
</script>
