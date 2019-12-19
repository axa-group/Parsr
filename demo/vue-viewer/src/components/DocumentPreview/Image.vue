<template functional>
  <g>
    <rect
      class="Image"
      :x="props.element.box.l"
      :y="props.element.box.t"
      :width="props.element.box.w"
      :height="props.element.box.h"
    />
    <text
      fill="white"
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
};
</script>
