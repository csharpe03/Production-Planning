import _ from 'lodash';

export default {
  props: {
    defaults: {
      type: Object,
      default: () => {},
    },
    marketKey: 0,
    brandName: '',
    showIndividualStores: true,
  },

  data() {
    return {
      stores: [],
      filters: _.merge({}, this.defaults),
      allSelected: true,
      indeterminate: false,
    };
  },

  watch: {
    filters: {
      deep: true,
      handler: _.debounce(function() {
        this.$emit('filtersUpdated', _.merge({}, this.filters));
      }, 500),
    },

    marketKey() {
      this.loadStores();
    },

    /* filters.selectedStores: function (newVal, oldVal) {
      // Handle changes in individual store checkboxes
      if (newVal.length === 0) {
        this.indeterminate = false;
        this.allSelected = false
      } else if (newVal.length === this.stores.length) {
        this.indeterminate = false;
        this.allSelected = true;
      } else {
        this.indeterminate = true;
        this.allSelected = false;
      }
    } */
  },

  created() {
    this.loadStores();
  },

  methods: {
    loadStores() {
      const params = {
        marketKey: this.marketKey,
      };
      this.$http.get('/api/store/for-user-brand-specific-select-list', { params }).then(res => {
        this.stores = res.data;
        _.each(this.stores, o => {
          o.text = o.name;
          o.value = o.id;
        });
        // set them all to true as defaults
        this.filters.selectedStores = _.map(this.stores, o => {
          return o.id;
        });
      });
    },

    toggleAll(checked) {
      this.filters.selectedStores = checked
        ? _.map(this.stores, o => {
            return o.id;
          })
        : [];
    },
  },
};
