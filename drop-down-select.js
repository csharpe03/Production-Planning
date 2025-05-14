module.exports = {
  data() {
    return {
      selected: '',
    };
  },

  props: [
    'typeOfSelection', // the first help item at the top of the selection - chose this or that
    'idForTypeOfSelection',
    'items', // the array of objects, the key would be the selected value, and the display could show the name
    'idInUse', // the default selected key
    'viewOnly',
  ],

  created() {
    this.selected = this.idInUse;

    /* this.items = [
      { id: 1, code: 'Bunny', name: 'Rabbit'},
      { id: 2, code: 'Kiddie', name: 'Goat'},
      { id: 3, code: 'Kitty', name: 'Cat'},
      { id: 4, code: 'Puppy', name: 'Dog'}
    ]; */
  },

  methods: {
    onChange() {
      this.$emit('input', this.selected);
    },
  },

  watch: {
    idInUse() {
      this.selected = this.idInUse;
    },
  },
};
