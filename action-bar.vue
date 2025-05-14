<template>
  <!-- Component template content goes here -->
  <div class="mb-4 container card">
    <div class="card-body">
      <div class="text-left">
        <i>{{ message }}</i>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// your scss rules go here. They are scoped to this particular component

p.lead {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.features-container {
  margin: 0 auto;
  ul {
    display: inline-block;
  }
}
</style>

<script src="./action-bar.js"></script>
