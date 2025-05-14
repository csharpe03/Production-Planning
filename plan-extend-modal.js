// const prettyUtils = require('@/js/prettyTime');

import prettyUtils from '@/js/prettyTime';
import navigation from '@/js/navigation';

import toolCommon from '@/js/tool-common';
import _ from 'lodash';

export default {
  props: ['extendingPlan', 'reasons'],
  data() {
    return {
      nav: navigation,
      message: {},
      currentEndTimeText: '',
      extendPlanReason: null,
      extendPlanTimes: [],
      extendPlanTime: null,
      noRoomToExtend: false,
      nextNonCancelledPlan: null,
      loading: false,
      maxPlanExtension: 21,
    };
  },
  methods: {
    // async extendPlan() {
    //   alert('extend plan now: ' + this.extendPlan ? this.extendPlan.planKey : 'missing plan');
    // }
    selectExtensionParameters() {
      console.log(
        `selectExtensionParameters called: ${
          this.extendPlanReason ? this.extendPlanReason.reasonId : 'null'
        }`
      );
      this.$root.$emit('set-extend-plan-params', {
        extendPlanReason: this.extendPlanReason ? this.extendPlanReason.reasonId : null,
        extendPlanTime: this.extendPlanTime ? this.extendPlanTime.timeId : null,
      });
    },
    createTimeDropdown(hour) {
      return {
        timeDescription: prettyUtils.prettyTime(hour),
        timeId: hour,
      };
    },
    async loadAllPlans() {
      // Code stolen from plan-dashboard.js!
      const currentDate = toolCommon.getCurrentDateFromDayOffSet(0);
      const storeKey = this.nav.storeKey;
      const departmentId = this.nav.departmentId;
      const params = {
        storeKey,
        departmentId,
        locale: this.nav.locale,
        dateFilter: currentDate,
        handheld: this.nav.screenMode === 'phone' ? 1 : 0,
      };
      const paramsForCancellation = {
        marketKey: this.nav.marketKey,
        storeKey,
        dateOfCancellation: currentDate,
      };

      const resTask = this.$http.get('/api/production-task-item/summary-for-a-store-department', {
        params,
      });
      const reallocationResTask = this.$http.get('/api/plan-cancel', {
        params: paramsForCancellation,
      });
      const res = await resTask;
      const reallocationRes = await reallocationResTask;

      let items = res.data;

      // filter out the ones that are not disaplayed on the dashboard
      items = _.filter(items, { isDisplayedOnDashboard: 'y' });

      // Set the cancelled flag (separate table and api):
      items.map(item => {
        // Filter out the cancelled plans.
        const matchingCancelledPlans = reallocationRes.data.filter(c => {
          return c.cancelledPlanKey === item.planKey;
        });
        item.isCancelled = matchingCancelledPlans.length > 0;
      });

      // Set the group names, which makes them vertical in the dashboard:
      _.each(items, function(obj) {
        obj.planNameForGrouping = obj.planCode.replace(/[0-9]/g, '');
      });

      // Find the cuurent plan in the items context:
      const myPlan = items.find(item => {
        return item.planKey === this.extendingPlan.planKey;
      });

      const plansBelow = items
        .filter(item => {
          return item !== myPlan && item.planNameForGrouping === myPlan.planNameForGrouping;
        })
        .filter(item => {
          return item.startTime > myPlan.startTime;
        });
      const plansNotCancelledBelow = plansBelow.filter(item => {
        return !item.isCancelled;
      });
      const ordered = _.orderBy(plansNotCancelledBelow, 'startTime');
      this.nextNonCancelledPlan = ordered.length > 0 ? ordered[0] : null;

      if (myPlan.maxPlanExtension) {
        if (myPlan.maxPlanExtension >= 0 && myPlan.maxPlanExtension <= 24) {
          this.maxPlanExtension = myPlan.maxPlanExtension;
        } else {
          this.maxPlanExtension = 24;
        }
      }

      console.log('Plans below my one: ');
      console.log(JSON.parse(JSON.stringify(plansBelow)));
    },
  },
  async created() {
    this.loading = true;
    await this.loadAllPlans();
    this.loading = false;
    console.log('extend plan modal created called');
    const plan = this.extendingPlan; // For brevity
    const isMultiPlan = plan.isMultiplePerDay === 'y';
    const currentEndTime = Math.ceil(Number(plan.endTime)); // e.g. 12
    this.extendPlanTimes = [];
    this.noRoomToExtend = false;

    // For multi plans, only allow 1 or 2 hour extensions if there is room between the plan and the next one.
    // If there is at least a 2 hour gap, allow 1 or 2 hr extensions.
    // If there is only a 1 hour gap, only allow 1 hour extension.
    // If the plan is the LAST one in the column, then allow it to go to 9pm, so don't use this logic here.
    if (isMultiPlan && this.nextNonCancelledPlan) {
      // see if we allow 1 hour extensions:
      let allowHour_1 = true;
      let allowHour_2 = true;
      if (this.nextNonCancelledPlan) {
        const nextStartTime = Math.ceil(Number(this.nextNonCancelledPlan.startTime));
        if (currentEndTime + 1 > nextStartTime) {
          allowHour_1 = false;
        }
        if (currentEndTime + 2 > nextStartTime) {
          allowHour_2 = false;
        }
      }
      if (allowHour_1) {
        this.extendPlanTimes.push(this.createTimeDropdown(currentEndTime + 1));
      }
      if (allowHour_2) {
        this.extendPlanTimes.push(this.createTimeDropdown(currentEndTime + 2));
      }
      if (!allowHour_1 && !allowHour_2) {
        this.noRoomToExtend = true; // Show a message that there is no room to extend between this plan and the next (non-cancelled) plan.
      }
    } else {
      for (let t = currentEndTime + 1; t <= this.maxPlanExtension; ++t) {
        // For regular plans, extend up to configured column config.marketDepartment.maxPlanExtension
        this.extendPlanTimes.push(this.createTimeDropdown(t));
      }
    }
    this.currentEndTimeText = prettyUtils.prettyTime(Math.ceil(Number(currentEndTime)));

    console.log(`isMultiPlan = ${isMultiPlan}`);
    console.log(`extendPlanTimes = ${JSON.stringify(this.extendPlanTimes)}`);
  },
};
