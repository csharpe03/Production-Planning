<template v-if="productToShowIngredients">
  <div>
    <div
      style="text-align: center;  border-radius: 25px; width: fit-content;
    margin-right: auto;
    margin-left: auto;
    background-color: #f2f2f2; margin-bottom: 10px;"
    >
      <div
        v-if="productToShowIngredients.rowSupportsProductTab || modalMode === 'product'"
        style="display: inline-block; padding-bottom: 7px;"
        @click="setModalMode('product')"
        class="mode-selector-button"
        :class="modalMode === 'product' ? 'selected-mode-selector-button' : ''"
      >
        {{ $tkey('Product') }}
      </div>

      <!-- In all cases below, make the button visible if it's in that mode. This is a safety feature in case we accidentally hide a valid button somehow and it looks like nothing is selected.  -->
      <div
        v-if="productToShowIngredients.recipe || modalMode === 'recipe'"
        style="display: inline-block; padding-bottom: 7px;"
        @click="setModalMode('recipe')"
        class="mode-selector-button"
        :class="modalMode === 'recipe' ? 'selected-mode-selector-button' : ''"
      >
        {{ $tkey('Recipe') }}
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
      </div>
      <div
        v-if="productToShowIngredients.rowSupportsInventoryLog || modalMode === 'inventory-log'"
        style="display: inline-block; padding-bottom: 7px;"
        @click="setModalMode('inventory-log')"
        class="mode-selector-button"
        :class="modalMode === 'inventory-log' ? 'selected-mode-selector-button' : ''"
      >
        {{ $tkey('InventoryLog') }}
      </div>
      <div
        v-if="productToShowIngredients.rowSupportsNeedLog || modalMode === 'need-log'"
        style="display: inline-block; padding-bottom: 7px;"
        @click="setModalMode('need-log')"
        class="mode-selector-button"
        :class="modalMode === 'need-log' ? 'selected-mode-selector-button' : ''"
      >
        {{ $tkey('NeedLog') }}
      </div>
      <div
        v-if="modalMode === 'nothing-to-show'"
        style="display: inline-block;"
        class="mode-selector-button selected-mode-selector-button"
      >
        Nothing to Show
      </div>
    </div>

    <template v-if="productToShowIngredients.itemIn.productSummary && modalMode === 'product'">
      <!-- <div class="expander-row" @click="toggleRecipeExpander()">
        <div class="expander-container">
          <i v-if="!recipeExpanded" class="fa fa-caret-right my-expander" />
          <i v-if="recipeExpanded" class="fa fa-caret-down my-expander" />
        </div>
        <div class="expander-text-container">
          {{ $tkey('Recipe') }}
        </div>
      </div> -->
      <div
        v-if="productToShowIngredients.itemIn.productSummary && modalMode === 'product'"
        class="product-body-container"
      >
        <!-- recipe 
         "UPC": "29687800000",
        "PLU": null,
        "productDesc": "6 GOURMET CHOC MINI KISS COOKIES",
        "shelfLifeHours": 96,
        "isMfgShelfLife": "n",
        "inventory": null,
        "isPriority": "n",
        "usedLikeProduct": "n",
        "usedLikeStore": "n",
        "requiresInvCheck": "y",
        "isLowInventory": "n"-->
        <div v-if="productToShowIngredients.itemIn.productSummary">
          <div>
            <div
              style="text-align: center; width: fit-content; margin-right: auto; margin-left: auto; height: fit-content; margin-bottom: 10px;"
            >
              <img
                style="max-width: 300px; max-height: 300px;"
                v-if="productImageVisible()"
                :src="productToShowIngredients.itemIn.productSummary.imageURL"
              />
            </div>
            <div
              style="text-align: center; width: fit-content; margin-right: auto; margin-left: auto; margin-bottom: 10px;"
            >
              <b>{{ productToShowIngredients.itemIn.productSummary.productDesc }}</b>
            </div>
            <div
              style="text-align: center; width: fit-content; margin-right: auto; margin-left: auto;margin-bottom: 10px;"
            >
              <b
                >{{
                  productToShowIngredients.itemIn.productSummary.PLU
                    ? $tkey('productPLU')
                    : $tkey('productUPC')
                }}
              </b>
              {{
                productToShowIngredients.itemIn.productSummary.PLU
                  ? productToShowIngredients.itemIn.productSummary.PLU
                  : productToShowIngredients.itemIn.productSummary.UPC
              }}
            </div>

            <div
              style="text-align: center; width: 100%; margin-right: auto; margin-left: auto; float:left; margin-top: 10px;"
            >
              <div
                style="text-align: center;  border-radius: 25px; width: fit-content;
                margin-right: auto;
                margin-left: auto;
                display: inline-block;"
              >
                <div style="border-radius: 25px; margin-bottom: 10px;">
                  <div
                    v-for="pill in productToShowIngredients.summaryPills"
                    class="pill"
                    :style="{
                      backgroundColor: '#' + pill.pillColor
                    }"
                  >
                    <div :class="'fa ' + pill.pillIcon" style="color : white"></div>
                    {{ pill.pillDesc }}
                  </div>
                </div>
              </div>
            </div>

            <div
              style="text-align: center; width: fit-content; margin-right: auto; margin-left: auto;"
            >
              <div>
                <div
                  style="color : white ; float:left; text-align: center; margin-right: 5px; margin-left: 5px;"
                >
                  <!-- curr inv -->
                  <template v-if="plan.isInventoryDisplayed === 'y'">
                    <div class="phone-edit-row-item">
                      <div
                        class="phone-input-title"
                        :style="{
                          color: productToShowIngredients.itemIn.rowIsUpdatingCurrentInventory
                            ? '#777777'
                            : '#444'
                        }"
                      >
                        <template v-if="plan.useTomorrowInventory !== 'y'">
                          <b>{{ $tkey('currentIventory') }}</b>
                        </template>
                        <template v-else>
                          <b> {{ $tkey('tomorrowInv') }} </b>
                        </template>
                        <i
                          v-if="productToShowIngredients.itemIn.rowIsUpdatingCurrentInventory"
                          class="fa fa-hourglass"
                        />
                      </div>
                      <template v-if="productToShowIngredients.itemIn.isDeleted !== 'y'">
                        <input
                          v-if="plan.useTomorrowInventory !== 'y'"
                          type="number"
                          pattern="\d*"
                          style="width: 80%; text-align: center; border: 1px solid #bbb"
                          :style="
                            productToShowIngredients.itemIn.currentInventoryControlHasFocus
                              ? 'background: yellow;'
                              : productToShowIngredients.itemIn.inventoryWasChanged
                              ? ''
                              : productToShowIngredients.itemIn.requiresInvCheck === 'y'
                              ? 'background: #ffabab ; border-color: #c10102; color: #c10102;'
                              : ''
                          "
                          v-model="productToShowIngredients.itemIn.candidateInventory"
                          :disabled="
                            plan.isPast ||
                              plan.isExpired ||
                              productToShowIngredients.itemIn.rowIsUpdatingCurrentInventory
                          "
                          maxLength="4"
                          oninput="if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"
                          @focus="
                            productToShowIngredients.itemIn.currentInventoryControlHasFocus = true
                            pulseNow()
                          "
                          @blur="
                            productToShowIngredients.itemIn.currentInventoryControlHasFocus = false
                          "
                          @change="submitNewInventory(productToShowIngredients.itemIn)"
                          onclick="this.select()"
                        />
                      </template>

                      <div
                        :style="
                          productToShowIngredients.itemIn.inventoryWasChanged
                            ? ''
                            : productToShowIngredients.itemIn.requiresInvCheck === 'y'
                            ? 'background: #ffabab ; border-color: #c10102; color: #c10102;'
                            : ''
                        "
                        v-if="plan.useTomorrowInventory === 'y'"
                        style="width: 80%; margin-left: 10%; background-color: #f7f7f7; color:black; border-radius: 0; padding-top: 1px; padding-bottom: 1px;"
                        :class="productToShowIngredients.itemIn.tomorrowInventoryClass"
                        :title="productToShowIngredients.itemIn.tomorrowInventoryHint"
                      >
                        <!-- @click="showTomorrowInventoryHint(productToShowIngredients.itemIn)" -->
                        <span>{{ productToShowIngredients.itemIn.tomorrowInventory }}</span>
                      </div>
                      <template v-else-if="productToShowIngredients.itemIn.isDeleted === 'y'">
                        <div
                          :style="
                            productToShowIngredients.itemIn.inventoryWasChanged
                              ? ''
                              : productToShowIngredients.itemIn.requiresInvCheck === 'y'
                              ? 'background: #ffabab ; border-color: #c10102; color: #c10102;'
                              : ''
                          "
                          style="width: 100%; margin-left: auto; padding-top: 1px;"
                        >
                          {{ productToShowIngredients.itemIn.inventory }}
                        </div>
                      </template>
                    </div>
                  </template>

                  <!-- shhelfLife -->
                  <div
                    v-if="
                      productToShowIngredients.itemIn.productSummary.codeDate &&
                        productToShowIngredients.itemIn.showCodeDate === 'y'
                    "
                    style="display: inline-block; float: right;"
                    class="phone-edit-row-item"
                  >
                    <div class="phone-input-title" style="color: #444">
                      <b>{{ $tkey('codeDate') }}</b>
                    </div>
                    <div style="width: 100%; margin-left: auto; padding-top: 1px;color: #444">
                      {{ productToShowIngredients.itemIn.productSummary.codeDate }}
                    </div>
                  </div>
                  <div
                    v-else-if="productToShowIngredients.itemIn.productSummary.shelfLifeHours"
                    style="display: inline-block; float: right;"
                    class="phone-edit-row-item"
                  >
                    <div class="phone-input-title" style="color: #444">
                      <b>{{ $tkey('shelfLife') }}</b>
                    </div>
                    <div
                      v-if="productToShowIngredients.itemIn.productSummary.isMfgshelfLife === 'y'"
                      style="width: 100%; margin-left: auto; padding-top: 1px;color: #444"
                    >
                      MFG
                    </div>
                    <div
                      v-else
                      style="width: 100%; margin-left: auto; padding-top: 1px;color: #444"
                    >
                      {{
                        formatShelfLife(
                          productToShowIngredients.itemIn.productSummary.shelfLifeHours
                        )
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="
            productToShowIngredients.tile && $route.path.toLowerCase().indexOf('plan-builder') > 0
          "
          style="text-align: center; margin-right: auto; margin-left: auto;  margin-top: 15px;"
        >
          <div
            style="text-align: center;  border-radius: 25px; width: 100%;
              margin-right: auto;
              margin-left: auto;
              display: inline-block;"
          >
            <div class="promotion-container">
              <div
                v-if="productToShowIngredients.tile.displayQuantity"
                style="display: inline-block;"
                class="phone-edit-row-item tiles"
              >
                <div>
                  <div
                    style="text-align: center; width: 100%;
                      margin-right: auto;
                      margin-left: auto;
                      display: inline-block;"
                  >
                    <div class="tile-icon">
                      <div class="fa fa-video-camera" style="color : black; "></div>
                    </div>
                    <div class="tile-title">
                      <b>{{ $tkey('SecondaryDisplays') }}</b>
                    </div>
                  </div>
                  <b
                    ><div style="font-size: larger; margin-top:5px; margin-bottom: 10px;">
                      + {{ productToShowIngredients.tile.displayQuantity }} Min Qty
                    </div></b
                  >
                  <div style="font-size: small">
                    {{
                      formatDateSecondaryDisplay(
                        productToShowIngredients.tile.displayQuantityStart,
                        locale
                      )
                    }}
                    -
                    {{
                      formatDateSecondaryDisplay(
                        productToShowIngredients.tile.displayQuantityEnd,
                        locale
                      )
                    }}
                  </div>
                </div>
              </div>

              <div
                v-if="productToShowIngredients.tile.batchQuantity"
                style="display: inline-block;"
                class="phone-edit-row-item tiles"
              >
                <div>
                  <div
                    style="text-align: center; width: 100%;
                      margin-right: auto;
                      margin-left: auto;
                      display: inline-block;"
                  >
                    <div class="tile-icon">
                      <i
                        v-if="productToShowIngredients.itemIn.optimalQuantity"
                        class="fa fa-star"
                        :class="productToShowIngredients.itemIn.needToMakeObject.iconClass"
                        :title="getOptimalNumbersTooltipText(productToShowIngredients.itemIn)"
                      />
                      <i
                        v-else
                        class="fa fa-star"
                        :class="productToShowIngredients.itemIn.needToMakeObject.iconClass"
                        :title="getOptimalNumbersTooltipText(productToShowIngredients.itemIn)"
                      />
                      <!-- <div class="fa fa-star" style="color : black; float:left"></div> -->
                    </div>
                    <div class="tile-title">
                      <b>{{ $tkey('BatchQuantity') }}</b>
                    </div>
                  </div>
                  <div
                    v-if="
                      productToShowIngredients.itemIn.needToMakeObject.iconClass ===
                        'optimal-grayed' ||
                        productToShowIngredients.itemIn.needToMakeObject.iconClass === 'non-optimal'
                    "
                    style="  font-size: 0.8em;"
                  >
                    {{ $tkey('BatchQuantityNotApllied') }}
                  </div>
                  <div v-else>
                    <div style="font-size: larger;">
                      <div
                        style="display: inline-block;"
                        class="phone-edit-row-item"
                        @click="notifyOptimalNumbers(productToShowIngredients.itemIn)"
                      >
                        <div
                          class="phone-input-title"
                          :style="{
                            color: productToShowIngredients.itemIn.needToMakeObject.needToMake
                              ? 'red'
                              : undefined
                          }"
                        >
                          <!-- {{ $tkey('ToMake') }} -->
                        </div>
                        <div style="width: 100%; margin-left: auto; padding-top: 1px;">
                          <span
                            :style="{
                              color: productToShowIngredients.itemIn.needToMakeObject.needToMake
                                ? 'red'
                                : undefined,
                              fontWeight: productToShowIngredients.itemIn.needToMakeObject
                                .needToMake
                                ? 'bold'
                                : undefined
                            }"
                          >
                            +
                            {{
                              productToShowIngredients.itemIn.needToMakeObject.newNeedToMake || 0
                            }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style="font-size: small;">{{ $tkey('BatchQuantityProjected') }}</div>
                  </div>
                </div>
              </div>

              <div
                v-if="
                  productToShowIngredients.tile.packCount > 0 &&
                    productToShowIngredients.tile.packCount !== 1
                "
                style="display: inline-block;"
                class="phone-edit-row-item tiles"
              >
                <div>
                  <div
                    style="text-align: center; width: 100%;
                      margin-right: auto;
                      margin-left: auto;
                      display: inline-block;"
                  >
                    <div class="tile-icon">
                      <div class="fa fa-exchange" style="color : black;"></div>
                    </div>
                    <div class="tile-title">
                      <b>{{ $tkey('PackCount') }} </b>
                    </div>
                  </div>
                  <div style="font-size: larger;">
                    {{ productToShowIngredients.tile.packCount }} : 1
                  </div>
                  <div style="font-size: small">
                    {{ $tkey('ProductionUnits') }} : {{ $tkey('PackSold') }}
                  </div>
                </div>
              </div>
              <div
                v-if="productToShowIngredients.tile.likeProduct"
                style="display: inline-block;"
                class="phone-edit-row-item tiles"
              >
                <div>
                  <div
                    style="text-align: center; width: 100%;
                      margin-right: auto;
                      margin-left: auto;
                      display: inline-block;"
                  >
                    <div class="tile-title-product-fcst">
                      <b>{{ $tkey('likeProductForecast') }} </b>
                    </div>
                  </div>
                  <div style="font-size: larger;">
                    {{ productToShowIngredients.tile.likeProduct }}
                  </div>
                  <!-- <div style="font-size: small">
                    {{ $tkey('ProductionUnits') }} : {{ $tkey('PackSold') }}
                  </div> -->
                </div>
              </div>
              <div
                v-if="productToShowIngredients.tile.likeStore"
                style="display: inline-block;"
                class="phone-edit-row-item tiles"
              >
                <div>
                  <div
                    style="text-align: center; width: 100%;
                      margin-right: auto;
                      margin-left: auto;
                      display: inline-block;"
                  >
                    <!-- <div class="tile-icon">
                      <div class="fa fa-exchange" style="color : black; float:left"></div>
                    </div> -->
                    <div class="tile-title-store-fcst">
                      <b>{{ $tkey('likeStoreForecast') }} </b>
                    </div>
                  </div>
                  <div style="font-size: larger;">
                    {{ productToShowIngredients.tile.likeStore }}
                  </div>
                  <!-- <div style="font-size: small">
                    {{ $tkey('ProductionUnits') }} : {{ $tkey('PackSold') }}
                  </div> -->
                </div>
              </div>

              <!-- v-if="productToShowIngredients.tile.daysToBatch !== null && productToShowIngredients.tile.daysToBatch > 1" -->

              <div
                v-if="
                  productToShowIngredients.tile.daysToBatch !== null &&
                    productToShowIngredients.tile.daysToBatch > 1 &&
                    dynamicBatchQuantity !== null
                "
                style="display: inline-block;"
                class="phone-edit-row-item tiles"
              >
                <div>
                  <div
                    style="text-align: center; width: 100%;
                      margin-right: auto;
                      margin-left: auto;
                      display: inline-block;"
                  >
                    <div class="tile-title">
                      <b>{{ $tkey('dinamycBatch') }}</b>
                    </div>
                  </div>
                  <b
                    v-if="
                      productToShowIngredients.itemIn.recQty >
                        productToShowIngredients.itemIn.candidateInventory
                    "
                    ><div style="font-size: larger; margin-top:5px; margin-bottom: 10px; color:red">
                      + {{ productToShowIngredients.itemIn.dynamicBatchQuantity }}
                    </div></b
                  >
                  <div
                    v-if="
                      productToShowIngredients.itemIn.recQty >
                        productToShowIngredients.itemIn.candidateInventory
                    "
                    style="font-size: small"
                  >
                    {{ $tkey('dinamycBatchApplied') }}
                    {{ productToShowIngredients.tile.daysToBatch }}
                    {{ $tkey('dinamycBatchApplied2') }}
                  </div>
                  <div
                    v-else-if="
                      productToShowIngredients.itemIn.recQty <=
                        productToShowIngredients.itemIn.candidateInventory
                    "
                    style="font-size: small"
                  >
                    {{ $tkey('dinamycBatchNotApplied') }}
                  </div>
                </div>
              </div>
              <div
                v-if="productToShowIngredients.itemIn.flexForecastAdjustment !== null"
                style="display: inline-block;"
                class="phone-edit-row-item tiles"
              >
                <div>
                  <div
                    style="text-align: center; width: 100%;
                      margin-right: auto;
                      margin-left: auto;
                      display: inline-block;"
                  >
                    <div class="tile-title">
                      <b>{{ $tkey('flexScheduling') }}</b>
                    </div>
                  </div>
                  <b
                    ><div style="font-size: larger; margin-top:5px; margin-bottom: 10px; color:red">
                      + {{ productToShowIngredients.itemIn.flexForecastAdjustment }}
                    </div></b
                  >
                  <div style="font-size: small">
                    {{ $tkey('flexSchedulingText') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="productToShowIngredients.promotions.length > 0">
          <h5
            style="margin-bottom: 10px; margin-left:10px;width: 100%; display: inline-block;"
            class="mt-4"
          >
            <b>{{ $tkey('Promotions') }}</b>
          </h5>
        </div>

        <div
          v-if="productToShowIngredients.promotions.length > 0"
          style="text-align: center;  margin-right: auto; margin-left: auto;  margin-top: 10px;"
        >
          <div
            style="text-align: center;  border-radius: 25px; width: 100%;
              margin-right: auto;
              margin-left: auto;
              display: inline-block;"
          >
            <div class="promotion-container">
              <div
                style="display: inline-block;"
                class="phone-edit-row-item promotion"
                v-for="promotion in productToShowIngredients.promotions"
              >
                <div
                  :class="
                    promotion.promoStartDate || promotion.promoEndDate
                      ? 'promo-desc-with-date'
                      : 'promo-desc'
                  "
                >
                  <b>{{ promotion.promoDescription }}</b>
                </div>
                <div v-if="promotion.promoStartDate || promotion.promoEndDate" class="promo-date">
                  <div style="float: left; width: 45%;">
                    <div style="margin-bottom: 5px;">
                      {{ $tkey('Start') }}
                    </div>
                    <div v-if="promotion.promoStartDate">
                      <b>{{ formatDatePromotions(promotion.promoStartDate, locale) }}</b>
                    </div>
                    <div v-else>
                      <b>N/A</b>
                    </div>
                  </div>
                  <div style="float: left; width: 10%;">
                    <div style="margin-top:1px; margin-bottom: 5px;">
                      <b>&#x2015;</b>
                    </div>
                  </div>
                  <div style="float: left; width: 45%;">
                    <div style="margin-bottom: 5px;">
                      {{ $tkey('End') }}
                    </div>
                    <div v-if="promotion.promoEndDate">
                      <b>{{ formatDatePromotions(promotion.promoEndDate, locale) }}</b>
                    </div>
                    <div v-else>
                      <b>N/A</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- <div class="horizontal-scroll-wrapper">
        
              <div
              style="border-radius: 25px; "
                class="phone-edit-row-item promotion-b"
                v-for="promotion in productToShowIngredients.promotions"
              >
                <div
                  style="text-align: center; width: 100%;
                      margin-right: auto;
                      margin-left: auto;
                      display: inline-block;"
                >
                  <b>{{ promotion.promoDescription }}</b>
                </div>
                <div
                  style="font-size:small"
                  v-if="promotion.promoStartDate && promotion.promoEndDate"
                >
                  {{ promotion.promoStartDate }} - {{ promotion.promoEndDate }}
                </div>
              </div>
           
        </div> -->

        <div
          v-if="$route.path.toLowerCase().indexOf('plan-builder') > 0"
          style="text-align: center; width: 100%; margin-right: auto; margin-left: auto; float:left; margin-top: 10px; margin-bottom: 10px;"
        >
          <div
            style="text-align: center;  border-radius: 25px; width: fit-content;
            margin-right: auto;
            margin-left: auto;
             display: inline-block;"
          >
            <div
              style="display: flex; border-radius: 25px; background-color: #f2f2f2; margin-bottom: 10px;"
            >
              <div
                @click="setProductTableMode('past')"
                :class="
                  productToShowIngredients.productTableMode === 'past'
                    ? 'selected-product-table-selector-button'
                    : ''
                "
                class="product-table-selector-button "
              >
                {{ $tkey('pastPerformance') }}
              </div>
              <div
                @click="setProductTableMode('upcoming')"
                :class="
                  productToShowIngredients.productTableMode === 'upcoming'
                    ? 'selected-product-table-selector-button'
                    : ''
                "
                class="product-table-selector-button "
              >
                {{ $tkey('upcomingProd') }}
              </div>
            </div>
          </div>

          <table
            v-if="
              productToShowIngredients.upcomingProd &&
                productToShowIngredients.productTableMode === 'upcoming'
            "
            class="table header-fixed product-inventory-table-phone"
          >
            <thead>
              <tr class="generic-table-top-header" style="background-color: #5c5c5c !important;">
                <th class="date-product-phone product-modal-table-header">
                  <div>
                    {{ $tkey('dateOfProduction') }}
                  </div>
                </th>
                <th class="product-key-phone product-modal-table-header">
                  <div>
                    {{ $tkey('planCode') }}
                  </div>
                </th>
                <th class="fcst-phone product-modal-table-header">
                  <div>
                    {{ $tkey('Fcast') }}
                  </div>
                </th>
                <th class="description-phone product-modal-table-header">
                  <div>
                    {{ $tkey('totalNeed') }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody v-if="productToShowIngredients.upcomingProd">
              <template v-for="upcoming in productToShowIngredients.upcomingProd">
                <tr style="font-size: smaller;" :style="{ opacity: 1.0 }">
                  <td class="date-product-phone">
                    <div style="margin-bottom: 10px;">
                      {{ formatDatePastUpcomingTable(upcoming.dateOfProduction, locale) }}
                    </div>
                    <!-- <div>
                          Group: <b>{{ item.productGroupName }}</b>
                        </div> -->
                  </td>
                  <td class="product-key-phone">
                    <div style="margin-bottom: 10px;">
                      {{ upcoming.planCode }}
                    </div>
                    <!-- <div>
                          Group: <b>{{ item.productGroupName }}</b>
                        </div> -->
                  </td>
                  <td class="fcst-phone">
                    <div style="margin-bottom: 10px;">
                      {{ upcoming.Fcast }}
                    </div>
                  </td>
                  <td class="description-phone">
                    <div style="margin-bottom: 10px;">
                      {{ upcoming.totalNeed }}
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
          <table
            v-if="
              productToShowIngredients.pastPerformance &&
                productToShowIngredients.productTableMode === 'past'
            "
            class="table header-fixed product-inventory-table-phone"
          >
            <thead>
              <tr class="generic-table-top-header" style="background-color: #5c5c5c !important;">
                <th class="date-product-phone product-modal-table-header">
                  <div>
                    {{ $tkey('dateOfProduction') }}
                  </div>
                </th>
                <th class="override-key-phone product-modal-table-header">
                  <div></div>
                </th>
                <th class="shrink-key-phone product-modal-table-header">
                  <div>
                    {{ $tkey('Fcast') }}
                  </div>
                </th>
                <th class="shrink-key-phone product-modal-table-header">
                  <div>
                    {{ $tkey('Prod') }}
                  </div>
                </th>
                <th class="shrink-key-phone product-modal-table-header">
                  <div>
                    {{ $tkey('Sales') }}
                  </div>
                </th>
                <th class="shrink-key-phone product-modal-table-header">
                  <div>
                    {{ $tkey('Shrink') }}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody v-if="productToShowIngredients.pastPerformance">
              <template v-for="past in productToShowIngredients.pastPerformance">
                <tr style="font-size: small;" :style="{ opacity: 1.0 }">
                  <td class="date-product-phone">
                    <div style="margin-bottom: 10px;">
                      {{ formatDatePastUpcomingTable(past.date, locale) }}
                    </div>
                    <!-- <div>
                          Group: <b>{{ item.productGroupName }}</b>
                        </div> -->
                  </td>
                  <td class="override-key-phone">
                    <div
                      class="override-point"
                      :style="
                        past.override === 'good'
                          ? 'background: green'
                          : past.override === 'bad'
                          ? 'background: red'
                          : past.override === 'neutral'
                          ? 'background: #ffc107'
                          : 'background: #f7f7f7'
                      "
                    ></div>
                    <!-- <div>
                          Group: <b>{{ item.productGroupName }}</b>
                        </div> -->
                  </td>
                  <td class="fcst-phone">
                    <div style="margin-bottom: 10px;">
                      {{ past.forecast }}
                    </div>
                  </td>
                  <td class="shrink-key-phone">
                    <div style="margin-bottom: 10px;">
                      {{ past.production }}
                    </div>
                  </td>
                  <td class="shrink-key-phone">
                    <div style="margin-bottom: 10px;">
                      {{ past.sales }}
                    </div>
                  </td>
                  <td class="shrink-key-phone">
                    <div style="margin-bottom: 10px;">
                      {{ past.shrink }}
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Recipe -->
    <template v-if="productToShowIngredients.recipe && modalMode === 'recipe'">
      <!-- <div class="expander-row" @click="toggleRecipeExpander()">
        <div class="expander-container">
          <i v-if="!recipeExpanded" class="fa fa-caret-right my-expander" />
          <i v-if="recipeExpanded" class="fa fa-caret-down my-expander" />
        </div>
        <div class="expander-text-container">
          {{ $tkey('Recipe') }}
        </div>
      </div> -->
      <div
        v-if="productToShowIngredients.recipe && modalMode === 'recipe'"
        class="recipe-body-container"
      >
        <!-- recipe -->
        <div v-if="productToShowIngredients.recipe">
          <div v-if="recipeLink">
            <div style="padding: 10px;">
              <b>{{ $tkey('LinkedFile') }}</b>
            </div>
            <button
              :title="getValidUrl(recipeLink)"
              class="btn btn-secondary"
              style="min-width: 100px;"
              @click="openRecipeLink(recipeLink)"
            >
              {{ $tkey('ClickToOpenANewWindow') }}
            </button>
            <div class="p-2 pt-3">
              <i>{{ $tkey('LastUpdated') + ': ' + lastModifiedDateTimeDisplay }}</i>
            </div>
            <hr />
          </div>

          <div v-if="recipeContent" class="ql-container ql-snow">
            <div class="ql-editor" v-html="recipeContent" />
          </div>
        </div>
      </div>
    </template>

    <template v-if="productToShowIngredients.ingredients.length && modalMode === 'ingredients'">
      <!-- <div class="expander-row" @click="toggleIngredientsExpander()">
        <div class="expander-container">
          <i v-if="!ingredientsExpanded" class="fa fa-caret-right my-expander" />
          <i v-if="ingredientsExpanded" class="fa fa-caret-down my-expander" />
        </div>
        <div class="expander-text-container" v-if="nav.marketKey === 10 || nav.marketKey === 20">
          {{ $tkey('IngredientList') }}
        </div>
        <div class="expander-text-container" v-if="nav.marketKey !== 10 && nav.marketKey !== 20">
          {{ $tkey('PickList') }}
        </div>
      </div> -->
      <div v-if="nav.screenMode === 'normal'" style="padding-left: 15px; padding-right: 15px;">
        <!-- <h4 style="display: inline-block;" v-if="nav.marketKey === 10 || nav.marketKey === 20">
          {{ $tkey('IngredientList') }}
        </h4>
        <h4 style="display: inline-block;" v-if="nav.marketKey !== 10 && nav.marketKey !== 20">
          {{ $tkey('PickList') }}
        </h4> -->
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
              :style="{
                borderBottom: ingredient.dividerOnBottom ? '2px solid #999999' : undefined
              }"
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
      <div
        v-else-if="productToShowIngredients.ingredients.length && modalMode === 'ingredients'"
        class="ingredients-body-container"
      >
        <table
          style="width: 100%; margin-right: auto;
    margin-left: auto;"
          class="phone-ingred-table"
        >
          <thead>
            <tr>
              <th class="generic-table-header left big-left-col">
                {{ $tkey('Item') }}
              </th>
              <th class="generic-table-header right small-right-col">
                {{
                  productToShowIngredients.allItemsHaveSingleQuantities
                    ? $tkey('PerUnit')
                    : '&nbsp;'
                }}
              </th>
              <th class="generic-table-header right small-right-col">{{ $tkey('Total') }}&nbsp;</th>
            </tr>
          </thead>
          <!-- phone ingreds modal -->
          <tbody>
            <template v-for="ingredient in productToShowIngredients.ingredients">
              <tr>
                <td colspan="3" class="left">
                  <b class="phone-ingred-text">{{ ingredient.ingredientDesc }}</b>
                </td>
              </tr>
              <tr style="border-bottom: 2px solid #999999">
                <!-- displayCategory aka department -->
                <td class="left big-left-col">
                  <span class="phone-ingred-text">{{ ingredient.displayCategory }}</span>
                  <span v-if="ingredient.upc" class="upc-lowlight">({{ ingredient.upc }})</span>
                </td>
                <td
                  v-if="productToShowIngredients.allItemsHaveSingleQuantities"
                  class="right small-right-col"
                >
                  <span class="phone-ingred-text"
                    >{{ ingredient.ingredientQuantity }}&nbsp;{{
                      formatLowerCase(ingredient.ingredientUnitOfMeasure)
                    }}</span
                  >
                </td>
                <td v-else class="right small-right-col">
                  &nbsp;
                </td>
                <td class="right small-right-col">
                  <span class="phone-ingred-text"
                    >{{ formatFraction(ingredient.total) }}&nbsp;{{
                      formatLowerCase(ingredient.ingredientUnitOfMeasure)
                    }}</span
                  >
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <i v-if="nav.marketKey === 10 || nav.marketKey === 20" class="phone-footer-text">{{
          $tkey('ingredientsFooter')
        }}</i>
      </div>
    </template>

    <template
      v-if="productToShowIngredients.rowSupportsInventoryLog && modalMode === 'inventory-log'"
    >
      <!-- <div class="expander-row" @click="toggleInventoryExpander()">
        <div class="expander-container">
          <i v-if="!inventoryExpanded" class="fa fa-caret-right my-expander" />
          <i v-if="inventoryExpanded" class="fa fa-caret-down my-expander" />
        </div>
        <div class="expander-text-container">
          {{ $tkey('InventoryLog') }}
        </div>
      </div> -->
      <div v-if="nav.screenMode === 'normal'" style="padding-left: 15px; padding-right: 15px;">
        <!-- <div>
          <h4 style="display: inline-block;">{{ $tkey('InventoryLog') }}</h4>
          <span style="color: #777; font-size: 1em;">{{
            productToShowIngredients.loadingTaskInventoryLog ? $tkey('loadingDotDotDot') : ''
          }}</span>
        </div> -->
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
      <div
        v-else-if="
          productToShowIngredients.rowSupportsInventoryLog && modalMode === 'inventory-log'
        "
        class="inventory-body-container"
      >
        <span
          v-if="productToShowIngredients.loadingTaskInventoryLog"
          style="color: #777; font-size: 0.6em;"
          >{{ $tkey('loadingDotDotDot') }}
        </span>

        <table
          v-else
          style="width: 100%; margin-right: auto;
    margin-left: auto;"
          class="phone-inventory-table"
        >
          <thead>
            <tr>
              <th class="generic-table-header left big-left-col">
                {{ $tkey('Time') }}
              </th>
              <th class="generic-table-header right small-right-col">
                {{ $tkey('Inventory') }}&nbsp;
              </th>
            </tr>
          </thead>
          <!-- phone ingreds modal -->
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
            <template v-for="invLog in productToShowIngredients.taskInventoryLog">
              <tr>
                <td colspan="100" class="left">
                  <b class="phone-ingred-text">{{ invLog.displayDateTime }}</b>
                </td>
              </tr>

              <tr style="border-bottom: 2px solid #999999">
                <td class="left big-left-col">
                  <span class="phone-ingred-text">{{ invLog.source }} / {{ invLog.details }}</span>
                </td>
                <td class="right small-right-col">
                  <span class="phone-ingred-text">{{ invLog.inventory }}&nbsp;</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="productToShowIngredients.rowSupportsNeedLog && modalMode === 'need-log'">
      <!-- <div class="expander-row" @click="toggleNeedLogExpander()">
        <div class="expander-container">
          <i v-if="!needLogExpanded" class="fa fa-caret-right my-expander" />
          <i v-if="needLogExpanded" class="fa fa-caret-down my-expander" />
        </div>
        <div class="expander-text-container">
          {{ $tkey('NeedLog') }}
        </div>
      </div> -->
      <div v-if="nav.screenMode === 'normal'" style="padding-left: 15px; padding-right: 15px;">
        <!-- <div>
          <h4 style="display: inline-block;">{{ $tkey('NeedLog') }}</h4>
        </div> -->
        <div>
          <table class="table need-log-table-normal mt-3">
            <thead>
              <tr>
                <th class="generic-table-header left date">{{ $tkey('Date') }}</th>
                <th class="generic-table-header left plan">{{ $tkey('PlanName') }}</th>
                <th class="generic-table-header left rec-qty">{{ $tkey('RecQty') }}</th>
                <th class="generic-table-header left override-y-n">
                  {{ $tkey('BuilderOverride') }}
                </th>
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
      <div
        v-else-if="productToShowIngredients.rowSupportsNeedLog && modalMode === 'need-log'"
        class="need-log-body-container"
      >
        <table
          class="need-log-table"
          style="margin-right: auto;
    margin-left: auto;"
        >
          <thead>
            <tr>
              <th class="generic-table-header need-log-th rec-qty">
                {{ $tkey('RecQty') }}
              </th>
              <th class="generic-table-header need-log-th override-y-n">
                {{ $tkey('BuilderOverride') }}
              </th>
              <th class="generic-table-header need-log-th produced-qty">
                {{ $tkey('ProducedQty') }}
              </th>
              <th class="generic-table-header need-log-th deleted">
                {{ $tkey('Deleted') }}
              </th>
              <!--            <th class="generic-table-header left date">{{ $tkey('Date') }}</th>-->
              <!--            <th class="generic-table-header left plan">{{ $tkey('PlanName') }}</th>-->
              <!--            <th class="generic-table-header left override-time">{{ $tkey('OverrideTime') }}</th>-->
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
            <template
              style="margin-right: auto;
    margin-left: auto;"
              v-for="needLog in productToShowIngredients.needLog"
            >
              <tr>
                <td colspan="100" class="left" style="padding-bottom: 0;">
                  <b class="need-log-text">{{ needLog.dateOfProduction }}</b>
                  |
                  <b class="need-log-text">{{ needLog.planCode }}</b>
                </td>
              </tr>
              <tr style="border-bottom: 2px solid #999999">
                <td class="lower-row rec-qty">
                  {{ needLog.recommendedQuantity }}
                </td>
                <td class="lower-row override-y-n">
                  {{ needLog.builderOverride || '-' }}
                </td>
                <td class="lower-row produced-qty">
                  {{ needLog.producedQuantity }}
                </td>
                <td class="lower-row deleted">
                  {{ needLog.isDeleted !== 'No' ? needLog.displayDeletedTime : needLog.isDeleted }}
                </td>
                <!--            <td class="date">{{ needLog.dateOfProduction }}</td>-->
                <!--            <td class="plan">{{ needLog.planCode }}</td>-->
                <!--            <td class="override-time">{{ needLog.builderOverrideDateTime }}</td>-->
              </tr>
            </template>
          </tbody>
        </table>
        <i class="phone-footer-text">{{ $tkey('needLogFooter') }}</i>
      </div>
    </template>

    <!-- Inventory Log-->

    <!-- Need Log-->
  </div>
</template>
<i v-else class="fa fa-spinner fa-spin spinner" />

<style scoped lang="scss">
@import '../../../style/base/_variables.scss';
@import '../../../style/components/_table.scss';

.mode-selector-button {
  cursor: pointer;
  padding: 10px 35px 10px 35px;
  // background-color: #343a40; // Same as modal title row
  color: black;
  font-weight: 500;
  border-radius: 25px;
  background-color: #f2f2f2;
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

.expander-row {
  background-color: #d7d7d7;
  padding-top: 6px;
  padding-bottom: 6px;
}

.expander-container {
  display: inline-block !important;
  padding: 5px 5px 5px 10px;
  min-width: 2.2em;
  //background-color: #dfd;
}
.expander-text-container {
  display: inline-block;
  font-size: 1.5em;
  color: black;
  //background-color: aliceblue;
}

.my-expander {
  color: black;
  //background-color: yellow;
  font-size: 2em;
}

.product-body-container {
  padding: 8px;
}
.recipe-body-container {
  padding: 8px;
}

.ingredients-body-container {
  padding: 8px;
}

.inventory-body-container {
  padding: 8px;
}
.need-log-body-container {
  padding: 8px;
}
.phone-ingred-table {
  .big-left-col {
    width: 50%;
  }
  .small-right-col {
    width: 24%;
  }
}
.phone-inventory-table {
  .big-left-col {
    width: 75%;
  }
  .small-right-col {
    width: 23%;
  }
}
.need-log-table-normal {
  .date {
    width: 15%;
  }
  .plan {
    width: 14%;
  }
  .rec-qty {
    width: 10%;
    text-align: center;
  }
  .override-y-n {
    width: 16%;
    text-align: center;
  }
  .override-time {
    width: 22%;
    text-align: left;
  }
  .deleted {
    width: 10%;
    text-align: center;
  }
  .produced-qty {
    width: 13%;
    text-align: center;
  }
}
.need-log-table {
  //.date {
  //  width: 15%;
  //}
  //.plan {
  //  width: 25%;
  //}
  .rec-qty {
    width: 25%;
    text-align: center;
  }
  .override-y-n {
    width: 25%;
    text-align: center;
  }
  //.override-time {
  //  width: 25%;
  //  text-align: left;
  //}
  .deleted {
    width: 25%;
    text-align: center;
  }
  .produced-qty {
    width: 25%;
    text-align: center;
  }
  .lower-row {
    border-top: 0px solid transparent;
    padding: 0 0 5px 0;
    font-size: 0.85em;
  }
  .need-log-th {
    vertical-align: top;
  }
}
.phone-source-details {
  color: #999;
  font-size: 0.8em;
}
.phone-ingred-text {
  font-size: 0.85em;
}

.need-log-text {
  font-size: 0.85em;
}

.parity-desc-text {
  font-size: 0.85em;
}
.phone-footer-text {
  font-size: 0.8em;
}
.phone-input-title {
  text-align: center;
  font-size: 0.8em;
  width: 100%;
  margin-bottom: 2px;
}
.phone-edit-row-item {
  width: 7.75em;
  text-align: center;
  vertical-align: top;
  //border: 1px solid magenta;
  display: inline-block;
}
.pill {
  padding: 5px 10px 5px 10px;
  // background-color: #343a40; // Same as modal title row
  font-size: small;
  width: 150px;
  border-radius: 25px;
  margin-bottom: 10px;
  color: white;
  display: inline-block;
  margin-left: 10px;
  margin-right: 10px;
}
.promotion-container {
  border-radius: 25px;
  margin-bottom: 10px;
  overflow-x: auto;
  white-space: nowrap;
}

.promotion {
  background-color: #fdfdfd;
  border-radius: 8px;
  border-color: #fdfdfd;
  border-style: solid;
  box-shadow: 2px 2px 10px #888888;
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 20px;
  margin-bottom: 10px;
  white-space: normal;
  height: 120px;
  width: 150px;
}
.promo-desc-with-date {
  text-align: center;
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  display: inline-block;
  font-size: 14px;
}

.promo-desc {
  text-align: center;
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  display: inline-block;
  font-size: 14px;
  margin-top: 46px;
}

.promo-date {
  font-size: small;
  background: #f3f3f3;
  border-radius: 8px;
  display: flex;
}

.promotion-b {
  background-color: #fdfdfd;
  border-radius: 8px;
  border-color: #fdfdfd;
  border-style: solid;
  box-shadow: 2px 2px 10px #888888;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 80px;
  margin-top: 30px;
  width: 150px;
}
.tile-icon {
  float: left;
  font-size: larger;
  width: 95%;
  margin-left: auto;
  margin-right: auto;
}
.tile-title {
  float: left;
  width: 95%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
.tile-title-store-fcst {
  float: left;
  width: 95%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
.tile-title-product-fcst {
  float: left;
  width: 95%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
.tiles {
  width: 150px;
  height: 170px;
  margin-left: 10px;
  margin-bottom: 10px;
  margin-top: 30px;
  background-color: #fdfdfd;
  border-radius: 8px;
  border-color: #fdfdfd;
  border-style: solid;
  box-shadow: 2px 2px 10px #888888;
  white-space: normal;
}

.product-table-selector {
  // background-color: #343a40; // Same as modal title row

  border-radius: 25px;
}
.product-table-selector-button {
  cursor: pointer;
  padding: 5px 15px 5px 15px;
  // background-color: #343a40; // Same as modal title row
  color: black;
  font-weight: 500;
  border-radius: 25px;
  background-color: #f2f2f2;
}
.product-table-selector-button:hover {
  background-color: #3a4249; // Same as modal title row
}
.selected-product-table-selector-button {
  background-color: black;
  color: white;
}
.selected-product-table-selector-button:hover {
  background-color: #111111;
}
.product-modal-table-header {
  border-top-color: #5c5c5c;
  border-bottom-color: #5c5c5c;
  margin-top: 0;
  margin-bottom: 0;
  font-size: small;
}
.product-inventory-table-phone {
  .header-div {
    padding-left: 12px;
  }
  .inventory-filter {
    padding-left: 10px;
  }
  .product-key {
    width: 20%;
    float: left;
    border-bottom-color: #5c5c5c;
    padding-left: 32px;
  }
  .date-product-phone {
    width: 28%;
    float: left;
    font-size: small;

    border-bottom-color: #5c5c5c;
  }
  .product-key-phone {
    font-size: small;
    width: 25%;
    float: left;
    border-bottom-color: #5c5c5c;
  }
  .override-key-phone {
    width: 5%;
    float: left;
    border-bottom-color: #5c5c5c;
  }
  .override-point {
    margin-bottom: 10px;
    float: left;
    width: 12px;
    height: 12px;
    margin: 5px;
    border-radius: 25px;
  }
  .shrink-key-phone {
    width: 15%;
    float: left;
    border-bottom-color: #5c5c5c;
  }
  .product-key-phone-filter {
    float: left;
    border: white;
  }

  .description {
    width: 30%;
    float: left;
    border-bottom-color: #5c5c5c;
  }
  .description-phone {
    width: 30%;
    float: left;
    border-bottom-color: #5c5c5c;
  }
  .fcst-phone {
    width: 15%;
    float: left;
    border-bottom-color: #5c5c5c;
  }

  .plan-family {
    width: 20%;
    float: left;
    border-bottom-color: #5c5c5c;
    padding-left: 32px;
  }

  .product-group {
    width: 20%;
    float: left;
    border-bottom-color: #5c5c5c;
  }

  .inventory {
    width: 10%;
    float: left;
    border-bottom-color: #5c5c5c;
  }
  .inventory-phone {
    width: 20%;
    float: left;
    border: white;
  }
  tr:nth-child(1) {
    background-color: white !important;
  }
  tr:nth-child(even) {
    background-color: #f2f3f4;
  }
}
.horizontal-scroll-wrapper {
  display: block;
  margin: 0;
  overflow-y: auto;
  overflow-x: hidden;
  transform: rotate(-90deg);
  width: 200px;
  max-height: 341px;
  position: relative;
  margin-left: auto;
  margin-right: auto;
}
.horizontal-scroll-wrapper > div {
  display: block;
  padding: 5px;
  transform: rotate(90deg);
}

.inventory-log-table {
  .time {
    width: 30%;
  }
  .inventory {
    width: 5%;
  }
  .source {
    width: 15%;
  }
  .details {
    width: 50%;
    text-align: left;
  }
}
// ::-webkit-scrollbar{width:2px;height:2px;}
// ::-webkit-scrollbar-button{width:2px;height:2px;}
</style>

<script src="./phone-everything-modal.js"></script>
