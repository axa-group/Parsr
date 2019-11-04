//import lazyLoadComponent from '@/utils/lazy-Load-Components.js';
//import WordSkeleton from '@/components/DocumentPreview/PageSkeleton';
// import Word from '@/components/DocumentPreview/Word';
// import LineElement from '@/components/DocumentPreview/Line';
// import Paragraph from '@/components/DocumentPreview/Paragraph';
export default {
  props: {
    element: {
      type: Object,
      required: true,
    },
    fonts: {
      type: Array,
      required: false,
    },
  },
  components: {
    /*Word: lazyLoadComponent({
			componentFactory: () => import('../components/DocumentPreview/Word.vue'),
			loading: WordSkeleton,
        }),*/
    Word: () => import('../components/DocumentPreview/Word.vue'),
    Paragraph: () => import('../components/DocumentPreview/Paragraph.vue'),
    LineElement: () => import('../components/DocumentPreview/Line.vue'),
  },
  computed: {
    trace() {
      console.log('trace');
      return;
    },
    elementComponent() {
      if (this.element.type === 'paragraph') {
        return 'Paragraph';
      } else if (this.element.type === 'line') {
        return 'LineElement';
      } else if (this.element.type === 'word') {
        return 'Word';
      } else {
        //console.log('UNKNOWN TYPE ' + this.element.type + ' ID ' + this.element.id);
        return 'Paragraph';
      }
    },
  },
};
