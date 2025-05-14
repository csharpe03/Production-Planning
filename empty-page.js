import navigation from '@/js/navigation';

import _ from 'lodash';
const moment = require('moment');
import toolCommon from '@/js/tool-common';

//////////////////////////////////////////////////
///////////////////// NOTE ///////////////////////
//////////////////////////////////////////////////

// Add a file in the client project routes folder
// which states the permissions and who can see
// this page.

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

export default {
  data() {
    return {
      nav: navigation,
      createdCalled: false,
      loaded: false,
    };
  },
  computed: {
    loadKey() {
      const status = `dept=${String(this.nav.departmentId)}, market=${
        this.nav.marketKey
      }, createdCalled=${this.createdCalled}`;
      if (
        this.nav.departmentId === null ||
        this.nav.marketKey === null ||
        this.createdCalled === false
      ) {
        console.log(`* Empty screen: loadKey NOT ready: ${status}`);
        return null;
      }
      console.log(`* Empty screen: loadKey ready: ${status}`);
      return status;
    },
    loadData() {
      console.log('Load Data called');
    },
  },
  watch: {
    loadKey() {
      if (this.loadKey) {
        this.loadData();
      }
    },
  },
  created() {
    this.createdCalled = true;
  },
  methods: {
    async loadData() {
      this.loaded = false;
      this.loaded = true;
    },
  },
};
