<template>
  <!-- Component template content goes here -->
  <div class="card-body">
    <div class="row">
      <div class="col-sm-3">
        <i class="fa fa-exclamation-triangle fa-2x" style="color: red;" />
      </div>
      <div class="col-sm-6">
        <h6 style="text-align: center">
          {{ message }} Click
          <span @click="goToLink"> here </span>
          to adjust these items.
        </h6>
      </div>
      <div class="col-sm-3" style="text-align: right">
        <button class="btn btn-secondary" @click="acknowledgeWarning">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../../../style/base/_variables.scss';
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

span {
  cursor: pointer;
  color: $tool-blue-bright;
}
</style>

<script src="./alert-box-link.js"></script>
