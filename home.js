import navigation from '../../js/navigation';

import _ from 'lodash';

export default {
  localizationKey: 'components.home',
  data() {
    return {
      nav: navigation,
      createdCalled: false,
      toolUpdates: null,
      toolUpdateTitle: '',
      toolUpdateDetails: null,
      hasWarning: false,
      maintenanceMessage: '',
      hasProductsWarning: false,
      productsErrorMessage: '',
      contentHidden: '',
      content: '',
      contentOrig: '',
      contentEditing: '',
      showContentEditor: false,
      loadingContent: true,
      savingContent: false,
      customToolbar: [
        // [{ 'font': [] }],
        [{ header: [false, 1, 2, 3, 4, 5, 6] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
        [{ header: 1 }, { header: 2 }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        ['link'],
        // ['link', 'image', 'video', 'formula'],
        // [{ 'direction': 'rtl' }],
        // ['clean'],
      ],
    };
  },

  created() {
    this.createdCalled = true;

    this.$http.get('/api/maintenance').then(res => {
      const maintenanceDate = res.data;
      if (
        maintenanceDate !== null &&
        maintenanceDate.length > 0 &&
        maintenanceDate[0].dateOfMaintenance.length > 9
      ) {
        const dateOfMaintenanceStr = maintenanceDate[0].dateOfMaintenance.substr(0, 10); // dateOfMaintenance comes in as a string 2018-08-07T00:00..., so only taking the first 10 characters
        const dateOfMaintenance = _.split(dateOfMaintenanceStr, '-');
        const domYear = dateOfMaintenance[0];
        const domMonth = dateOfMaintenance[1];
        const domDay = dateOfMaintenance[2];
        // convert it back to a date
        const domDate = new Date(domYear, domMonth - 1, domDay);
        const today = new Date();
        // Take the difference between the dates and divide by milliseconds per day
        const diff = (domDate - today) / (1000 * 60 * 60 * 24);

        if (diff >= -1 && diff < 5) {
          // if the day is the same day, the difference turns out < 0 because of the current time of day, so really want up to 5 days
          this.hasWarning = true;
          this.maintenanceMessage = maintenanceDate[0].message;
        }
      }
    });
  },

  methods: {
    closeNavCollapse() {
      // https://stackoverflow.com/questions/62016170/bootstrap-vue-navbar-doesnt-uncollapse-in-mobile-when-a-button-is-clicked-on-th
      if (this.nav.isCollapseOpen) {
        this.$root.$emit('bv::toggle::collapse', 'primary-nav-collapse');
      }
    },
    gotoViewerClick() {
      this.closeNavCollapse();
      window.location = '/#/production-tasks';
    },
    gotoViewerWithDepartmentClick(department) {
      this.nav.departmentId = department.departmentId;
      this.nav.departmentCode = department.departmentCode;
      this.closeNavCollapse();
      window.location = '/#/production-tasks';
    },
    showContentEditorClick() {
      this.contentEditing = this.content;
      this.contentOrig = this.content;
      this.showContentEditor = true;
    },
    async saveContentClick() {
      if (confirm('Save changes now?')) {
        // Save contentEditing now to db.
        this.savingContent = true;
        const params = {
          marketKey: this.nav.marketKey,
          text: this.contentEditing,
        };
        const res = await this.$http.post('/api/tool-updates-html/', params);
        this.savingContent = false;
        this.content = this.contentEditing;
        this.contentOrig = '';
        this.contentEditing = '';
        this.showContentEditor = false;
      }
    },
    cancelContentClick() {
      this.content = this.contentOrig;
      this.contentOrig = '';
      this.contentEditing = '';
      this.showContentEditor = false;
    },

    loadData() {
      this.loadProductErrorsCount();
      const params = {
        marketKey: this.nav.marketKey,
      };

      this.loadingContent = true;
      this.$http.get('api/tool-updates-html', { params }).then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.content = res.data[0].message;
          this.loadingContent = false;
        }
      });
    },

    loadProductErrorsCount() {
      if (this.nav.role !== 'CM') {
        return;
      }
      // only load and show errors if the user is a CM
      const params = {
        departmentKey: this.nav.departmentId,
        marketKey: this.nav.marketKey,
      };
      return this.$http.get('/api/product/count-of-errors', { params }).then(res => {
        const productsErrorCountList = res.data;
        const productsInError =
          productsErrorCountList.length > 0
            ? _.sumBy(productsErrorCountList, 'productsInError')
            : 0;
        this.productsErrorMessage =
          productsInError > 0 ? 'One or more products need to be assigned to a product group.' : '';
        this.hasProductsWarning = productsInError > 0;
      });
    },
  },
  watch: {
    loadKey() {
      if (this.loadKey) {
        this.loadData();
      }
    },
  },
  computed: {
    role() {
      return this.nav.role;
    },
    allowEditContent() {
      return this.nav.role === 'ADMIN';
    },
    contentOpen() {},
    contentChanged() {
      return this.content !== this.contentOrig;
    },
    heroUnit() {
      let heroUnit = 'hero-unit-other';

      if (!this.nav) {
        return heroUnit;
      }

      switch (this.nav.marketKey) {
        case 10:
        case 20:
        case 40:
          heroUnit = `hero-unit-${this.nav.marketKey}`;
          break;
      }

      return heroUnit;
    },
    loadKey() {
      if (
        this.nav.marketKey === null ||
        this.nav.departmentId === null ||
        this.createdCalled === false
      ) {
        return null;
      }
      return `market=${String(this.nav.marketKey)}, dept=${String(
        this.nav.departmentId
      )}, createdCalled=${this.createdCalled}`;
    },
    locale() {
      return this.nav.locale;
    },
  },
};
