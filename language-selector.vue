<template>
  <b-nav-item-dropdown
    :text="$tkey('language')"
    right
    :disabled="nav.processingMessage !== ''"
    @show="pulseNow()"
    @hide="pulseNow()"
  >
    <!-- Normal screen mode: Show the word language on the page. -->
    <template v-if="nav.screenMode === 'normal'" slot="button-content">
      <img
        v-if="currentLocale === 'es'"
        class="logo"
        src="../../../img/spanish-flag.png"
        style="height: 20px;"
      />
      <img
        v-if="currentLocale === 'en'"
        class="logo"
        src="../../../img/american-flag.png"
        style="height: 20px;"
      />
      <span class="d-md-none d-lg-inline my-minor-navbar">{{ ' ' + $tkey('language') }}</span>
    </template>
    <!-- Phone screen mode: Show the actual language selected on the page. Also adjust the size of the flag to match other nav items.-->
    <template v-else-if="nav.screenMode === 'phone'" slot="button-content">
      <img
        v-if="currentLocale === 'es'"
        class="logo"
        src="../../../img/spanish-flag.png"
        style="height: 20px; padding-right: 4px; margin-top: -4px;"
      />
      <img
        v-if="currentLocale === 'en'"
        class="logo"
        src="../../../img/american-flag.png"
        style="height: 20px; padding-right: 4px; margin-top: -4px;"
      />
      <span class="d-md-none d-lg-inline">{{ $tkey(`locales.${currentLocale}`) }}</span>
    </template>
    <b-dropdown-item
      v-for="locale in locales"
      :key="locale"
      :disabled="locale === currentLocale"
      @click="onSetLocale(locale)"
    >
      <img
        v-if="locale === 'es'"
        class="logo"
        src="../../../img/spanish-flag.png"
        style="height: 20px;"
      />
      <img
        v-if="locale === 'en'"
        class="logo"
        src="../../../img/american-flag.png"
        style="height: 20px;"
      />
      {{ $tkey(`locales.${locale}`) }}
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<style scoped lang="scss">
.my-minor-navbar {
  font-size: 0.8em;
}
</style>

<script src="./language-selector.js"></script>
