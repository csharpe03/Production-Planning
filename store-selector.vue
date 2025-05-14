<template>
  <div v-if="nav" style="overflow: hidden;">
    <div class="my-title-text">
      <span>{{ $tkey('DistrictorRegion') }}</span>
      <span
        v-if="friendlyGroup"
        class="my-clear-district-hyperlink"
        @click="friendlyGroup = null"
        >{{ $tkey('Clear') }}</span
      >
    </div>
    <div class="my-sub-container">
      <multiselect
        style="width: 100%;"
        v-model="friendlyGroup"
        :options="friendlyGroups"
        :multiple="false"
        :limit="1"
        label="friendlyName"
        track-by="friendlyName"
        size="sm"
        :placeholder="$tkey('Select')"
        :searchable="true"
        :close-on-select="true"
        :clear-on-select="true"
        :show-labels="false"
        :reset-after="false"
        open-direction="bottom"
      />
    </div>
    <div class="my-title-text">
      <span>{{ $tkey('Store') }}</span>
    </div>
    <div class="my-sub-container">
      <input
        type="text"
        :placeholder="$tkey('storeFilterPlaceholder')"
        v-focus
        v-model="filterText"
        style="width: 100%; border: 1px solid #ddd; padding: 8px 7px; border-radius: 6px;"
        :style="{
          backgroundColor: filterText ? '#ffffc9' : undefined,
          opacity: filterText ? 1.0 : 0.5
        }"
      />
    </div>
    <div class="my-sub-container" style="height: calc(100vh - 500px); overflow-y: auto;">
      <div
        v-for="store in filteredStores"
        class="my-store-hyperlink my-1 py-1 pl-2"
        :id="`last-scroll-${store.storeKey}`"
        @click="selectStore(store)"
        :class="userClickedStoreKey === store.storeKey ? 'active-store' : ''"
      >
        <span>{{ store.storeInfo }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.active-store {
  font-weight: bold;
  background-color: #d8edff !important;
}
.active-store:hover {
  background-color: #c6e5ff !important;
}

.my-title-text {
  font-weight: bold;
}
.my-store-hyperlink {
  cursor: pointer;
  color: #0f5fb4;
}
.my-store-hyperlink:hover {
  background-color: aliceblue;
}
.my-clear-district-hyperlink {
  cursor: pointer;
  color: #0f5fb4;
  //font-size: 0.8em;
  font-weight: normal;
  background-color: aliceblue;
}
.my-clear-district-hyperlink:hover {
  background-color: #a6eaff;
}
.my-sub-container {
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 10px;
  padding-bottom: 10px;
}
.my-district-selector {
  padding-top: 3px;
  padding-bottom: 3px;
  border-color: #ddd;
}
</style>

<script src="./store-selector.js"></script>
