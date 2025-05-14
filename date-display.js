import { computed } from 'vue';

// https://www.w3schools.com/jsref/jsref_tolocalestring.asp
export default {
  props: ['date', 'locale'],
  data() {
    return {};
  },
  filters: {
    formatDate(date, locale) {
      const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      };
      const d = new Date(date);
      return d.toLocaleDateString(`${locale}-US`, options).replace(/,/g, '');
    },
  },
  computed: {
    formatDateShort(date, locale) {
      const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      };
      const d = new Date(date);
      return d.toLocaleDateString(`${locale}-US`, options).replace(/,/g, '');
    },
  },
};
