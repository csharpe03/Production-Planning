<template>
  <div v-if="locale" style="max-width: 1600px; margin-left: auto; margin-right: auto;">
    <!--    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">-->
    <div v-if="hasWarning && maintenanceMessage !== ''">
      <alert-box :message="maintenanceMessage" @warningAcknowledged="hasWarning = false" />
    </div>
    <div v-if="hasProductsWarning && productsErrorMessage !== ''">
      <alert-box-link
        :message="productsErrorMessage"
        :link-to="'product'"
        @warningAcknowledged="hasProductsWarning = false"
      />
    </div>
    <div class="jumbotron jumbotron-fluid">
      <div class="container text-dark text-center">
        <!-- NOTE! display-4 is a BOOTSTRAP class that determines the size of h elements. -->
        <h1 class="display-4">
          {{ $tkey('title') }}
        </h1>
      </div>
      <div v-if="nav.screenMode === 'normal'" style="height: 1px; opacity: 0.3; overflow: hidden;">
        <vue-editor v-model="contentHidden" />
      </div>

      <!-- MAIN IMAGE HERE! (as a background image for classes hero-unit-10, etc.) -->
      <div class="hero-unit" :class="heroUnit" />

      <div v-if="nav.screenMode === 'phone'" class="go-to-viewer-container">
        <b-dropdown split :text="$tkey('GoToViewer')" class="m-2" @click="gotoViewerClick">
          <b-dropdown-item
            v-for="department in nav.departments"
            :key="department.departmentId"
            href="#"
            @click="gotoViewerWithDepartmentClick(department)"
          >
            {{ department.departmentCode }}
          </b-dropdown-item>
        </b-dropdown>
      </div>

      <!-- allowEditContent is true only when the role is ADMIN-->
      <div
        v-if="nav.screenMode === 'normal' && allowEditContent && !loadingContent"
        style="margin-top: 3px; margin-bottom: 3px;"
      >
        <button
          v-if="!contentEditing"
          type="button"
          class="btn btn-secondary btn-sm"
          style="padding-left: 20px; padding-right: 20px; margin-left: 3px;"
          @click="showContentEditorClick()"
        >
          Edit Content
        </button>

        <template v-else>
          <button
            :disabled="savingContent"
            type="button"
            class="btn btn-secondary btn-sm"
            style="margin-left: 3px;"
            @click="saveContentClick()"
          >
            Save Content
          </button>
          <button
            :disabled="savingContent"
            type="button"
            class="btn btn-secondary btn-sm"
            style="margin-left: 3px;"
            @click="cancelContentClick()"
          >
            Cancel
          </button>
          <i v-if="savingContent" class="fa fa-spinner fa-spin" />
        </template>
      </div>

      <div class="ql-container ql-snow">
        <vue-editor
          v-if="nav.screenMode === 'normal' && allowEditContent && showContentEditor"
          v-model="contentEditing"
          :editor-toolbar="customToolbar"
        />
        <div
          v-if="nav.screenMode === 'normal' && allowEditContent && showContentEditor"
          style="padding-left: 2em;"
        >
          <span style="font-weight: bold; font-size: 1.5em;">Preview:</span>
        </div>
        <div class="ql-editor" v-html="showContentEditor ? contentEditing : content" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.go-to-viewer-container {
  .btn-secondary {
    color: #fff;
    background-color: #7bc80f;
    border-color: #5ea000;
  }
  .btn-secondary:active,
  .btn-secondary:focus {
    color: #fff;
    background-color: #7bc80f;
    border-color: #5ea000;
  }
  .btn-secondary.dropdown-toggle {
    background-color: #7bc80f;
    border-color: #5ea000;
  }
}
</style>

<style scoped lang="scss">
@import '../../style/base/_variables.scss';
@import '../../style/base/_libraries.scss';

@media screen and (min-width: 100px) {
  .jumbotron {
    background: $tool-background;
    margin-bottom: 0;
    padding-top: 2rem;

    h3 {
      margin: 2rem 0;
    }
    ul {
      margin: 0.5rem 0;
    }
  }
  .hero-unit-10 {
    background-image: url('../../img/general-store-generic.jpg');
    background-position: center;
  }
  .hero-unit-20 {
    background-image: url('../../img/general-store-foodlion.jpg');
    background-position: center top;
  }
  .hero-unit-40 {
    background-image: url('../../img/general-store-tgc.png');
    background-position: center top;
    background-size: contain !important;
  }

  .hero-unit-other {
    background-image: url('../../img/general-store.jpg');
    background-position: center;
  }

  .hero-unit {
    /* Set a specific height */
    height: 360px;

    /* Position and center the image to scale nicely on all screens */
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
  }
  .updates-section {
    margin-left: 2em;
    margin-right: 2em;
  }
}

// for a tablet - specifically an ipad in landscape mode
// Applies to screens below 1024px wide
@media screen and (max-width: 1024px) {
  .jumbotron {
    // NOTE! display-4 is a BOOTSTRAP class that determines the size of h elements.
    .display-4 {
      font-size: medium;
      font-size: 1.5rem;
    }
    h3 {
      font-size: 1rem;
    }
    p {
      font-size: 1rem;
    }
    ul {
      margin-top: 0;
      margin-bottom: 0;
    }
    .hero-unit {
      height: 300px;
    }
  }
}

// Applies to screens below 600px wide
@media screen and (max-width: 600px) {
  .jumbotron {
    padding-top: 0.75rem;
    // NOTE! display-4 is a BOOTSTRAP class that determines the size of h elements.
    .display-4 {
      font-size: 1.3rem;
    }
    .hero-unit {
      height: 100px;
    }
  }
}

.go-to-viewer-container {
  text-align: center;
  margin-top: 1em;
  margin-bottom: 1em;
}

.go-to-viewer-button {
  background-color: #7bc80f;
  color: white;
  border-radius: 3px;
  padding: 0.6em;
  border: 1px solid #a6b576;
}
.go-to-viewer-button:hover {
  background-color: #65a300;
}
</style>

<script src="./home.js"></script>
