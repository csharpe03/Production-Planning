<template>
  <form v-if="extendingPlan">
    <!--<div class="form-group">-->
    <!--<div class="form-check">-->
    <!--<h1 style="color: red;">DEAN BROWN</h1>-->
    <!--<h1 style="color: lime;">{{ extendingPlan.planKey }}</h1>-->
    <!--<h1 style="color: lime;">{{ extendingPlan.planName }}</h1>-->
    <!--<h1 style="color: lime;">{{ extendPlanReason }}</h1>-->
    <div style="margin-left: auto; text-align: left;">
      <span style="font-size: 1.1em; font-weight: bold;"
        >Original end time: {{ currentEndTimeText }}</span
      >
      <span v-if="loading"><i class="fa fa-spinner fa-spin"/></span>
    </div>
    <!--</div>-->
    <!--</div>-->
    <!--</div>-->
    <div class="form-group">
      <multiselect
        v-model="extendPlanTime"
        :options="extendPlanTimes"
        placeholder="Select New Time"
        :searchable="false"
        :close-on-select="true"
        :show-labels="false"
        label="timeDescription"
        track-by="timeId"
        @input="selectExtensionParameters"
      />
    </div>
    <div v-if="noRoomToExtend" class="form-group">
      <span style="color: red;">
        Plan cannot be extended since there is insufficient room between this plan and the next.
      </span>
    </div>

    <div class="form-group">
      <multiselect
        v-model="extendPlanReason"
        :options="reasons"
        placeholder="Select Reason"
        :searchable="false"
        :close-on-select="true"
        :show-labels="false"
        label="reasonDescription"
        track-by="reasonId"
        @input="selectExtensionParameters"
      />
    </div>
  </form>
</template>

<style scoped lang="scss">
// your scss rules go here. They are scoped to this particular component

p.lead {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.features-container {
  margin: 0 auto;
  ul {
    display: inline-block;
  }
}
</style>

<script src="./plan-extend-modal.js"></script>
