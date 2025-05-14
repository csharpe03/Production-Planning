import { initI18n } from '@/js/vue-i18n';

export default {
  localizationKey: 'components.ow-navbar.components.user-info',

  props: [
    'nav',
    'useHomeDepartment',
    'stores',
    'userInfo',
    'switchableRoles',
    'userIsResettingProfile',
  ],
  data() {
    return {
      debugInfoClicks: 0,
      debugUserInfo: false,
    };
  },

  created: function() {
    console.log('*********** created');
  },
  destroyed: function() {
    console.log('*********** destroyed');
  },

  methods: {
    resetUserProfileClick() {
      this.$root.$emit('user-request-reset-profile');
    },
    debugUserInfoClick() {
      this.debugInfoClicks += 1;
      if (this.debugInfoClicks >= 10) {
        this.debugInfoClicks = 0;
        this.debugUserInfo = !this.debugUserInfo;
      }
    },
  },

  computed: {},

  filters: {},
};
