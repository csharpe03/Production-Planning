import navigation from '@/js/navigation';

import _ from 'lodash';

export default {
  localizationKey: 'components._common.recipe-modal',

  props: [
    'productToShowIngredients',
    'productToShowIngredientsTitle',
    'lastModifiedDateTimeDisplay',
    'recipeLink',
    'recipeContent',
    'params', // Contains modalMode, which can be changed by this modal (base vue props cannot be changed directly).
  ],
  data() {
    return {
      nav: navigation,
    };
  },
  methods: {
    setModalMode(modalMode) {
      this.params.modalMode = modalMode;
    },
    getValidUrl(link) {
      let url = link;
      if (url && url.length > 3) {
        const firstThreeLetters = url.slice(0, 3).toUpperCase();
        if (firstThreeLetters === 'WWW') {
          url = `https://${url}`;
        }
      }
      return url;
    },
    openRecipeLink(recipeLink) {
      const url = this.getValidUrl(recipeLink);
      console.log(`Opening: ${url}`);
      window.open(url, '_blank');
    },
  },
  computed: {
    modalMode() {
      return this.params.modalMode;
    },
    formatLowerCase(_unit) {
      return _unit.toLowerCase();
    },
    formatFraction(_decimal) {
      const roundedDecimal = _.round(_decimal, 2);
      return `${roundedDecimal}`;
    },
  },
};
