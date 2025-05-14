<template>
  <!-- Component template content goes here -->
  <div class="time-range">
    <template v-if="notBold">
      <template v-if="compress">
        <span style="white-space: nowrap">{{
          formatTwoTimes(time, endTime, meridian, locale, removeColonZeroes)
        }}</span>
      </template>
      <template v-else>
        <span>{{ formatTime(time, meridian, locale, removeColonZeroes) }}</span
        ><span v-if="endTime"
          >&nbsp;-&nbsp;{{ formatTime(endTime, meridian, locale, removeColonZeroes) }}</span
        >
      </template>
    </template>
    <template v-else>
      <template v-if="compress">
        <b style="white-space: nowrap">{{
          formatTwoTimes(time, endTime, meridian, locale, removeColonZeroes)
        }}</b>
      </template>
      <template v-else>
        <b>{{ formatTime(time, meridian, locale, removeColonZeroes) }}</b
        ><b v-if="endTime"
          >&nbsp;-&nbsp;{{ formatTime(endTime, meridian, locale, removeColonZeroes) }}</b
        >
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
// your scss rules go here. They are scoped to this particular component
</style>

<script src="./time-display.js"></script>
