<template>
  <footer class="footer" type="light" variant="light">
    <div class="container-fluid">
      <p class=" text-dark text-center">
        {{ $tkey('title') }} | v{{ version }} {{ tier === 'production' ? '' : `(${tier})` }} |
        <a
          target="_blank"
          href="https://www.oliverwyman.com/our-expertise/capabilities/digital.html"
          >Oliver Wyman Digital</a
        >
        |
        <a href="http://www.oliverwyman.com/" target="_blank">Oliver Wyman</a>
      </p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
p {
  margin-bottom: 0;
}
footer.footer > div.row {
  margin-right: 0;
}
</style>

<script>
export default {
  localizationKey: 'components.ow-footer',
  props: {
    version: {
      type: String,
      required: true
    },
    tier: {
      type: String,
      required: true
    }
  }
}
</script>
