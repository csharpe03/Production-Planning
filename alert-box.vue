<template>
  <!-- Component template content goes here -->
  <div class="card-body">
    <div class="row">
      <div class="col-sm-3">
        <i class="fa fa-wrench fa-3x" style="color: red;" />
      </div>
      <div class="col-sm-6">
        <h6 style="text-align: center">
          {{ message }}
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
</style>

<script src="./alert-box.js"></script>
