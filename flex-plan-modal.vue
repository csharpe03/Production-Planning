<template>
  <form v-if="flexingPlan">
    <div v-if="loading">
      <div class="my-loading-container">
        {{ $tkey('LoadingPleaseWait') }}
      </div>
    </div>
    <div v-else class="my-content-container">
      <div
        v-for="flexItem in flexPlanModalParams.flexItems"
        :class="
          `${flexItem.allowEdit === 'y' ? 'allow-edit' : 'disable-edit'}
                    ${
                      nav.screenMode === 'phone'
                        ? 'edit-item-container-phone'
                        : 'edit-item-container-desktop'
                    }`
        "
        @click="updateFlexActive(flexItem)"
      >
        <input
          type="checkbox"
          class="my-checkbox"
          :checked="flexItem.flexActive === 'y'"
          :disabled="flexItem.allowEdit !== 'y'"
        />
        {{ flexItem.displayDate }}
      </div>
    </div>
  </form>
</template>

<style scoped lang="scss">
.my-loading-container {
  text-align: center;
  margin-top: 115px;
  margin-bottom: 110px;
}
.my-content-container {
  max-height: 60vh;
  overflow-y: auto;
}
.edit-item-container-desktop {
  padding: 5px 10px 5px 150px;
  border: 1px solid #f9f9f9;
}
.edit-item-container-phone {
  padding: 5px 10px 5px 70px;
  border: 1px solid #f9f9f9;
}
.allow-edit {
  cursor: pointer;
}
.allow-edit:hover {
  color: #2b68ff;
  background-color: aliceblue;
}
.disable-edit {
  opacity: 0.3;
}
.my-checkbox-with-label:hover {
}
.my-checkbox {
  transform: scale(1.5);
  margin-right: 10px;
}
</style>

<script src="./flex-plan-modal.js"></script>
