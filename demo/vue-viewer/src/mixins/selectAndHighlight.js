import { mapMutations } from 'vuex';

export default {
  methods: {
    ...mapMutations(['setElementSelected']),
    capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    buildID(element) {
      return this.capitalize(element.type).concat('_', element.id);
    },
    selectAndHighlight(element) {
      // removes all other highlighted elements when this selector is used
      const highlightedElements = document.getElementsByClassName('highlighted');
      Array.from(highlightedElements || []).forEach(elem => {
        elem.classList.remove('highlighted');
      });

      if (element) {
        document.getElementById(this.buildID(element)).classList.add('highlighted');
      }

      this.setElementSelected(element);
    },
  },
};
