<template functional>
	<g>
		<rect
			:x="props.element.box.l"
			:y="props.element.box.t"
			:width="props.element.box.w"
			:height="props.element.box.h"
		/>
		<text
			:x="props.element.box.l"
			:y="props.element.box.t + props.element.box.h"
			fill="black"
			:textLength="props.element.box.w"
			:style="{
				fontSize: props.fonts.filter(font => font.id === props.element.font).shift().size * 0.6,
			}"
			:font-weight="fontWeight"
			>{{ props.element.content.trim() }}</text
		>
	</g>
</template>

<script>
import pageElementMixin from '@/mixins/pageElementMixin';

export default {
	mixins: [pageElementMixin],
	/*computed: {
		wordStyle() {
			console.log(this.props.element.font);
			const font = this.$store.getters.wordFont(this.props.element.font);
			if (font) {
				return 'font-size:' + font.size * 0.8 + 'px';
			}

			return 'font-size: 1em';
		},
		fontWeight() {
			console.log(this.props.element.font);
			const font = this.$store.getters.wordFont(this.props.element.font);
			if (font) {
				return font.weight;
			}

			return 'normal';
		},
	},*/
};
</script>
