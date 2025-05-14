import _ from 'lodash';

export default {
  meridianFormatTime(timeNum, meridian, locale, removeColonZeroes) {
    // Currently, timeNum is assumed to be a decimal representing time on a 24hr clock.
    if (timeNum > 24) {
      timeNum %= 24;
      // might want to add a day suffix
    }
    const hourNum = _.floor(timeNum);
    const minutesNum = _.round((timeNum % 1) * 60, 0); // eslint-disable-line no-extra-parens

    const hour = ((hourNum + 11) % 12) + 1;
    const minutes = minutesNum >= 10 ? minutesNum : `0${minutesNum}`;

    if (minutes !== '00') {
      removeColonZeroes = false;
    }

    if (locale === 'es') {
      const suffix =
        meridian === undefined || meridian === null || meridian === true
          ? hourNum >= 12
            ? 'pm'
            : 'am'
          : ''; // 'p. m.', 'a. m.' is the standard, but we are using our own shorter version
      return removeColonZeroes ? `${hour}\xa0${suffix}` : `${hour}:${minutes}\xa0${suffix}`;
    }
    // locale is 'en'
    const suffix =
      meridian === undefined || meridian === null || meridian === true
        ? hourNum >= 12
          ? 'PM'
          : 'AM'
        : '';
    return removeColonZeroes ? `${hour}\xa0${suffix}` : `${hour}:${minutes}\xa0${suffix}`;
  },
  meridianFormatTwoTimes(timeNum, otherTimeNum, meridian, locale, removeColonZeroes) {
    if (!otherTimeNum) {
      return this.meridianFormatTime(timeNum, meridian, locale, removeColonZeroes);
    }
    // Currently, timeNum is assumed to be a decimal representing time on a 24hr clock.
    if (timeNum > 24) {
      timeNum %= 24;
      // might want to add a day suffix
    }
    if (otherTimeNum > 24) {
      otherTimeNum %= 24;
      // might want to add a day suffix
    }
    const hourNumStart = _.floor(timeNum);
    const minutesNumStart = _.round((timeNum % 1) * 60, 0); // eslint-disable-line no-extra-parens

    const hourStart = ((hourNumStart + 11) % 12) + 1;
    const minutesStart = minutesNumStart >= 10 ? minutesNumStart : `0${minutesNumStart}`;

    const hourNumEnd = _.floor(otherTimeNum);
    const minutesNumEnd = _.round((otherTimeNum % 1) * 60, 0); // eslint-disable-line no-extra-parens

    const hourEnd = ((hourNumEnd + 11) % 12) + 1;
    const minutesEnd = minutesNumEnd >= 10 ? minutesNumEnd : `0${minutesNumEnd}`;

    let removeColonZeroesStart = removeColonZeroes;
    let removeColonZeroesEnd = removeColonZeroes;

    if (minutesStart !== '00') {
      removeColonZeroesStart = false;
    }
    if (minutesEnd !== '00') {
      removeColonZeroesEnd = false;
    }

    let suffixStart =
      meridian === undefined || meridian === true
        ? hourNumStart >= 12
          ? locale === 'es'
            ? 'pm'
            : 'PM'
          : locale === 'es'
          ? 'am'
          : 'AM'
        : ''; // 'p. m.', 'a. m.' is the standard, but we are using our own shorter version
    let suffixEnd =
      meridian === undefined || meridian === true
        ? hourNumEnd >= 12
          ? locale === 'es'
            ? 'pm'
            : 'PM'
          : locale === 'es'
          ? 'am'
          : 'AM'
        : ''; // 'p. m.', 'a. m.' is the standard, but we are using our own shorter version

    if (suffixStart === suffixEnd) {
      suffixStart = '';
    }
    if (suffixStart && (removeColonZeroesStart || removeColonZeroesEnd)) {
      suffixStart = `\xa0${suffixStart}`;
    }
    if (suffixEnd && (removeColonZeroesStart || removeColonZeroesEnd)) {
      suffixEnd = `\xa0${suffixEnd}`;
    }
    const textStart = removeColonZeroesStart
      ? `${hourStart}${suffixStart}`
      : `${hourStart}:${minutesStart}${suffixStart}`;
    const textEnd = removeColonZeroesEnd
      ? `${hourEnd}${suffixEnd}`
      : `${hourEnd}:${minutesEnd}${suffixEnd}`;
    // return textStart + '\xa0-\xa0' + textEnd;
    return `${textStart}-${textEnd}`;
  },
};
