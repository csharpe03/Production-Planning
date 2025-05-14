<template>
  <div class="mt-4 container-fluid px-0" style="max-width: 1600px; margin: auto !important;" />
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins';
@import '../../style/base/_variables.scss';

@import '../../style/components/_all.scss';
@import '../../style/components/_table.scss';
@import '../../style/components/multi-select.scss';

/*Remove spinners: https://www.w3schools.com/howto/howto_css_hide_arrow_number.asp*/
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
<script src="./empty-page.js"></script>
