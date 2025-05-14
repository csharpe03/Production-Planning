'use strict';

import navigation from '@/js/navigation';
import audio from '@/js/audio';
import { initI18n } from '@/js/vue-i18n';

import pdfTools from '@/js/pdf-tools';
import pdfExportAll from './pdf-export-all';
import parseURL from '../../js/parseURL';

import moment from 'moment';
import jsPDF from 'jspdf';

import Papa from 'papaparse';

import _ from 'lodash';
import toolCommon from '../../js/tool-common';
import HealthCheckService from '../../services/HealthCheckService';
const USER_LOGGED_IN = 'userLoggedIn';

export default {
  localizationKey: 'components.ow-navbar',
  name: 'page-header',
  data: function() {
    return {
      userIsResettingProfile: false,
      userNeedsToClickAStore: false, // DRB Nov 20, 2023.
      storeClickCount: 0, // DRB Nov 20, 2023.
      nav: navigation,
      allowUserAdmin: false,
      loggingOut: false, // DRB Nov 19, 2021. For the red no-stores banner when logging out.
      dayOfMonth: 0,
      userInfo: null, // {},
      userInfoLoaded: false,
      storeInfo: '',
      allowStoreSelection: false,
      stores: [],
      supportEmail: {},
      pdfEmail: {
        to: 'Username', // this.userInfo.username,
        subject: 'Tasks', // ToDo
        text: 'Please find attached your pdf document',
        textNeedsConfirmation: false,
        attachment: null,
        attachmentSizeMessage: 'Pending....',
      },
      pin: '',
      allowChangingPin: false,
      allowExport: false,
      isCurrentlyLocked: false,
      isExporting: false,
      exportPercent: 0,

      // New July 2021 export multiple pdfs
      pdfPlansLoading: false,
      exportingMultiplePDFs: false,
      pdfPlansCancelling: false,
      pdfPlans: [],
      searchDepartment: '',
      searchPlan: '',
      pdfExportCurrentVisualIndex: -1,
      pdfMultiplePlansDate: 0,
      pdfMultiplePlansDateActuallyRun: 0,
      pdfMultiplePlansDates: [
        // The text here is changed dynamically on loading the pdf modal.
        { offset: -2, text: '2 days ago' },
        { offset: -1, text: 'yesterday' },
        { offset: 0, text: 'today' },
        { offset: 1, text: 'tomorrow' },
        { offset: 2, text: 'day after tomorrow' },
      ],
      usernameModalParams: null, // DRB Sept 29, 2021.
      previousHomeDepartmentKey: null,
      departmentsLoaded: false,

      switchableRoles: [
        // isActive flag will be set dynamically from config.marketRole on startup.
        { id: 'ADMIN', isActive: 'n', name: 'Administrator' },
        { id: 'CM', isActive: 'n', name: 'Central Merchandising' },
        { id: 'CO', isActive: 'n', name: 'Central Operations' },
        { id: 'DD', isActive: 'n', name: 'District Director' },
        { id: 'DM', isActive: 'n', name: 'Department Manager' },
        { id: 'SA', isActive: 'n', name: 'Store Associate' },
        { id: 'SM', isActive: 'n', name: 'Store Manager' },
        { id: 'SP', isActive: 'n', name: 'Specialist' },
      ],
      switchableBrands: [
        { marketKey: 10, name: 'Hannaford', code: 'HA' },
        { marketKey: 20, name: 'Food Lion', code: 'FL' },
        { marketKey: 30, name: 'Giant Food', code: 'GF' },
        { marketKey: 40, name: 'Giant Company', code: 'TGC' },
        { marketKey: 50, name: 'Stop and Shop', code: 'SS' },
      ],
    };
  },

  created: async function() {
    // this.nav.screenMode = localStorage.getItem('last-screen-mode-x') || 'normal'; // or 'phone';
    this.dayOfMonth = new Date().getDate();
    this.pingForMidnightReset = setInterval(this.checkForPassMidnight, 600000); // 10 mins
    this.nav.mute = !!localStorage.getItem('mute');
    this.nav.forceEnableIPadPrinterIcon = localStorage.getItem('overrideAllowIpads') === 'y';
    this.$mitt.on('store-selector-clicked-store', this.selectStore); // Was below!
    await this.getCurrentUserInfo();
    this.initSupportEmail();
    this.updateSwitchableRolesForActiveFlag();
    // this.initAudio();
    this.$mitt.on('builder-pdf-blob-created', this.pdfBlobCreated);
    this.$mitt.on('viewer-pdf-blob-created', this.pdfBlobCreated);
    this.$mitt.on('user-request-reset-profile', this.userRequestResetProfile);
    if (this.nav.showConnectionAlert) {
      HealthCheckService.start();
    }
  },

  beforeDestroy: function() {
    HealthCheckService.stop();
    if (this.pingForMidnightReset) {
      clearInterval(this.pingForMidnightReset);
    }
    this.$mitt.off('builder-pdf-blob-created', this.pdfBlobCreated);
    this.$mitt.off('viewer-pdf-blob-created', this.pdfBlobCreated);
    this.$mitt.off('builderTaskTableReadyForExport', this.onBuilderTaskTableReadyForExport);
    this.$mitt.off('store-selector-clicked-store', this.selectStore);
    this.$mitt.off('user-request-reset-profile', this.userRequestResetProfile);
  },

  watch: {
    locale() {
      console.log('ow-navbar nav.locale watch fired: ' + this.locale);
      this.loadDepartments(); // new DRB
    },
    debugNavKey() {
      console.log('ow-navbar debugNavKey watch fired: ');
      console.log(this.debugNavKey);
    },
    alertInvItems() {
      if (this.alertInvItems && !this.nav.mute) {
        console.log('************* inv alert');
        audio.playAlert();
      }
    },
    alertMtoItems() {
      if (this.alertMtoItems && !this.nav.mute) {
        console.log('************* mto alert');
        audio.playAlert();
      }
    },
  },

  computed: {
    filteredSwitchableRoles() {
      if (!this.switchableRoles || !this.userInfo) {
        return [];
      }
      // Corey:
      // The list of roles they should see in the switcher should be...
      // only active roles for the brand (based on config.marketRole)
      // should always see their current role
      // and then the table below (DRB: cannot show table here but it's a hard-coded list as per the switch statement below).
      return this.switchableRoles.filter(item => {
        if (item.id === this.userInfo.role) {
          return true; // Always include the current role
        }
        if (item.isActive !== 'y') {
          return false; // Hide all inactive roles, as in config.marketRole (one row for each brand and each role, field = 'isActive'.
        }
        switch (item.id) {
          case 'ADMIN':
            return this.userInfo.allowAdmin === 'y';
          case 'CM':
            return this.userInfo.allowSwitchRole === 'y' || this.userInfo.allowCMSPSwitch === 'y';
          case 'SP':
            return this.userInfo.allowSwitchRole === 'y' || this.userInfo.allowCMSPSwitch === 'y';
          default:
            return this.userInfo.allowSwitchRole === 'y';
        }
      });
    },
    currentStoreCaption() {
      // DRB Oct 12, 2021 for Phone view.
      if (!this.stores) {
        return '...';
      }
      const store = this.stores.find(s => s.storeKey === this.nav.storeKey);
      if (!store) {
        return 'N/A';
      }
      return store.storePhoneInfo;
    },
    useHomeDepartment() {
      return !(
        this.nav.role === 'ADMIN' ||
        this.nav.role === 'CO' ||
        this.nav.role === 'CM' ||
        this.nav.role === 'DD'
      );
    },
    alertInvItems() {
      if (
        this.nav.lowInvPingCount > 0 &&
        this.nav.currentLowInvCount > this.nav.previousLowInvCount
      ) {
        return this.nav.lowInvPingCount;
      } else {
        return 0;
      }
    },
    alertMtoItems() {
      return this.nav.mtoPingCount;
    },

    debugNavKey() {
      const debug =
        'store=' +
        String(this.nav.storeKey) +
        ', dept=' +
        String(this.nav.departmentId) +
        ', locale=' +
        String(this.nav.locale);

      if (this.nav.storeKey === -1 || this.nav.departmentId === null || this.nav.locale === null) {
        console.log('OW Navbar: NOT READY: ' + debug);
        return null;
      }
      console.log('OW Navbar: READY: ' + debug);
      return (
        'store=' +
        String(this.nav.storeKey) +
        ', dept=' +
        String(this.nav.departmentId) +
        ', locale=' +
        this.nav.locale
      );
    },
    locale: function() {
      return this.nav.locale;
    },
    normalScreenRoutes: function() {
      return this.routes.filter(route => 
        (!route.omitFromNav &&
          route.roles &&
          route.roles.indexOf(this.userInfo.role) >= 0 &&
          !route.isAdminRoute &&
          !route.isSupportRoute &&
          !route.isPlanningRoute &&
          !route.isReportingRoute &&
          !route.isEcomRoute) ||
          (!route.omitFromNav &&
            route.roles &&
            route.roles.indexOf(this.userInfo.role) >= 0 &&
            route.isEcomRoute &&
            this.nav.isEcomActiveStore)
      );
    },
    reportingRoutes: function() {
      return this.routes.filter(route => (!route.omitFromNav &&
        route.roles &&
        route.roles.indexOf(this.userInfo.role) >= 0 &&
        route.isReportingRoute &&
        this.userInfo.permissionMarketKey !== 40));
    },
    routes: function() {
      if (this.nav.screenMode === 'phone') {
        return this.$router.options.routes
          .filter(route => !route.omitFromNav || route.id !== 'product-inventory')
          .filter(route => {
            return (
              !route.needsAllowAdminUser || this.allowUserAdmin || route.id !== 'product-inventory'
            );
          }) // DRB Oct 2022.
          .sort((a, b) => {
            if (isFinite(a.index) && isFinite(b.index)) return a.index - b.index;
            else if (isFinite(a.index)) return -1;
            else if (isFinite(b.index)) return 1;
            else return a.name > b.name ? -1 : 0;
          });
      } else {
        return this.$router.options.routes
          .filter(route => !route.omitFromNav)
          .filter(route => {
            return !route.needsAllowAdminUser || this.allowUserAdmin;
          }) // DRB Oct 2022.
          .sort((a, b) => {
            if (isFinite(a.index) && isFinite(b.index)) return a.index - b.index;
            else if (isFinite(a.index)) return -1;
            else if (isFinite(b.index)) return 1;
            else return a.name > b.name ? -1 : 0;
          });
      }
    },
    topLevelRoute: function() {
      // This can probably be done better
      const topLevelNavPath = _.get(this, '$route.matched.0.path');
      return _.find(this.routes, { path: topLevelNavPath }) || {};
    },
    childRoutes: function() {
      return _.get(this.topLevelRoute, 'children', []);
    },
    hasSecondaryNav: function() {
      return _.find(this.childRoutes, r => !r.omitFromNav) !== undefined;
    },

    planningRoutes: function() {
      if (!this.userInfo) {
        return [];
      }
      return _.orderBy(
        _.filter(this.routes, r => {
          const allowRouteByRole =
            r.isPlanningRoute === true && r.roles.indexOf(this.userInfo.role) >= 0;
          if (!allowRouteByRole) {
            return false;
          }
          let allowRouteForSpecificPlanningScreen = false;
          switch (r.id) {
            case 'labor-planning':
              allowRouteForSpecificPlanningScreen = this.nav.allowLaborPlanning;
              break;
            case 'order-planning':
              allowRouteForSpecificPlanningScreen = this.nav.allowOrderPlanning;
              break;
            default:
              console.error('Please update ow-navbar.js for new screen: ' + r.id);
              break;
          }
          return allowRouteForSpecificPlanningScreen;
        }),
        'linkText'
      );
    },

    adminRoutes: function() {
      if (!this.userInfo) {
        return [];
      }
      return _.orderBy(
        _.filter(this.routes, r => {
          return r.isAdminRoute === true && r.roles.indexOf(this.userInfo.role) >= 0;
        }),
        'linkText'
      );
    },

    supportRoutes: function() {
      return _.orderBy(
        _.filter(this.routes, r => {
          return r.isSupportRoute === true && r.roles.indexOf(this.userInfo.role) >= 0 && ((r.linkText === 'FAQs' && this.userInfo.allowFAQ === 'y') ||
          r.linkText !== 'FAQs');
        }),
        'linkText'
      );
    },

    currentUser: function() {
      if (!this.userInfo) {
        return null;
      }
      return this.userInfo.username;
    },
    exportVisible: function() {
      if (!this.$route || !this.$route.path) {
        return false;
      }
      return (
        this.$route.path.toLowerCase().indexOf('plan-builder') > 0 ||
        this.$route.path.toLowerCase().indexOf('production-tasks') > 0
      );
    },
    pdfMultiPlansEnabled() {
      if (!this.$route || !this.$route.path) {
        return false;
      }
      // PDF for multiple plans uses builder as its source of data mushing.
      // BTW - builder is ONLY visible for store-based users (except Store Associate, SA)
      return this.nav.role !== 'SA' && this.$route.path.toLowerCase().indexOf('plan-builder') > 0;
    },
    pdfVisible: function() {
      return this.exportVisible; // For now these are the same.
    },

    pdfModalFiltering() {
      return this.pdfModalFilteredItems.length < this.pdfPlans.length;
    },

    pdfModalExportCountText() {
      const translationPath = 'components.ow-navbar.';

      if (this.pdfPlansLoading) {
        return this.$t(translationPath + 'Loading'); // 'Loading...';
      }
      const total = this.pdfPlans.length;
      const checked = this.pdfModalExportCount;
      return `${checked} ${this.$t(translationPath + 'of')} ${total} ${this.$t(
        translationPath + 'ItemsSelected'
      )}`; // Items Selected
    },

    pdfModalExportCount() {
      return this.pdfPlans.filter(item => {
        return item.export === 'y';
      }).length;
    },

    pdfModalFilteredItems() {
      const filter = (items, searchText, propertyName) => {
        const texts = (searchText || '').toUpperCase().split(' ');
        const textsCount = texts.length;
        const result = [];
        items.forEach(item => {
          let matchCount = 0;
          texts.forEach(text => {
            const matchSingleWord = (item[propertyName] || '').toUpperCase().includes(text);
            matchCount += matchSingleWord ? 1 : 0;
          });
          if (matchCount === textsCount) {
            result.push(item);
          }
        });
        return result;
      };
      let answer = this.pdfPlans;
      answer = filter(answer, this.searchDepartment, 'departmentCode');
      answer = filter(answer, this.searchPlan, 'planCode');
      return answer;
    },
  },
  methods: {
    resetHealthCheckPeriod() {
      HealthCheckService.resetToFastChecking();
    },
    async userRequestResetProfile() {
      if (!confirm(this.$t('components.ow-navbar.AreYouSureYouWantToResetUserProfile'))) {
        return;
      }
      this.userIsResettingProfile = true;
      await this.sleep(500); // For visual effect
      await this.$http.post('api/permission/reset-myself-to-sso', {});
      await this.sleep(500);
      this.userInfo.isSSO = 'y';
      this.userIsResettingProfile = false;
      this.submitLogout();
    },
    pulseNow() {
      toolCommon.pulse();
    },
    validateEcomAccess() {
      if (!this.$route || !this.$route.path) {
        return false;
      }
      if (this.$route.path.toLowerCase().indexOf('ecommerce') > 0) {
        if (
          !(
            (this.nav.role === 'SP' || this.nav.role === 'DM' || this.nav.role === 'SM') &&
            this.nav.isEcomActiveStore
          )
        ) {
          this.$router.push({
            path: parseURL.setURLFromParameters('home'),
          });
        }
      }
    },
    validateFAQAccess() {
      if (!this.$route || !this.$route.path) {
        return false;
      }
      if (this.$route.path.toLowerCase().indexOf('faqs') > 0) {
        if (this.userInfo.allowFAQ !== 'y') {
          this.$router.push({
            path: parseURL.setURLFromParameters('home'),
          });
        }
      }
    },
    freezeInSeconds(s) {
      console.log(`Freezing in ${s} seconds`);
      setTimeout(function() {
        debugger;
      }, s * 1000);
    },

    // DRB Oct 2022.
    async updateSwitchableRolesForActiveFlag() {
      // while (!this.nav.marketKey) {
      //   console.log('....Waiting for market key');
      //   await this.sleep(100);
      // }
      const params = {
        marketKey: this.nav.marketKey,
      };
      const res = await this.$http.get('/api/role/get-active-roles', { params: params });
      this.switchableRoles.forEach(switchableRole => {
        // Note: all records returned in this api call are active (since it gets only active roles). Set the active flag here based on whether the record exists or not.
        switchableRole.isActive =
          res.data.findIndex(item => item.role === switchableRole.id) >= 0 ? 'y' : 'n';
      });
    },

    closeNavCollapse() {
      // https://stackoverflow.com/questions/62016170/bootstrap-vue-navbar-doesnt-uncollapse-in-mobile-when-a-button-is-clicked-on-th
      if (this.nav.isCollapseOpen) {
        this.$root.$emit('bv::toggle::collapse', 'primary-nav-collapse');
      }
    },

    checkForPassMidnight: function() {
      const currentDayOfMonth = new Date().getDate();
      if (this.dayOfMonth !== currentDayOfMonth) {
        console.log('Resetting nav properties for audio now, as it just passed midnight');
        this.dayOfMonth = currentDayOfMonth;
        this.nav.previousLowInvCount = 0;
        this.nav.currentLowInvCount = 0;
        this.nav.lowInvPingCount = 0;
        this.nav.previousMtoCount = 0;
        this.nav.currentMtoCount = 0;
        this.nav.mtoPingCount = 0;
      }
    },
    anyTabClicked() {
      toolCommon.pulse();
      this.closeNavCollapse();
    },
    hasSupportAccess: function() {
      if (!this.userInfo) {
        return false;
      }
      const supportAccessibleRoles = []; // ['SP', 'CM', 'ADMIN'];
      return supportAccessibleRoles.indexOf(this.userInfo.role) >= 0;
    },

    loadDepartments: function() {
      // DRB - only called once the locale is set.
      this.$http.get('/api/department/for-user', { params: { locale: this.locale } }).then(res => {
        const departments = res.data;
        _.each(departments, function(obj) {
          obj.id = obj.departmentId;
          obj.name = obj.departmentName;
        });
        this.nav.departments = departments;
        this.nav.allowDepartmentSelection = departments.length > 1;
        this.departmentsLoaded = true;

        // DRB Sept 29, 2021.
        // Only on the FIRST time this function is called, nav.departmentId is null, and it is set here.
        // Use this opportunity to put in the homeDepartmentKey.
        let matchingDepartmentKey = this.nav.departmentId; // Can be null
        if (!matchingDepartmentKey && this.userInfoLoaded && this.userInfo.homeDepartmentKey) {
          matchingDepartmentKey = this.userInfo.homeDepartmentKey;
        }

        // matchingDepartmentKey can STILL be null, in which case use the first department in the list.
        let navIndex = departments.findIndex(dep => {
          return (
            dep.departmentId === matchingDepartmentKey /*DRB Sept 29, 2021. this.nav.departmentId*/
          );
        });
        if (navIndex < 0) {
          navIndex = 0;
        }
        this.nav.departmentId = departments[navIndex].departmentId;
        this.nav.departmentCode = departments[navIndex].departmentCode; // Note - this changes when the language changes.
        // This moved from getCurrentUserInfo to ensure consistency between nav and toolCommon. DRB Sept 29, 2021.
        toolCommon.setDepartment(this.nav.departmentId, this.nav.departmentCode);
      });
    },

    submitHomeDepartment: function(evt) {
      if (!this.useHomeDepartment) {
        return; // No need to do anything
      }
      // evt.preventDefault();
      // alert('ToDo: Set home department now.');
      if (String(this.userInfo.homeDepartmentKey) !== String(this.previousHomeDepartmentKey)) {
        this.$http
          .put(`/api/permission/update-home-department/`, {
            id: this.userInfo.permissionId,
            homeDepartmentKey: this.userInfo.homeDepartmentKey,
          })
          .then(() => {
            console.log(
              'Home department request sent to change to new value: ' +
                this.userInfo.homeDepartmentKey
            );
          });
      }
    },

    usernameClick() {
      if (!this.userInfo || !this.departmentsLoaded) {
        return;
      }
      toolCommon.pulse();
      this.previousHomeDepartmentKey = this.userInfo.homeDepartmentKey;
    },

    storeClick() {
      if (!this.userInfo || !this.departmentsLoaded) {
        return;
      }
      this.storeClickCount += 1;
      toolCommon.pulse(); // Vibrate the phone
    },

    // DRB Nov 18, 2021. Allows the user (or dev) to change the normal 10-minute refresh time in dashboard, viewer and builder.
    setupAutoRefresh(userInfo) {
      if (userInfo && userInfo.autoRefreshSec) {
        this.nav.autoRefreshSec = Math.abs(userInfo.autoRefreshSec);
        console.log(
          `Setting autorefresh period from userInfo to: ${this.nav.autoRefreshSec} seconds`
        );
      }
      // In case of emergency (time removed from nav object, and permissions not passing in.
      if (!this.nav.autoRefreshSec) {
        console.log('autoRefreshSec not passed in. Using 600s hard-coded default');
        this.nav.autoRefreshSec = 600;
      }
    },

    // DRB Oct 27, 2021. Use new parameters in userInfo to determine when to show the phone icon and which screen mode to start in.
    setupHandheldDevice(userInfo) {
      // handheldAutodirect: "n"
      // handheldVisible: "y"
      // handheldWidth: 767

      // Corey / slack message:
      // 1. start in phone mode if, BOTH handheldautoreect = y AND device is phone
      // 2. phone icon visible if handheldvisible = y

      // This is the physical screen size, unrelated to browser size or device pixel ratio.
      const screenMin = Math.min(window.screen.width, window.screen.height);
      const deviceIsPhone = screenMin < userInfo.handheldWidth;

      // Determine which mode to start in:
      const screenMode = userInfo.handheldAutodirect === 'y' && deviceIsPhone ? 'phone' : 'normal';

      // Show 'lost connection' scrim, by brand. DRB Aug 29, 2024.
      const showConnectionAlert = userInfo.showConnectionAlert === 'y';
      this.nav.showConnectionAlert = showConnectionAlert;

      // Determine if the phone icon is visible: Screen min dimension must be below handheldWidth AND handheldVisible is 'y'.
      const phoneIconVisible = userInfo.handheldVisible === 'y';

      this.nav.screenMode = screenMode;
      this.nav.phoneIconVisible = phoneIconVisible;
      console.log(
        `handheldAutodirect: ${userInfo.handheldAutodirect}, handheldVisible: ${userInfo.handheldVisible}`
      );
      console.log(
        `handheldWidth: ${userInfo.handheldWidth}, screenMin: ${screenMin}, deviceIsPhone? ${deviceIsPhone}`
      );
      console.log(`screenMode: ${screenMode}, phoneIconVisible: ${phoneIconVisible}`);
      this.refreshMainScrollBar();
    },

    refreshMainScrollBar() {
      const html = document.getElementById('main-html'); // style="overflow-x: hidden;"
      if (html) {
        console.log('Setting overflow-x to auto NOW');
        html.setAttribute(
          'style',
          `overflow-x: ${this.nav.screenMode === 'phone' ? 'hidden' : 'visible'}`
        );
      }
      // DRB Nov 2022. The following fixes the padding on the footer that makes part of the phone-mode builder or viewer page cut off the plan selector dropdown.
      // By default it was always 85px in _footer.scss
      const vueHolder = document.getElementById('vueholder');
      if (vueHolder) {
        vueHolder.style.paddingBottom = this.nav.screenMode === 'phone' ? '185px' : '85px';
      }
    },

    async getCurrentUserInfo() {
      this.allowUserAdmin = await toolCommon.isUserAllowedToManageOtherUsers(); // DRB Oct 2022. true or false.
      const roles = toolCommon.roles();

      const res = await toolCommon.userDetail(); //.then((res) => {
      const index = toolCommon.getBestUserDetailIndex(res);
      this.userInfoLoaded = true;
      this.userInfo = res[index]; // was 0
      if (this.userInfo) {
        // console.log(JSON.parse(JSON.stringify(this.userInfo)));
        this.setupAutoRefresh(this.userInfo);
        this.setupHandheldDevice(this.userInfo);
        const userLocaleLocalStorageKey = 'v1|' + this.userInfo.username + '|locale'; // Change version if it is ever needed to reset everyone's language setttings.
        const currentLocale = localStorage.getItem(userLocaleLocalStorageKey) || 'en';
        initI18n(currentLocale).then(() => {
          this.nav.userLocaleLocalStorageKey = userLocaleLocalStorageKey;
          this.nav.locale = currentLocale;
        });

        this.nav.marketKey = this.userInfo.marketKey;
        this.nav.pin = this.userInfo.pin;
        this.nav.role = this.userInfo.role;
        this.nav.allowEditAllTotalNeed = this.userInfo.allowFullPlanOverride === 'y';

        this.stores = _.uniqBy(res, 'storeKey'); // this will have all the stores that the user is allowed to select from
        _.each(this.stores, function(obj) {
          obj.storeInfo = obj.storeNbr + ' - ' + obj.city;
          const firstCharsUpperCase = obj.city
            .toLowerCase()
            .replace(/(^\w|\s\w)/g, m => m.toUpperCase()); // In comments of question: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
          obj.storePhoneInfo = obj.storeNbr + ' - ' + firstCharsUpperCase;
          obj.storePhoneCity = firstCharsUpperCase;
        });
        this.allowStoreSelection = this.stores.length > 1;

        const loggingInNow = (localStorage.getItem(USER_LOGGED_IN) || 'loggedOut') === 'loggedOut';

        if (
          this.userInfo.role === roles.CENTRAL_OPERATIONS ||
          this.userInfo.role === roles.CENTRAL_MERCHANDISING ||
          (this.userInfo.role === roles.ADMIN && !window.location.href.includes('test-button'))
        ) {
          this.nav.storeKey = null;
          this.nav.storeNbr = null;
          this.nav.storeInfo = '';
          this.nav.allowLaborPlanning = false; // DRB Sept 8, 2021
          this.nav.allowOrderPlanning = false; // DRB Sept 8, 2021
          this.nav.isEcomActiveStore = false; // CJR Dec 11, 2023
          toolCommon.setStoreKey(null);
          toolCommon.setStoreNumber(null);
          this.storeInfo = 'All stores';
        } else {
          if (loggingInNow && this.stores.length > 1) {
            this.storeInfo = 'Pending...';
            this.userNeedsToClickAStore = true;
            await this.waitUntil(() => !!this.$refs.storeSelectionRef);
            this.storeClickCount += 1;
            this.$refs.storeSelectionRef.show(); // Shows the modal!
            await this.waitUntil(() => !this.userNeedsToClickAStore);
          } else if (this.userInfo.storeKey !== null) {
            this.nav.storeKey = this.userInfo.storeKey; // Use this instead of toolCommon if possible: new version.
            this.nav.storeNbr = this.userInfo.storeNbr; // Use this instead of toolCommon if possible: new version.
            this.nav.storeInfo = this.userInfo.storeNbr + ' - ' + this.userInfo.city.trim(); // e.g. 8149 - PORTSMOUTH // added Nov 20, 2021 for convenience.
            this.nav.allowLaborPlanning = this.userInfo.allowLaborPlanning === 'y'; // DRB Sept 8, 2021
            this.nav.allowOrderPlanning = this.userInfo.allowOrderPlanning === 'y'; // DRB Sept 8, 2021
            this.nav.isEcomActiveStore = this.userInfo.isEcomActiveStore === 'y'; // CJR Dec 11 2023
            this.nav.allowFAQ = this.userInfo.allowFAQ === 'y'; // CJR Dec 11 2023
            toolCommon.setStoreKey(this.userInfo.storeKey);
            toolCommon.setStoreNumber(this.userInfo.storeNbr);
            this.storeInfo = this.nav.storeInfo;
            this.validateEcomAccess();
            this.validateFAQAccess();
          }
        }

        // NOTE: this code is now ALSO called in loadDepartments (above), since that loads the homeDepartment if necessary.
        if (this.userInfo.departmentId !== null) {
          toolCommon.setDepartment(this.userInfo.departmentId, this.userInfo.departmentCode);
        }

        if (this.userInfo.marketKey !== null) {
          toolCommon.setMarketKey(this.userInfo.marketKey);
        }

        if (
          this.userInfo.role === roles.DEPARTMENT_MANAGER ||
          this.userInfo.role === roles.STORE_MANAGER
        ) {
          this.allowChangingPin = true;
        }
        if (this.userInfo.role !== roles.STORE_ASSOCIATE) {
          this.allowExport = true;
        }

        const departmentId = this.userInfo.departmentId;

        const data = {
          eventType: 'Login',
          storeKey: toolCommon.getStoreKey(),
          departmentKey: departmentId,
          message: 'logging into tool',
          screen: toolCommon.getDeviceScreenSize(this.nav),
        };
        // using local storage to capture which user was logged in, otherwise refreshing the page will falsely register that the user logged in again
        //let userLoggedIn = localStorage.getItem(USER_LOGGED_IN);
        //if (userLoggedIn === null || !_.includes(userLoggedIn, this.userInfo.username))
        // recording logging into the tool every time as it seems like we may be losing some of times the user logs in if they didnt log out properly
        localStorage.setItem(USER_LOGGED_IN, this.userInfo.username);
        this.$http.post('api/log/to-table', data);
        this.loadPrinterConfig();
      }
    },
    // store.storeKey, store.storeInfo, store.marketKey, store.storeNbr
    selectStore(storeIn) {
      toolCommon.pulse();
      const storeKey = storeIn.storeKey;
      const storeInfo = storeIn.storeInfo;
      const marketKey = storeIn.marketKey;
      const storeNbr = storeIn.storeNbr;
      this.storeInfo = storeInfo;
      this.nav.storeKey = storeKey;
      this.nav.storeNbr = storeNbr;
      this.nav.storeInfo = storeInfo; // e.g. 8149 - PORTSMOUTH // added Nov 20, 2021 for convenience.
      this.nav.allowLaborPlanning = storeIn.allowLaborPlanning === 'y';
      this.nav.allowOrderPlanning = storeIn.allowOrderPlanning === 'y';
      this.nav.isEcomActiveStore = storeIn.isEcomActiveStore === 'y';
      toolCommon.setStoreKey(storeKey);
      toolCommon.setStoreNumber(storeNbr);
      toolCommon.setMarketKey(marketKey);
      this.$root.$emit('storeChanged', storeKey);
      this.loadPrinterConfig();
      this.$refs.storeSelectionRef.hide();
      this.userNeedsToClickAStore = false;
      localStorage.setItem('user-clicked-store-key', storeIn.storeKey);
      this.validateEcomAccess();
    },
    loadPrinterConfig() {
      const marketKey = this.nav.marketKey;
      const storeKey = this.nav.storeKey;
      // printerIp: "192.168.1.120"
      // printerPort: 9100
      // serverActive: "Y"
      // storekey: "1003004"
      // usb: "N"
      this.nav.printerType = '';
      // this.nav.storePrinterIPAddress = '';
      // this.nav.storePrinterPort = '';
      this.nav.storePrinterStoreKey = '';
      if (storeKey && marketKey) {
        this.nav.storePrinterStoreKey = storeKey;
        this.nav.mobilePrinters = [];
        this.nav.mobilePrintersDebugString = '';
        this.$http
          .get(`/api/print/connection-details-for-store-key/${marketKey}/${storeKey}`)
          .then(res => {
            const printerData = res.data || [];
            console.log('printerData: ');
            console.log(printerData);
            for (let i = 0; i < printerData.length; ++i) {
              const item = {
                departmentKey: printerData[i].departmentKey || printerData[i].departmentkey,
                connection: printerData[i].connection,
              };
              this.nav.mobilePrinters.push(item);
              this.nav.mobilePrintersDebugString += '\n' + JSON.stringify(item);
            }

            // if (printerData.length > 0) {
            //   this.nav.printerType = res.data[0].usb.toUpperCase() === 'Y' ? 'usb' : 'server';
            //   // this.nav.storePrinterIPAddress = res.data[0].printerIp;
            //   // this.nav.storePrinterPort = String(res.data[0].printerPort);
            // }
          });
      }
    },

    changeRole(role) {
      toolCommon.pulse();
      this.$http
        .put(`/api/permission/update-role/`, { id: this.userInfo.permissionId, role: role.id })
        .then(() => {
          toolCommon.pulse();
          this.refreshForMarketRoleSwitch('role');
        });
    },

    changeMarket(market) {
      toolCommon.pulse();
      this.$http
        .put(`/api/permission/update-market/`, {
          id: this.userInfo.permissionId,
          marketKey: market.marketKey,
        })
        .then(() => {
          toolCommon.pulse();
          this.refreshForMarketRoleSwitch('market');
        });
    },

    submitEmail: function(evt) {
      evt.preventDefault();
      if (!this.supportEmail.sender) {
        alert('Name field is required');
      } else if (!this.supportEmail.text) {
        this.supportEmail.textNeedsConfirmation = true;
      } else {
        this.sendEmail();
      }
    },

    emailPdfDropdownClick() {
      const lastRecipient = localStorage.getItem('email-match-' + this.userInfo.username);
      this.pdfEmail.to = lastRecipient || this.userInfo.username;
      this.pdfEmail.attachmentSizeMessage = 'Please wait...';
      this.pdfEmail.attachment = null;
      this.$root.$emit('email-builder-pdf');
      this.$root.$emit('email-viewer-pdf');
    },

    modalSendPdfClick: function(evt) {
      // Attached to modal 'Send' button
      evt.preventDefault();
      if (!this.pdfEmail.to) {
        alert('Email address is required');
        return;
      }
      localStorage.setItem('email-match-' + this.userInfo.username, this.pdfEmail.to);
      if (!this.pdfEmail.subject) {
        alert('Subject is required');
        return;
      }
      if (!this.pdfEmail.attachment) {
        alert('Waiting for PDF...');
        return;
      }
      this.sendPdfEmail();
    },

    sendPdfEmail: function() {
      const email = {
        to: this.pdfEmail.to, // Recipient,
        username: this.userInfo.username, // Logged-in user email (may be different from recipient)
        city: this.storeInfo,
        departmentCode: this.nav.departmentCode,
        subject: this.pdfEmail.subject,
        text: this.pdfEmail.text,
        attachments: [this.pdfEmail.attachment],
        // Attachment here
      };
      console.log('sendPdfEmail is sending: ');
      console.log(email);

      this.$http.post('/api/pdf-email/', email, { customErrorHandling: true }).catch(console.error);

      this.$refs.pdfEmailThankyou.show(); // Bringing up this email closes the main one.

      toolCommon.recordUserEvent(`Email pdf`, this.pdfEmail.to, this.nav);
    },
    pdfBlobCreated(pdf) {
      if (pdf.content && typeof pdf.content === 'string') {
        this.pdfEmail.attachmentSizeMessage =
          'PDF document: ' + Math.round(pdf.content.length / 1024) + ' KB';
      } else {
        this.pdfEmail.attachmentSizeMessage = 'PDF document ready - size not known.';
      }
      this.pdfEmail.attachment = { path: pdf.content, filename: pdf.filename }; // https://stackoverflow.com/questions/51468316/send-pdf-generated-with-jspdf-to-server
      this.pdfEmail.subject = pdf.subject;
    },

    initSupportEmail: function() {
      this.supportEmail = {
        sender: null,
        text: null,
        textNeedsConfirmation: false,
      };
    },

    toggleConfirmation: function() {
      this.supportEmail.textNeedsConfirmation = !this.supportEmail.textNeedsConfirmation;
    },
    togglePdfEmailConfirmation: function() {
      this.pdfEmail.textNeedsConfirmation = !this.pdfEmail.textNeedsConfirmation;
    },

    sendEmail: function() {
      const email = {
        username: this.userInfo.username,
        user: this.supportEmail.sender,
        city: this.userInfo.city,
        storeNbr: this.userInfo.storeNbr,
        departmentCode: this.userInfo.departmentCode,
        text: this.supportEmail.text,
      };

      console.log(email);
      this.$http.post('/api/support-email/', email).then(() => {
        this.$refs.emailthankyou.show();
        this.initSupportEmail();
      });
    },

    cancelEmail: function() {
      this.initSupportEmail();
    },
    cancelPdfEmail: function() {
      // this.initPdfEmail();
    },
    submitLogout: function() {
      toolCommon.pulse();
      this.loggingOut = true;
      const data = {
        eventType: 'Logout',
        storeKey: toolCommon.getStoreKey(),
        departmentKey: this.nav.departmentId,
        message: 'logging out of tool',
        screen: toolCommon.getDeviceScreenSize(this.nav),
      };
      localStorage.setItem(toolCommon.lockStatus().IS_LOCKED, toolCommon.lockStatus().UNLOCKED); // making sure to set the viewer unlocked
      localStorage.setItem(USER_LOGGED_IN, 'loggedOut'); // clearing which user was logged in
      localStorage.removeItem('planKey');
      this.$http.post('api/log/to-table', data).then(() => {
        location.href = '/logout';
      });
    },

    refreshForMarketRoleSwitch: async function(source) {
      // source is either 'role' or 'market'
      toolCommon.pulse();
      const data = {
        eventType: 'MarketKey',
        storeKey: toolCommon.getStoreKey(),
        departmentKey: this.nav.departmentId,
        message: 'Switching MarketKey',
        screen: toolCommon.getDeviceScreenSize(this.nav),
      };
      localStorage.removeItem('planKey');
      localStorage.removeItem('editedProducts');
      await this.$http.post('api/log/to-table', data);

      // DRB Nov 27, 2023.
      if (source === 'role' && this.storeInfo === 'All stores') {
        // This is the same in EN or SP
        localStorage.setItem(USER_LOGGED_IN, 'loggedOut'); // Re-using this trick to make it select / reconfirm a store. This value is always set in getCurrentUserInfo below.
      }

      await this.getCurrentUserInfo();
      location.href = '/';
    },

    createPDF() {
      this.$root.$emit('open-builder-pdf');
      this.$root.$emit('open-viewer-pdf');
      toolCommon.recordUserEvent(`Print pdf`, this.$route.name, this.nav);
    },

    pdfPlansCheckVisible(yesOrNo) {
      if (this.exportingMultiplePDFs) {
        return;
      }
      for (let i = 0; i < this.pdfModalFilteredItems.length; ++i) {
        this.pdfModalFilteredItems[i].export = yesOrNo;
      }
    },
    formatPdfDateShort: function(date, locale) {
      const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      };
      const d = new Date(date);
      return d.toLocaleDateString(locale + '-US', options).replace(/,/g, '');
    },

    pdfPlansInitializeDatesForDropdown() {
      const translationPath = 'components.ow-navbar.';

      for (let i = 0; i < this.pdfMultiplePlansDates.length; ++i) {
        const rec = this.pdfMultiplePlansDates[i];
        if (rec.offset === 0) {
          rec.text = this.$t(translationPath + 'Today');
        } else {
          const newDate = toolCommon.getCurrentDateFromDayOffSet(rec.offset);
          rec.text = this.formatPdfDateShort(newDate, toolCommon.getLocale());
        }
      }
    },

    async loadPlansForPdfExport() {
      this.pdfMultiplePlansDate = 0;
      this.pdfMultiplePlansDateActuallyRun = 0;
      this.pdfPlansInitializeDatesForDropdown();
      this.pdfPlans = [];
      this.pdfPlansLoading = true;
      const paramsForPlans = {
        storeKey: toolCommon.getStoreKey(),
        marketKey: toolCommon.getMarketKey(),
        locale: toolCommon.getLocale(),
        dateFilter: toolCommon.getCurrentDateFromDayOffSet(0),
      };
      const resPlans = await this.$http.get('/api/production-task-item/unique-plans-for-a-store', {
        params: paramsForPlans,
      });
      const plansData = resPlans.data || [];
      const plans = plansData
        .filter(item => {
          // ToDo: Do we need to filter out cancelled plans?
          return (item.isDeleted || '').toLowerCase() !== 'y';
        })
        .filter(item => {
          // Hide MornBake items (Morn Bake and Morn Bake 2, basically anything flagged as isMornBake in dim.planMarketFlags)
          if (
            (item.isMornBake === 'y' && this.nav.marketKey === 40) ||
            item.isMadeToOrder === 'y'
          ) {
            return false;
          }
          return true;
        })
        .map(item => {
          item.export = 'n'; // This will be bound to a checkbox on the export modal.
          item.visible = true; // For filtering
          return item;
        });
      this.pdfPlans = plans;
      this.pdfPlansLoading = false;
    },

    // Close or Cancel button (button has 2 titles depending on whether its running or not.
    cancelMultiplePlanPdf: async function(bvModalEvt) {
      // Cancel button clicked on pdfs modal
      if (!this.exportingMultiplePDFs) {
        if (this.pdfMultiplePlansDateActuallyRun !== 0) {
          alert(this.$t('components.ow-navbar.ResetDate'));
        }
        return; // Just close the modal if not running (NOT calling preventDefault will allow it to close)
      }
      bvModalEvt.preventDefault(); // Stops the modal from closing automatically
      this.pdfPlansCancelling = true;
    },

    // Unfinished - do later
    // pdfSetTomorrow() {
    //   // alert('Set Tomorrow Now!');
    //   const newDate = toolCommon.getCurrentDateFromDayOffSet(2);
    //   console.log(`Setting common tools current date to: ${newDate}`);
    //   toolCommon.setCurrentDate(newDate);
    // },

    async createPDFForAllMyDeptsAndPlans(bvModalEvt) {
      // Create PDF button clicked (ok button)
      bvModalEvt.preventDefault(); // Stops the modal from closing automatically
      const pdfParams = pdfExportAll.createPdfParams();
      pdfParams.navigation = navigation;
      this.pdfPlansCancelling = false;

      for (let p = 0; p < this.pdfPlans.length; p++) {
        const plan = this.pdfPlans[p];
        if (plan.export !== 'y') {
          continue;
        }
        const departmentPlan = {
          departmentId: plan.departmentKey,
          departmentCode: plan.departmentCode,
          plan,
          visualIndex: p,
        };
        pdfParams.departmentPlans.push(departmentPlan);
      }

      await this.exportMultipleBuilderPdf(pdfParams);
      // this.$refs.pdfExportPlans.hide(); // KEEP - but it seems better to leave modal open in case user forgot one row and didn't want to check all the same rows all over again.
    },

    setMultiplePlansDate(something) {
      console.log('setMultiplePlansDate called');
      console.log(something);
    },

    async exportMultipleBuilderPdf(pdfParams) {
      this.exportingMultiplePDFs = true;
      this.nav.turnOffPings = true; // Stop builder from doing its 10-minute auto refresh, in the middle of this export.
      try {
        const pdfSections = [];
        for (let i = 0; i < pdfParams.departmentPlans.length; i++) {
          if (this.pdfPlansCancelling) {
            break;
          }
          const departmentPlan = pdfParams.departmentPlans[i];
          this.pdfExportCurrentVisualIndex = departmentPlan.visualIndex; // Just so we can show a but of a color change on the modal so the user can see what's going on.
          let currentExportBuilderPdfDone = this.nav.exportBuilderPdfDone;
          const dateOffset = this.pdfMultiplePlansDate;

          // Wait for the plan to load fully:
          this.$root.$emit('load-one-of-many-plans-for-pdf', {
            // Emit message to plan builder to load the data, which will itself reload the builder task table.
            departmentId: departmentPlan.departmentId,
            departmentCode: departmentPlan.departmentCode,
            plan: departmentPlan.plan,
            dateOffset,
          });
          this.pdfMultiplePlansDateActuallyRun = this.pdfMultiplePlansDate; // Just used when closing the modal to remind the user to change date back to 'today' if necessary.
          await this.waitUntil(() => this.nav.exportBuilderPdfDone !== currentExportBuilderPdfDone);

          // Call builder to create the PDF doc data, to be stored in nav.pdfDocDetails (one at a time)
          this.nav.pdfDocDetails = null;
          currentExportBuilderPdfDone = this.nav.exportBuilderPdfDone; // Use it again, this time from the builder task table component.
          this.$root.$emit('export-one-of-many-plans-to-pdf');
          await this.waitUntil(() => this.nav.exportBuilderPdfDone !== currentExportBuilderPdfDone);

          // Add the pdf data to the results:
          if (this.nav.pdfDocDetails) {
            pdfSections.push(JSON.parse(JSON.stringify(this.nav.pdfDocDetails)));
          }
          const planDate = toolCommon.getCurrentDateFromDayOffSet(dateOffset);
          toolCommon.recordUserEvent(
            `CreatePDFs`,
            `${planDate} | ${departmentPlan.plan.planKey} | ${departmentPlan.plan.planCode}`,
            this.nav
          );
        }
        if (pdfSections.length < 0 || this.pdfPlansCancelling) {
          return;
        }
        const doc = new jsPDF();
        pdfTools.addPdfSectionsToDocument(doc, pdfSections);
        pdfTools.save(doc, 'PlanPDFs-');
      } finally {
        this.exportingMultiplePDFs = false;
        this.nav.turnOffPings = false;
        this.pdfPlansCancelling = false;
        this.pdfExportCurrentVisualIndex = -1;
      }
    },

    // https://stackoverflow.com/questions/22125865/wait-until-flag-true near bottom
    waitUntil(condition) {
      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (!condition()) {
            return;
          }
          clearInterval(interval);
          resolve();
        }, 500);
      });
    },

    sleep: function(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    fakeIncreaseMto: function() {
      this.nav.fakeIncreaseMtoAmount += 50;
    },

    printCurrentPage: function() {
      toolCommon.recordUserEvent(`Print`, this.$route.name, this.nav);
      window.print();
    },
    everythingBeforeAt(username) {
      if (!username) {
        return '';
      }
      return username.split('@')[0];
    },

    async setScreenMode(mode) {
      toolCommon.pulse();
      this.nav.screenMode = mode; // 'normal' or 'phone';
      this.closeNavCollapse();
      toolCommon.recordUserEvent(`Screen`, `Change screen mode to: ${mode}`, this.nav);
      await this.sleep(1000);
      this.refreshMainScrollBar(); // Hide (for phone mode) or show main html elements horizontal scroll bar
    },

    exportProductionsTasks: function() {
      if (this.isExporting) {
        return;
      }
      if (!confirm('Export all production tasks?')) {
        return;
      }
      const paramsForPlans = {
        storeKey: toolCommon.getStoreKey(),
        marketKey: toolCommon.getMarketKey(),
        departmentId: this.nav.departmentId,
        locale: toolCommon.getLocale(),
        dateFilter: toolCommon.getCurrentDateFromDayOffSet(0),
      };
      this.exportPercent = 0;
      this.isExporting = true;
      this.$http
        .get('/api/production-task-item/unique-plans-for-a-store-department', {
          params: paramsForPlans,
        })
        .then(plansRes => {
          const plans = plansRes.data;
          let allPromises = [];
          const dayStart = -2;
          const dayEnd = 3;
          const numRequests = (dayEnd - dayStart + 1) * plans.length;
          const percentageIncrement = numRequests ? 100 / numRequests : 0;
          let percentageDone = 0;

          for (let day = dayStart; day <= dayEnd; ++day) {
            const promises = plans.map(plan => {
              const planParams = {
                dateFilter: toolCommon.getCurrentDateFromDayOffSet(day),
                departmentId: this.nav.departmentId,
                endTime: plan.endTime,
                marketKey: toolCommon.getMarketKey(),
                planKey: plan.planKey,
                storeKey: toolCommon.getStoreKey(),
                locale: toolCommon.getLocale(),
              };
              const promise = this.$http
                .get('/api/production-task-parent/for-a-store-department', { params: planParams })
                .then(parentResponse => {
                  return this.$http
                    .get('/api/production-task-item/for-a-store-department', { params: planParams })
                    .then(response => {
                      response.data.map(item => {
                        item.date = (planParams.dateFilter || '').replace(/\//g, '-'); // change 01/20/2020 to 01-20-2020
                        const parent = parentResponse.data.find(
                          p => p.productionTaskParentId === item.parentId
                        );
                        item.parentCategory = parent ? parent.parentTaskName : '-';
                      });
                      percentageDone += percentageIncrement;
                      this.exportPercent = percentageDone.toFixed(0);
                      return response;
                    });
                });
              return promise;
            });
            allPromises = allPromises.concat(promises);
          }

          Promise.all(allPromises).then(responses => {
            let allRows = [];
            for (let i = 0; i < responses.length; ++i) {
              const rows = responses[i].data.map(row => {
                // Add the plan code (e.g. Morn Bake) to each row so it can be exported not just as a number (e.g. planKey):
                row.planCode = plans.find(item => item.planKey === row.planKey).planCode;
                row.item = (row.item || '').trim().replace(/\,/g, ' -'); // Convert 'Bagels, garlic' into 'Bagels - garlic' (i.e. remove commas since this is going into a csv).
                // row.date = i;
                return row;
              });
              allRows = allRows.concat(rows);
            }

            const storeKey = (toolCommon.getStoreKey() || '').trim().toLowerCase();
            let storeNbr = '';
            Promise.resolve(toolCommon.getStoreName()).then(res => {
              storeNbr = (res || '').trim().toLowerCase();

              allRows = _.orderBy(allRows, ['date', 'planCode', 'parentId'], 'asc').map(item => {
                item.Store_Number = storeNbr;
                item.Date = item.date;
                item.Plan_Name = item.planCode;
                item.Product_Group = item.parentCategory;
                item.Product_Description = item.item;
                item.UPC = item.productKey;
                item.PLU = item.plu;
                item.Forecast_Quantity = item.forecast;
                item.Min_Display_Quantity = item.mcdQuantity;
                item.Shelf_Life_hours = item.shelfLifeHours;
                item.Is_Mfg_Shelf_Life = item.isMfgShelfLife || 'n'; // 'y' or 'n'. DRB July 29, 2021.
                item.PYO_UPC = item.sellableUpc;
                item.Recommended_Quantity = item.quantity;
                item.Promo_Flag = item.isPromotional;
                item.Plan_Start_Time = item.startTime;
                item.Plan_End_Time = item.endTime;
                item.Completed_Flag = item.isCompleted;
                item.Completed_Time = item.completedTime
                  ? new Date(Number(item.completedTime)).toLocaleDateString('en-US', {
                      timeZone: 'America/New_York',
                    }) +
                    ' ' +
                    new Date(Number(item.completedTime)).toLocaleTimeString('en-US', {
                      timeZone: 'America/New_York',
                    })
                  : '';
                item.Viewer_Quantity = item.actualQuantity;
                item.Viewer_Time = item.actualQuantityTime
                  ? new Date(Number(item.actualQuantityTime)).toLocaleDateString('en-US', {
                      timeZone: 'America/New_York',
                    }) +
                    ' ' +
                    new Date(Number(item.actualQuantityTime)).toLocaleTimeString('en-US', {
                      timeZone: 'America/New_York',
                    })
                  : '';
                item.Builder_Quantity = item.overrideQuantity;
                item.Builder_Time = item.overrideQuantityTime
                  ? new Date(Number(item.overrideQuantityTime)).toLocaleDateString('en-US', {
                      timeZone: 'America/New_York',
                    }) +
                    ' ' +
                    new Date(Number(item.overrideQuantityTime)).toLocaleTimeString('en-US', {
                      timeZone: 'America/New_York',
                    })
                  : '';
                item.Deleted_Flag = item.isDeleted;
                item.Inventory = item.inventory;
                item.Inventory_Plan_End = item.latestInv;
                item.CurrentNeed = item.currentNeed;
                item.Inventory_Calculation_Time = item.inventoryCalculationTime
                  ? moment.utc(item.inventoryCalculationTime * 3600 * 1000).format('HH:mm')
                  : '';
                item.Low_Inventory_Threshold = item.lowInventoryThreshold;
                item.Needed_Plan_Completion = item.neededAtCompletion;

                return item;
              });
              const columns = [
                'Date',
                'Store_Number',
                'Plan_Name',
                'Product_Group',
                // 'planKey',
                'Product_Description',
                // 'itemId',
                'UPC',
                'PLU',
                'Forecast_Quantity',
                'Min_Display_Quantity',
                'Shelf_Life_hours',
                'Is_Mfg_Shelf_Life',
                // 'parentId',
                // 'source',
                // 'priority',
                // 'overrideTaskPriority',
                'PYO_UPC',
                'Recommended_Quantity',
                'Promo_Flag',
                'Plan_Start_Time',
                'Plan_End_Time',
                'Completed_Flag',
                'Completed_Time',
                'Viewer_Quantity',
                // 'actualQuantityReasonKey',
                'Viewer_Time',
                // 'actualQuantityReasonName',
                'Builder_Quantity',
                // 'overrideQuantityReasonKey',
                'Builder_Time',
                // 'overrideQuantityReasonName',
                'Deleted_Flag',
                // 'deletedReasonKey',
                // 'deletedReasonName',
                'Inventory',
                'Inventory_Plan_End',
                'CurrentNeed',
                'Inventory_Calculation_Time',
                'Low_Inventory_Threshold',
                'Needed_Plan_Completion',
              ];
              const departmentCode = (this.nav.departmentCode || '').trim().toLowerCase();
              const date = new Date();
              const dateStr =
                date.getFullYear() +
                '-' +
                ('00' + (date.getMonth() + 1)).slice(-2) +
                '-' +
                ('00' + date.getDate()).slice(-2) +
                '-' +
                ('00' + date.getHours()).slice(-2) +
                '-' +
                ('00' + date.getMinutes()).slice(-2) +
                '-' +
                ('00' + date.getSeconds()).slice(-2);

              const filename = 'production-tasks-' + departmentCode + '-' + dateStr + '.csv';
              this.downloadCSV(allRows, filename, columns);
              this.isExporting = false;
              this.exportPercent = 0;
            });
          });
        });
      toolCommon.recordUserEvent(`Export CSV`, this.$route.name, this.nav);
    },

    downloadCSV: function(data, filename, columns) {
      // Near bottom of this link: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
      const csv = Papa.unparse({ data, fields: columns });
      if (csv == null) return;

      const blob = new Blob([csv]);
      if (window.navigator.msSaveOrOpenBlob) {
        // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
        window.navigator.msSaveBlob(blob, filename);
      } else {
        const a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(blob, { type: 'text/plain' });
        a.download = filename;
        document.body.appendChild(a);
        a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
        document.body.removeChild(a);
      }
    },

    checkIfPinCanBeChanged: function() {
      const userLocked = localStorage.getItem(toolCommon.lockStatus().IS_LOCKED);
      this.isCurrentlyLocked = userLocked !== null && userLocked === toolCommon.lockStatus().LOCKED;
    },

    submitNewPin: function() {
      const editedItem = {
        pin: this.pin,
      };
      this.$http.put(`/api/permission/update-pin/`, editedItem);
      this.$refs.submitNewPin.hide();
    },
  },
};
