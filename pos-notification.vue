<template>
  <div>
    <div v-if="nav.screenMode === 'normal'">
      <!-- plan: {{plan}} screen: {{screen}} prev: {{nav.previousLowInvCount}} / curr: {{nav.currentLowInvCount}} / pings: {{nav.lowInvPingCount}}-->
      <div class="card-body">
        <div class="row">
          <div class="col-sm-3">
            <i class="fa fa-exclamation-triangle fa-2x" style="color: red;" />
          </div>
          <div class="col-sm-6">
            <h4 style="text-align: center; color: red">{{ message }}</h4>
          </div>
          <div class="col-sm-3" style="text-align: right">
            <button class="btn btn-secondary" @click="goToPlan()">Go To Plan</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="nav.screenMode === 'phone'" style="padding: 0.5em; padding-left: 1.5em;">
      <div style="text-align: center; color: red;">
        <i class="fa fa-exclamation-triangle" style="font-size: 1.5em;" />
        <span>{{ message }}</span>
      </div>
      <div style="text-align: center; padding-top: 0.5em;">
        <button class="btn btn-secondary btn-sm" @click="goToPlan()">Go To Plan</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// your scss rules go here. They are scoped to this particular component

@media screen and (max-width: 1024px) {
  .long-date {
    display: none;
  }
}
@media screen and (min-width: 1025px) {
  .short-date {
    display: none;
  }
}
.low-inventory-container {
  width: 100%;
}
</style>

<script src="./pos-notification.js"></script>
