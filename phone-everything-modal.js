import navigation from '@/js/navigation';
import toolCommon from '@/js/tool-common';
import planUtils from '@/js/plan-utils';
import { initI18n } from '@/js/vue-i18n';
import moment from 'moment';

import bootbox from 'bootbox'; // Requires 'bootstrap' as above.
import _ from 'lodash';

export default {
  localizationKey: 'components._common.phone-everything-modal',
  props: [
    'productToShowIngredients',
    'productToShowIngredientsTitle',
    'lastModifiedDateTimeDisplay',
    'recipeLink',
    'recipeContent',
    'params',
    'plan', // Contains modalMode, which can be changed by this modal (base vue props cannot be changed directly).
    'locale',
  ],
  data() {
    return {
      nav: navigation,
      recipeExpanded: false,
      ingredientsExpanded: false,
      inventoryExpanded: false,
      needLogExpanded: false,
      candidateInventoryModal: 0,
    };
  },
  methods: {
    productImageVisible() {
      return (
        this.productToShowIngredients.itemIn.productSummary.imageURL &&
        this.productToShowIngredients.itemIn.productSummary.imageURL.trim() !== '' &&
        this.productToShowIngredients.itemIn.productSummary.haveImage
      );
    },
    setModalMode(modalMode) {
      this.params.modalMode = modalMode;
    },
    setProductTableMode(mode) {
      this.productToShowIngredients.productTableMode = mode;
    },
    getValidUrl(link) {
      let url = link;
      if (url && url.length > 3) {
        const firstThreeLetters = url.slice(0, 3).toUpperCase();
        if (firstThreeLetters === 'WWW') {
          url = `https://${url}`;
        }
      }
      return url;
    },
    openRecipeLink(recipeLink) {
      const url = this.getValidUrl(recipeLink);
      console.log(`Opening: ${url}`);
      window.open(url, '_blank');
    },
    bootboxAlert(message) {
      bootbox.alert({ message });
    },
    toggleRecipeExpander() {
      this.recipeExpanded = !this.recipeExpanded;
    },
    toggleIngredientsExpander() {
      this.ingredientsExpanded = !this.ingredientsExpanded;
    },
    toggleInventoryExpander() {
      this.inventoryExpanded = !this.inventoryExpanded;
    },
    toggleNeedLogExpander() {
      this.needLogExpanded = !this.needLogExpanded;
    },
    pulseNow() {
      toolCommon.pulse();
    },
    notifyOptimalNumbers: function(item) {
      this.$root.$emit('notify-optimal-numbers', item);
    },
    getOptimalNumbersTooltipText: function(item) {
      this.$root.$emit('get-optimal-numbers-tooltip', item);
    },

    submitNewInventory: function(item) {
      this.$root.$emit('submit-iventory', item);

      // this.hideKeyboard();
      // if (this.plan.isExpired) {
      //   return; // GUI should disable the control when plan is expired. This is the emergency backup.
      // }
      // if (!planUtils.positiveInteger(item.candidateInventory)) {
      //   item.candidateInventory = item.inventory;
      //   this.bootboxAlert(this.$tkey('invalidValue'));
      //   // this.$refs.invalidOverride.show();
      // } else {
      //   if (
      //     item.candidateInventory > item.inventoryMaxThreshold &&
      //     (item.inventoryMaxThreshold !== 0 && item.inventoryMaxThreshold !== null)
      //   ) {
      //     this.candidateInventoryModal = item.candidateInventory;
      //     this.bootboxAlert(
      //       this.$tkey('inventoryWarningThreshold') + this.candidateInventoryModal + ')'
      //     );
      //     // this.$refs.inventoryMaxThresholdModal.show();
      //     item.candidateInventory = item.inventory;
      //   } else if (
      //     item.candidateInventory > item.inventoryWarningThreshold &&
      //     (item.inventoryWarningThreshold !== 0 && item.inventoryWarningThreshold !== null)
      //   ) {
      //     this.candidateInventoryModal = item.candidateInventory;
      //     // NEEDS TO SOLVE HOW TO SHOW THIS; probably will have to use b-modals not just alerts
      //     this.$refs.inventoryWarningThresholdModal.show();
      //     this.newInvItem = item;
      //   } else {
      //     this.setInventory(item);
      //   }
      //   // Just update the inventory...
      // }
    },
    cancelSetInventory() {
      this.newInvItem.candidateInventory = this.newInvItem.inventory;
    },
    // setInventory: function(item) {

    //   this.$root.$emit('submit-iventory', item);

    //   const newInventory = {
    //     inventory: planUtils.getInteger(item.candidateInventory),
    //     storeKey: item.storeKey,
    //     productKey: item.UPC,
    //     marketKey: item.marketKey,
    //     dateOfRecording: item.dateNav,
    //     timeOfRecording: toolCommon.getHourMinInDecimals(),
    //     source: 'U', // user entered inventory
    //   };

    //   item.rowIsUpdatingCurrentInventory = true;
    //   this.$http.post(`/api/inventory/`, newInventory).then(() => {
    //     // Local updates.
    //     item.inventory = item.candidateInventory;
    //     item.marketKey = this.marketKey;
    //     console.log(item.candidateInventory);
    //     console.log(item.inventory);
    //     // update the original data as well
    //     // const itemIndex = _.findIndex(this.rows, r => r.itemId === item.itemId);
    //     // this.rows[itemIndex].candidateInventory = item.candidateInventory;
    //     // this.rows[itemIndex].inventory = item.candidateInventory;
    //     // this.rows[itemIndex].marketKey = this.marketKey;
    //     // this.setItemQuantities(this.rows[itemIndex]);

    //     // this.setItemQuantities(item);
    //     // if (
    //     //   this.derivativeProductsBySecondary[item.productKey] ||
    //     //   this.derivativeProductsByPrimary[item.productKey]
    //     // ) {
    //     //   //OLD_DERIVATIVE_TO_REMOVE
    //     //   // If this is part of a derivative product pair, we need to reattach to make sure that
    //     //   // the rec qty maintains its proper value.
    //     //   this.attachDerivativeProducts();
    //     // }
    //     // item.inventoryWasChanged = true;
    //     // item.rowIsUpdatingCurrentInventory = false;
    //   });
    // },
    // hideKeyboard() {
    //   // DRB Oct 17, 2021. Hide the mobile numeric keyboard on pressing Go. Only needed on android?
    //   // Near the end, on the vue question: https://stackoverflow.com/questions/8335834/how-can-i-hide-the-android-keyboard-using-javascript
    //   if (
    //     window.navigator.platform !== 'iPad' &&
    //     window.navigator.platform !== 'MacIntel' &&
    //     this.nav.screenMode === 'phone'
    //   ) {
    //     document.activeElement.blur();
    //   }
    // },
    // Keep - uncomment if we want to remember what items are expanded.
    // toggleRecipeExpander() { this.recipeExpanded = !this.recipeExpanded; localStorage.setItem(this.getExpanderKey('recipe'), this.recipeExpanded ? 'y' : 'n');},
    // toggleIngredientsExpander() { this.ingredientsExpanded = !this.ingredientsExpanded; localStorage.setItem(this.getExpanderKey('ingredients'), this.ingredientsExpanded ? 'y' : 'n');},
    // toggleInventoryExpander() { this.inventoryExpanded = !this.inventoryExpanded; localStorage.setItem(this.getExpanderKey('inventory'), this.inventoryExpanded ? 'y' : 'n');},
    // toggleNeedLogExpander() { this.needLogExpanded = !this.needLogExpanded; localStorage.setItem(this.getExpanderKey('need'), this.needLogExpanded ? 'y' : 'n');},
    //
    // getRecipeExpandedFromState() {return localStorage.getItem(this.getExpanderKey('recipe')) === 'y';},
    // getIngredientsExpandedFromState() {return localStorage.getItem(this.getExpanderKey('ingredients')) === 'y';},
    // getInventoryExpandedFromState() {return localStorage.getItem(this.getExpanderKey('inventory')) === 'y';},
    // getNeedLogExpandedFromState() {return localStorage.getItem(this.getExpanderKey('need')) === 'y';},
    //
    // getExpanderKey(expanderName) {
    //   return `phone-everything-modal-expander-${expanderName}`;
    // }
  },
  created() {
    // Keep - uncomment if we want to remember what items are expanded.
    // this.recipeExpanded = this.getRecipeExpandedFromState();
    // this.ingredientsExpanded = this.getIngredientsExpandedFromState();
    // this.inventoryExpanded = this.getInventoryExpandedFromState();
    // this.needLogExpanded = this.getNeedLogExpandedFromState();
    // if (!this.inventoryVisible && !this.needLogVisible && !this.recipeVisible) {
    //   this.ingredientsExpanded = true;
    // }
    if (this.productToShowIngredients.itemIn.productSummary.imageSource === 'Syndigo') {
      this.productToShowIngredients.itemIn.productSummary.haveImage = false;
      if (
        this.productToShowIngredients.itemIn.productSummary.imageURL !== null &&
        this.productToShowIngredients.itemIn.productSummary.imageURL !== ''
      ) {
        this.$http
          .get(this.productToShowIngredients.itemIn.productSummary.imageURL)
          .then(image => {
            if (image) {
              this.productToShowIngredients.itemIn.productSummary.haveImage = true;
              this.$forceUpdate();
            }
          })
          .catch(() => {
            this.productToShowIngredients.itemIn.productSummary.haveImage = false;
          });
      }
    } else {
      this.productToShowIngredients.itemIn.productSummary.haveImage = true;
    }

    if (this.modalMode === 'ingredients' && this.numVisibleExpanders === 1) {
      this.ingredientsExpanded = true;
    }
    console.log('phone-everything-modal created called');
  },
  computed: {
    modalMode() {
      return this.params.modalMode;
    },
    recipeVisible() {
      return this.productToShowIngredients && this.productToShowIngredients.recipe;
    },
    ingredientsVisible() {
      return (
        this.productToShowIngredients &&
        this.productToShowIngredients.ingredients &&
        this.productToShowIngredients.ingredients.length
      );
    },
    inventoryVisible() {
      return this.productToShowIngredients && this.productToShowIngredients.rowSupportsInventoryLog;
    },
    needLogVisible() {
      return this.productToShowIngredients && this.productToShowIngredients.rowSupportsNeedLog;
    },
    numVisibleExpanders() {
      if (!this.productToShowIngredients) {
        return 0;
      }

      return (
        (this.recipeVisible ? 1 : 0) +
        (this.ingredientsVisible ? 1 : 0) +
        (this.inventoryVisible ? 1 : 0) +
        (this.needLogVisible ? 1 : 0)
      );
    },
    formatShelfLife(_date) {
      let date = '';
      if (_date >= 24) {
        date = _date / 24 + 'd';
      } else if (_date < 24) {
        date = _date + 'h';
      }
      return date;
    },
    formatDateSecondaryDisplay(date, locale) {
      const dateMoment = moment(date, 'YYYY-MM-DD').toDate();

      const options = {
        month: '2-digit',
        day: '2-digit',
      };
      const d = new Date(dateMoment);
      return d.toLocaleDateString(`${locale}-US`, options).replace(/,/g, '');
    },
    formatDatePromotions(date, locale) {
      const dateMoment = moment(date, 'YYYY-MM-DD').toDate();

      const options = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      };
      const d = new Date(dateMoment);
      return d.toLocaleDateString(`${locale}-US`, options).replace(/,/g, '');
    },
    formatDatePastUpcomingTable(date, locale) {
      const dateMoment = moment(date, 'YYYY-MM-DD').toDate();

      const options = {
        month: '2-digit',
        day: '2-digit',
      };
      const d = new Date(dateMoment);
      return d.toLocaleDateString(`${locale}-US`, options).replace(/,/g, '');
    },
    formatLowerCase(_unit) {
      return _unit.toLowerCase();
    },
    formatFraction(_decimal) {
      const roundedDecimal = _.round(_decimal, 2);
      return `${roundedDecimal}`;
    },
  },
};
