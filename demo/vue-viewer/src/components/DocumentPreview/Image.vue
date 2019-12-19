<template functional>
  <g>
    <image
      :href="'http://localhost:3001/api/v1/image/' + props.documentId + '/' + props.element.xObjId"
      :x="props.element.box.l"
      :y="props.element.box.t"
      :width="props.element.box.w"
      :height="props.element.box.h"
    />
    <text
      fill="fucsia"
      style="font-size:2em"
      :textLength="props.element.box.w"
      lengthAdjust="spacingAndGlyphs"
      :x="props.element.box.l"
      :y="props.element.box.t + props.element.box.h / 2"
    >
      {{ props.element.refId }} / {{ props.element.xObjId }}
    </text>
  </g>
</template>

<script>
import pageElementMixin from '@/mixins/pageElementMixin';

export default {
  mixins: [pageElementMixin],
  props: {
    documentId: {
      type: String,
      required: true,
    },
  },
};
</script>
