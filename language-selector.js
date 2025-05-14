import { loadLanguageAsync } from '../../../js/vue-i18n';

import toolCommon from '@/js/tool-common';

export default {
  localizationKey: 'components._common.language-selector',

  // Pass in the nav objects so that this component can update its nav.locale property. This is the only place where this proerty can be set.
  // An alternative syntax would be to import the nav object and make it a member. These are the same thing as there is only on nav object,
  // which is included by reference in all components that use it.
  props: ['nav'],
  data() {
    return {
      locales: ['en', 'es'],
    };
  },
  computed: {
    currentLocale() {
      return this.$i18n.locale;
    },
  },
  methods: {
    pulseNow() {
      toolCommon.pulse();
    },
    onSetLocale(locale) {
      toolCommon.pulse();
      localStorage.setItem(this.nav.userLocaleLocalStorageKey, locale);
      toolCommon.setLocale(locale);
      this.nav.locale = locale;
      loadLanguageAsync(locale);
      this.$root.$emit('localeChanged', locale);
    },
  },
};
