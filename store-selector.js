import _ from 'lodash';

export default {
  localizationKey: 'components.ow-navbar.components.store-selector',

  props: ['nav', 'stores', 'storeClickCount'],
  data() {
    return {
      loading: true,
      debugInfoClicks: 0,
      debugUserInfo: false,
      filterText: '',
      filterDistrictDescription: '',
      friendlyGroups: [],
      friendlyGroup: null,
      userClickedStoreKey: '',
    };
  },

  created: async function() {
    await this.loadGroupsDistrictsRegions();
    this.putMostRecentInView();
  },
  methods: {
    async loadGroupsDistrictsRegions() {
      // Load the store groups, districts, regions from dim.storeGroupView
      const params = {
        marketKey: this.nav.marketKey,
      };
      this.loading = true;
      const storeGroupListsRes = await this.$http.get(
        '/api/store-settings/navbar-stores-by-store-group',
        { params }
      );
      this.loading = false;
      let tempFriendlyGroups = [];
      const storeGroupData = storeGroupListsRes.data;
      for (let sg = 0; sg < storeGroupData.length; sg++) {
        const storeGroup = storeGroupData[sg];
        const storeGroupStoreKey = storeGroup.storeKey;
        if (
          !this.stores.find(item => {
            return item.storeKey === storeGroupStoreKey;
          })
        ) {
          continue; // Ignore stores not in our permissions set.
        }
        let tempFriendlyGroup = tempFriendlyGroups.find(item => {
          return item.friendlyName === storeGroup.friendlyName;
        });
        if (!tempFriendlyGroup) {
          tempFriendlyGroup = {
            friendlyName: storeGroup.friendlyName,
            storeKeys: [],
          };
          tempFriendlyGroups.push(tempFriendlyGroup);
        }
        tempFriendlyGroup.storeKeys.push(storeGroupStoreKey);
      }
      tempFriendlyGroups = tempFriendlyGroups.filter(sg => {
        return sg.storeKeys.length > 0;
      });
      tempFriendlyGroups = _.orderBy(tempFriendlyGroups, ['sortOrder', 'friendlyName']);
      this.friendlyGroups = tempFriendlyGroups;
    },
    sleep: function(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async selectStore(store) {
      // Fire of the new store.
      this.$mitt.emit('store-selector-clicked-store', store);
      // Clear out the filter stuff:
      await this.sleep(1000);
      this.filterDistrictDescription = '';
      this.filterText = '';
    },
    districtOrRegionText(store) {
      let text = '';
      if (store.districtDesc && store.regionDesc) {
        if (store.districtDesc === store.regionDesc) {
          text = store.districtDesc;
        } else {
          text = `${store.districtDesc} / ${store.regionDesc}`;
        }
      } else if (store.districtDesc) {
        text = store.districtDesc;
      } else if (store.regionDesc) {
        text = store.regionDesc;
      }
      return text;
    },
    async putMostRecentInView() {
      this.userClickedStoreKey = localStorage.getItem('user-clicked-store-key') || null;
      const id = `last-scroll-${this.userClickedStoreKey || 'none'}`;
      const element = document.getElementById(id);
      if (element) {
        await this.sleep(100);
        element.scrollIntoView(true); // true puts it up top in scrollable region
      }
    },
  },

  computed: {
    filteredStores() {
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
      let answer = this.stores;
      if (this.friendlyGroup) {
        answer = answer.filter(item => {
          return this.friendlyGroup.storeKeys.indexOf(item.storeKey) >= 0;
        });
      }
      answer = filter(answer, this.filterText, 'storeInfo');
      if (this.filterDistrictDescription) {
        answer = answer.filter(store => {
          return this.districtOrRegionText(store) === this.filterDistrictDescription;
        });
      }
      return answer;
    },
  },
  watch: {
    storeClickCount() {
      this.putMostRecentInView();
    },
  },
};
