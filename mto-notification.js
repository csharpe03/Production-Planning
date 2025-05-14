import navigation from '../../../js/navigation';
import toolCommon from '../../../js/tool-common';

const parseURL = require('../../../js/parseURL');

export default {
  localizationKey: 'components._common.mto-notification',

  props: ['screen', 'plan', 'targetMtoPlan'],
  data: function() {
    return {
      nav: navigation,
    };
  },
  computed: {
    planCodeLocalized() {
      return this.targetMtoPlan
        ? this.$i18n.locale === 'es'
          ? this.targetMtoPlan.planCode_es
          : this.targetMtoPlan.planCode
        : null;
    },
  },
  methods: {
    goToPlan: function() {
      if (!this.targetMtoPlan) {
        return;
      }
      if (this.screen === 'viewer') {
        this.$parent.setMadeToOrderPlan(this.targetMtoPlan.planKey);
      } else {
        // to make sure that it goes to the POS plan and not what was previously viewed
        localStorage.removeItem('planKey');
        this.$parent.setMadeToOrderPlan(this.targetMtoPlan.planKey);
        parseURL.default.setURLFromParameters(
          'production-tasks',
          toolCommon.getStoreKey(),
          toolCommon.getDepartmentKey()
        );
      }
    },
  },
};
