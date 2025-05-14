module.exports = {
  props: {
    message: '', // The Tool server will undergo monthly maintenance and will not be accessible on Saturday, July 14th, from 1-8PM EDT.  Please plan ahead accordingly.
  },
  data() {
    return {};
  },
  methods: {
    acknowledgeWarning() {
      this.$emit('warningAcknowledged');
    },
  },
};
