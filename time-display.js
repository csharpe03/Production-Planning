import formatter from './format-time';

export default {
  props: ['time', 'endTime', 'meridian', 'locale', 'removeColonZeroes', 'notBold', 'compress'],
  data() {
    return {};
  },
  computed: {
    formatTwoTimes(timeNum, otherTimeNum, meridian, locale, removeColonZeroes) {
      return formatter.meridianFormatTwoTimes(
        timeNum,
        otherTimeNum,
        meridian,
        locale,
        removeColonZeroes
      );
    },
    formatTime(timeNum, meridian, locale, removeColonZeroes) {
      return formatter.meridianFormatTime(timeNum, meridian, locale, removeColonZeroes);
    },
  },
};
