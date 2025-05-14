module.exports = {
  props: {
    message: '', // Problem with some set of data or other, go and fix it
    linkTo: '',
  },
  data() {
    return {};
  },
  methods: {
    acknowledgeWarning() {
      this.$emit('warningAcknowledged');
    },
    goToLink() {
      this.$router.push({ path: this.linkTo });
    },
  },
};
