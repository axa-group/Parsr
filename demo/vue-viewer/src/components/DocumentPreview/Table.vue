<template functional>
	<g class="TableContainer">
		<component
			:is="props.components.TableRow"
			v-for="element in props.element.content"
			:key="element.id"
			:element="element"
			:fonts="props.fonts"
			@custom-event="listeners['custom-event']"
		></component>
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
