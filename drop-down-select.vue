<!--Usage of this component
______________________________________________________

Insert the following in your component:

<drop-down-select
        :items="overrideReasons"
        :id-in-use="selectedReason"
        :type-of-selection="overrideReasonSelectionType"
        v-model="selectedReason"
        @input="updateSelectedReason"/>

items = the list of objects that must be selected from
key-in-use = selected item - should be the key of the selected item
type-of-selection = text that says select this or that
v-model = should set it to the selected object or item
@input = set it to the function that will execute when the input changes


sample data structures:

items = [
      { id: 1, code: 'Bunny', name: 'Rabbit'},
      { id: 2, code: 'Kiddie', name: 'Goat'},
      { id: 3, code: 'Kitty', name: 'Cat'},
      { id: 4, code: 'Puppy', name: 'Dog'}
    ]

-->

<template>
  <!-- Component template content goes here -->
  <div class="drop-down-select">
    <select v-model="selected" :disabled="viewOnly" style="width:100%" @change.prevent="onChange">
      <option :key="idForTypeOfSelection" class="type-of-selection" :value="idForTypeOfSelection">
        {{ typeOfSelection }}
      </option>
      <option v-for="item in items" :key="item.id" :value="item.id">
        {{ item.name }}
      </option>
    </select>
  </div>
</template>

<style scoped lang="scss">
@import '../../../style/base/_variables.scss';

.drop-down-select {
  margin: 0 auto;
  font-size: large;
}
.type-of-selection {
  color: $tool-grey-light;
}
</style>

<script src="./drop-down-select.js"></script>
