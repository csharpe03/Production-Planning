import navigation from '../../../js/navigation';

import toolCommon from '@/js/tool-common';
const parseURL = require('../../../js/parseURL');

export default {
  props: ['screen', 'plan'],

  data() {
    return {
      nav: navigation,
      message: 'Low inventory alert -- see new plan',
    };
  },
  methods: {
    goToPlan() {
      if (this.screen === 'viewer') {
        this.$parent.setLowInventoryPlan();
      } else {
        // to make sure that it goes to the POS plan and not what was previously viewed
        localStorage.removeItem('planKey');
        this.$parent.setLowInventoryPlan();
        this.$router.push({
          path: parseURL.setURLFromParameters(
            'production-tasks',
            toolCommon.getStoreKey(),
            toolCommon.getDepartmentKey()
          ),
        });
      }
    },
  },
};
