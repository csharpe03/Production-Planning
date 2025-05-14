<template>
  <div class="m-4">
    <form>
      <div>
        <label>Product:</label>
        <input
          v-model="filters.product"
          type="text"
          class="form-control"
          placeholder="Begin typing product description or code"
        />
      </div>
      <br />
      <div v-if="showIndividualStores === true">
        <b-form-group label="Stores:">
          <template slot="label">
            <div>Stores:</div>
            <b-form-checkbox
              v-model="allSelected"
              :indeterminate="indeterminate"
              aria-describedby="stores"
              aria-controls="stores"
              @change="toggleAll"
            >
              {{ allSelected ? 'De-select All' : 'Select All' }}
            </b-form-checkbox>
          </template>
          <b-form-checkbox-group
            id="stores"
            v-model="filters.selectedStores"
            stacked
            name="stores"
            :options="stores"
          />
        </b-form-group>
      </div>
      <div v-else>For all {{ brandName }} stores</div>
    </form>
  </div>
</template>

<style scoped lang="scss">
@import '../../../style/base/_variables.scss';
</style>

<!-- The view model goes on the separated file -->
<script src="./admin-filters.js"></script>
