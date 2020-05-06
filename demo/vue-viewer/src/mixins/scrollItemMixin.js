export default {
  methods: {
    onAppear(divID, completionHandler, threshold = 0.8) {
      var observer = new IntersectionObserver(
        entries => {
          if (entries[0].intersectionRatio > 0) {
            onAppearHandler();
          }
        },
        { threshold: [threshold] },
      );
      const onAppearHandler = () => {
        observer.disconnect();
        if (completionHandler) completionHandler();
      };
      observer.observe(document.querySelector('#' + divID));
    },
  },
};
