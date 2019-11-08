<template functional>
  <g>
    <rect
      class="List"
      :id="'List_' + props.element.id"
      :key="props.element.id"
      :x="props.element.box.l"
      :y="props.element.box.t"
      :width="props.element.box.w"
      :height="props.element.box.h"
    />
    <component
      :is="props.components.ParagraphElement"
      v-for="element in props.element.content"
      :key="element.id"
      :element="element"
      :fonts="props.fonts"
      @custom-event="listeners['custom-event']"
    ></component>
  </g>
</template>

<script>
import ParagraphElement from '@/components/DocumentPreview/Paragraph';
import pageElementMixin from '@/mixins/pageElementMixin';

export default {
  props: {
    components: {
      type: Object,
      default() {
        return {
          ParagraphElement,
        };
      },
    },
  },
  mixins: [pageElementMixin],
};
</script>
