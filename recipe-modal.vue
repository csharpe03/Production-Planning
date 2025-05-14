<template v-if="productToShowIngredients">
  <div>
    <div style="text-align: right">
      <!-- In all cases below, make the button visible if it's in that mode. This is a safety feature in case we accidentally hide a valid button somehow and it looks like nothing is selected.  -->
      <div
        v-if="productToShowIngredients.recipe || modalMode === 'recipe'"
        style="display: inline-block; padding-bottom: 7px;"
        @click="setModalMode('recipe')"
        class="mode-selector-button"
        :class="modalMode === 'recipe' ? 'selected-mode-selector-button' : ''"
      >
        {{ $tkey('Recipe') }}
        <div
          style="height: 3px; background-color: red; width: 100%;"
          :style="{ opacity: modalMode === 'recipe' ? 1.0 : 0.0 }"
        ></div>
      </div>
      <div
        v-if="productToShowIngredients.ingredients.length || modalMode === 'ingredients'"
        style="display: inline-block; padding-bottom: 7px;"
        @click="setModalMode('ingredients')"
        class="mode-selector-button"
        :class="modalMode === 'ingredients' ? 'selected-mode-selector-button' : ''"
      >
        <span v-if="nav.marketKey === 10 || nav.marketKey === 20">{{
          $tkey('IngredientList')
        }}</span>
        <span v-if="nav.marketKey !== 10 && nav.marketKey !== 20">{{ $tkey('PickList') }}</span>
        <div
          style="height: 3px; background-color: red; width: 100%;"
          :style="{ opacity: modalMode === 'ingredients' ? 1.0 : 0.0 }"
        ></div>
      </div>
      <div
        v-if="productToShowIngredients.rowSupportsInventoryLog || modalMode === 'inventory-log'"
        style="display: inline-block; padding-bottom: 7px;"
        @click="setModalMode('inventory-log')"
        class="mode-selector-button"
        :class="modalMode === 'inventory-log' ? 'selected-mode-selector-button' : ''"
      >
        {{ $tkey('InventoryLog') }}
        <div
          style="height: 3px; background-color: red; width: 100%;"
          :style="{ opacity: modalMode === 'inventory-log' ? 1.0 : 0.0 }"
        ></div>
      </div>
      <div
        v-if="productToShowIngredients.rowSupportsNeedLog || modalMode === 'need-log'"
        style="display: inline-block; padding-bottom: 7px;"
        @click="setModalMode('need-log')"
        class="mode-selector-button"
        :class="modalMode === 'need-log' ? 'selected-mode-selector-button' : ''"
      >
        {{ $tkey('NeedLog') }}
        <div
          style="height: 3px; background-color: red; width: 100%;"
          :style="{ opacity: modalMode === 'need-log' ? 1.0 : 0.0 }"
        ></div>
      </div>
      <div
        v-if="modalMode === 'nothing-to-show'"
        style="display: inline-block;"
        class="mode-selector-button selected-mode-selector-button"
      >
        Nothing to Show
      </div>
    </div>

    <!-- recipe -->
    <div v-if="productToShowIngredients.recipe && modalMode === 'recipe'">
      <h4 style="display: inline-block;">{{ $tkey('Recipe') }}</h4>

      <div v-if="recipeLink">
        <div style="display: inline-block; padding-top: 11px;">
          <div style="position: relative; top: 2px; padding-right: 10px;">
            <b>{{ $tkey('LinkedFile') }}</b>
          </div>
        </div>
        <button
          :title="getValidUrl(recipeLink)"
          class="btn btn-secondary"
          style="min-width: 100px;"
          @click="openRecipeLink(recipeLink)"
        >
          {{ $tkey('ClickToOpenANewWindow') }}
        </button>
        <div style="display: inline-block; float: right; position: relative; padding-top: 12px;">
          <i>{{ $tkey('LastUpdated') + ': ' + lastModifiedDateTimeDisplay }}</i>
        </div>
        <hr />
      </div>

      <div v-if="recipeContent" class="ql-container ql-snow">
        <div class="ql-editor" v-html="recipeContent"></div>
      </div>
      <!--    <i>{{ $tkey('recipeFooter') }}</i>-->
    </div>

    <!-- Ingredient List-->
    <div v-if="modalMode === 'ingredients'">
      <h4 style="display: inline-block;" v-if="nav.marketKey === 10 || nav.marketKey === 20">
        {{ $tkey('IngredientList') }}
      </h4>
      <h4 style="display: inline-block;" v-if="nav.marketKey !== 10 && nav.marketKey !== 20">
        {{ $tkey('PickList') }}
      </h4>
      <table class="table">
        <thead>
          <tr>
            <th class="generic-table-header left upc-code">{{ $tkey('department') }}</th>
            <th class="generic-table-header left upc-code">{{ $tkey('descriptionSlashUpc') }}</th>
            <th
              v-if="productToShowIngredients.allItemsHaveSingleQuantities"
              class="generic-table-header quantity"
            >
              {{ $tkey('singleUnitQuantity') }}
            </th>
            <th class="generic-table-header quantity">{{ $tkey('totalNeedToMakeQuantity') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="ingredient in productToShowIngredients.ingredients"
            :style="{ borderBottom: ingredient.dividerOnBottom ? '2px solid #999999' : undefined }"
          >
            <td class="left upc-code">{{ ingredient.displayCategory }}</td>
            <td class="left upc-code">
              <!-- Keep - for index number if needed, e.g. as on visible html table.
            <span>{{ index+1 }}. {{ ingredient.ingredientDesc }}</span>
          -->
              <span>{{ ingredient.ingredientDesc }}</span>
              <span class="upc-lowlight" v-if="ingredient.upc">({{ ingredient.upc }})</span>
            </td>
            <td v-if="productToShowIngredients.allItemsHaveSingleQuantities" class="quantity">
              {{ ingredient.ingredientQuantity }}
              {{ formatLowerCase(ingredient.ingredientUnitOfMeasure) }}
            </td>
            <!--<td @click="debugIngredients(ingredient, productToShowIngredients)"-->
            <!--class="quantity">{{ ingredient.ingredientQuantity * ingredient.needToMake | formatFraction }} {{ ingredient.ingredientUnitOfMeasure | formatLowerCase }}-->
            <!--</td>-->

            <td @click="debugIngredients(ingredient, productToShowIngredients)" class="quantity">
              {{ formatFraction(ingredient.total) }}
              {{ formatLowerCase(ingredient.ingredientUnitOfMeasure) }}
            </td>
          </tr>
        </tbody>
      </table>
      <i v-if="nav.marketKey === 10 || nav.marketKey === 20">{{ $tkey('ingredientsFooter') }}</i>
    </div>

    <!-- Inventory Log-->
    <div v-if="modalMode === 'inventory-log'">
      <div>
        <!-- Inventory Log-->
        <h4 style="display: inline-block;">{{ $tkey('InventoryLog') }}</h4>
        <span style="color: #777; font-size: 1em;">{{
          productToShowIngredients.loadingTaskInventoryLog ? $tkey('loadingDotDotDot') : ''
        }}</span>
      </div>
      <!--    <i v-if="productToShowIngredients.taskInventoryLog.length > 0">{{ $tkey('inventoryFooter') }}</i>-->
      <table class="table inventory-log-table mt-3">
        <thead>
          <tr>
            <th class="generic-table-header left time">{{ $tkey('time') }}</th>
            <th class="generic-table-header left inventory">{{ $tkey('inventory') }}</th>
            <th class="generic-table-header left source">{{ $tkey('source') }}</th>
            <th class="generic-table-header left details">{{ $tkey('details') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="productToShowIngredients.loadingTaskInventoryLog">
            <td colspan="100">
              <div class="message-row">
                {{ $tkey('PleaseWaitWhileInventoryLogLoads') }} &nbsp;&nbsp;
                <i class="fa fa-spinner fa-spin spinner-small" style="color: #555;" />
              </div>
            </td>
          </tr>
          <tr v-else-if="productToShowIngredients.taskInventoryLog.length === 0">
            <td colspan="100">
              <div class="message-row">
                {{ $tkey('NoRecordsFoundForThisItem') }}
              </div>
            </td>
          </tr>
          <tr v-for="invLog in productToShowIngredients.taskInventoryLog">
            <td class="time">{{ invLog.displayDateTime }}</td>
            <td class="inventory">{{ invLog.inventory }}</td>
            <td class="source">{{ invLog.source }}</td>
            <td class="details">{{ invLog.details }}</td>
          </tr>
        </tbody>
      </table>
      <i>{{ $tkey('inventoryFooter') }}</i>
    </div>

    <!-- Need Log-->
    <div v-if="modalMode === 'need-log'">
      <div>
        <!-- Need Log-->
        <h4 style="display: inline-block;">{{ $tkey('NeedLog') }}</h4>
      </div>
      <div>
        <table class="table need-log-table mt-3">
          <thead>
            <tr>
              <th class="generic-table-header left date">{{ $tkey('Date') }}</th>
              <th class="generic-table-header left plan">{{ $tkey('PlanName') }}</th>
              <th class="generic-table-header left rec-qty">{{ $tkey('RecQty') }}</th>
              <th class="generic-table-header left override-y-n">{{ $tkey('BuilderOverride') }}</th>
              <th class="generic-table-header left override-time">{{ $tkey('OverrideTime') }}</th>
              <th class="generic-table-header left">{{ $tkey('Deleted') }}</th>
              <th class="generic-table-header left produced-qty">{{ $tkey('ProducedQty') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="productToShowIngredients.loadingNeedLog">
              <td colspan="100">
                <div class="message-row">
                  {{ $tkey('PleaseWaitWhileNeedLogLoads') }} &nbsp;&nbsp;
                  <i class="fa fa-spinner fa-spin spinner-small" style="color: #555;" />
                </div>
              </td>
            </tr>
            <tr v-else-if="productToShowIngredients.needLog.length === 0">
              <td colspan="100">
                <div class="message-row">
                  {{ $tkey('NoRecordsFoundForThisItem') }}
                </div>
              </td>
            </tr>
            <tr v-for="needLog in productToShowIngredients.needLog">
              <td class="date">{{ needLog.dateOfProduction }}</td>
              <td class="plan">{{ needLog.planCode }}</td>
              <td class="rec-qty">{{ needLog.recommendedQuantity }}</td>
              <td class="override-y-n">{{ needLog.builderOverride }}</td>
              <td class="override-time">{{ needLog.builderOverrideDateTime }}</td>
              <td class="">
                {{ needLog.isDeleted !== 'No' ? needLog.displayDeletedTime : needLog.isDeleted }}
              </td>
              <td class="produced-qty">{{ needLog.producedQuantity }}</td>
            </tr>
          </tbody>
        </table>
        <i>{{ $tkey('needLogFooter') }}</i>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../../../style/base/_variables.scss';
@import '../../../style/components/_table.scss';

.mode-selector-button {
  cursor: pointer;
  border-radius: 4px;
  padding: 10px 10px 10px 10px;
  background-color: #343a40; // Same as modal title row
  color: #dddddd;
}
.mode-selector-button:hover {
  background-color: #3a4249; // Same as modal title row
}
.selected-mode-selector-button {
  background-color: black;
  color: white;
}
.selected-mode-selector-button:hover {
  background-color: #111111;
}
</style>

<script src="./recipe-modal.js"></script>
