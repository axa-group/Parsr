<template functional>
  <g>
    <image
      :href="props.apiURL + '/image/' + props.documentId + '/' + props.element.xObjId"
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
    apiURL: {
      type: String,
      required: true,
    },
  },
};
</script>
