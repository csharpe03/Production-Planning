// Sets the cursor focus on an input field when inserted into the DOM
export default function init(Vue){
  // Register a global custom directive called v-focus
  Vue.directive('focus', {
    inserted: function (el) {
      // Focus the element
      el.focus()
    },
  })
};
