<template>
	<component :is="elementComponent" :element="element" :fonts="fonts"></component>
</template>
<script>
import pageElementMixin from '@/mixins/pageElementMixin';

export default {
	mixins: [pageElementMixin],
};
</script>
