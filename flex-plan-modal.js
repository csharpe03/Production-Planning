import navigation from '@/js/navigation';

import toolCommon from '@/js/tool-common';
import _ from 'lodash';
import SleepService from '../../../services/SleepService';
import jsonLog from '../../../js/jsonLog';
import { initI18n } from '@/js/vue-i18n';
import moment from 'moment/moment';

import FlexScheduleService from '../../../services/FlexScheduleService';

export default {
  localizationKey: 'components._common.flex-plan-modal',
  props: ['flexingPlan', 'date', 'flexPlanModalParams'],
  data() {
    return {
      nav: navigation,
      loading: true,
    };
  },
  methods: {
    async load() {
      this.flexPlanModalParams.flexItems = await FlexScheduleService.load(
        this.$http,
        this.flexingPlan.planKey,
        this.date
      );
      this.flexPlanModalParams.okTitle = this.$t('components._common.flex-plan-modal.Save');
    },
    updateFlexActive(flexItem) {
      if (this.flexPlanModalParams.saving) {
        // Ignore clicks on the clickable div.
        return;
      }
      if (flexItem.allowEdit !== 'y') {
        return;
      }
      flexItem.flexActive = flexItem.flexActive === 'y' ? 'n' : 'y';
    },
  },
  async created() {
    console.log(`flex-plan-modal created called`);
    this.loading = true;
    await this.load();
    this.loading = false;
  },
};
