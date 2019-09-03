<template>
	<component :is="elementComponent" :element="element"></component>
</template>
<script>
import pageElementMixin from '@/mixins/pageElementMixin';

export default {
	mixins: [pageElementMixin],
};
</script>
