<template functional>
  <g>
    <image
      :href="'http://localhost:3001/api/v1/image/' + props.documentId + '/' + props.element.xObjId"
      :x="props.element.box.l"
      :y="props.element.box.t"
      :width="props.element.box.w"
      :height="props.element.box.h"
    />    
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
