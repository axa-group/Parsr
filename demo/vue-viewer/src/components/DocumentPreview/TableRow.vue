<template functional>
  <g>
    <rect
      :id="'Table-row_' + props.element.id"
      class="TableRow"
      :x="props.element.box.l"
      :y="props.element.box.t"
      :width="props.element.box.w"
      :height="props.element.box.h"
    />
    <component
      :is="props.components.TableCell"
      v-for="element in props.element.content"
      :key="element.id"
      :element="element"
      :fonts="props.fonts"
      @custom-event="listeners['custom-event']"
    ></component>
    <!--line
			class="TableRow"
			:x1="props.element.box.l"
			:y1="props.element.box.t + props.element.box.h"
			:x2="props.element.box.l + props.element.box.w"
			:y2="props.element.box.t + props.element.box.h"
		/-->
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
