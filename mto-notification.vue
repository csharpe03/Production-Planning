<template>
  <div>
    <div v-if="nav.screenMode === 'normal'">
      <div class="card-body py-2">
        <div class="row">
          <div class="col-sm-3">
            <img class="globe" src="../../../img/blue globe.png" />
          </div>
          <div class="col-sm-6">
            <h4 style="text-align: center; color: #007aff">
              {{ $tkey('mtoNotificationMessage', { planName: planCodeLocalized }) }}
            </h4>
          </div>
          <div class="col-sm-3" style="text-align: right">
            <button class="btn btn-secondary" @click="goToPlan()">{{ $tkey('goToPlan') }}</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="nav.screenMode === 'phone'" style="padding: 0.5em; padding-left: 1.5em;">
      <div style="text-align: center; color: #007aff;">
        <img
          class="globe"
          src="../../../img/blue globe.png"
          style="height: 1.5em; position: relative; top: -5px;"
        />
        <span>{{ $tkey('mtoNotificationMessage', { planName: planCodeLocalized }) }}</span>
      </div>
      <div style="text-align: center; padding-top: 0.5em;">
        <button class="btn btn-secondary btn-sm" @click="goToPlan()">
          {{ $tkey('goToPlan') }}
        </button>
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
.mto-container {
  width: 100%;
}
.globe {
  height: 1.7rem;
  padding-bottom: inherit;
}
</style>

<script src="./mto-notification.js"></script>
