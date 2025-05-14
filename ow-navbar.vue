<template>
  <div>
    <div
      v-if="nav.showConnectionAlert && !nav.isConnected"
      class="my-scrim"
      @click="resetHealthCheckPeriod"
    >
      <div style="text-align: center;">
        <h2>
          <i class="fa fa-exclamation-triangle" />
          Connection Lost
          <i class="fa fa-exclamation-triangle" />
        </h2>
        <h3 :style="{ opacity: nav.isCheckingConnection ? 0.3 : 1.0 }">
          Trying to re-connect...
        </h3>
        <h4>
          <i class="fa fa-spinner fa-spin" />
        </h4>
      </div>
    </div>
    <header v-if="!!userInfo" :style="{ opacity: loggingOut ? 0.5 : 1.0 }">
      <!--    <div style="color: green">-->
      <!--      allowLaborPlanning: {{ nav.allowLaborPlanning }}-->
      <!--      allowOrderPlanning: {{ nav.allowOrderPlanning }}-->
      <!--    </div>-->
      <b-navbar
        v-if="locale"
        :toggleable="nav.screenMode === 'phone' ? 'xl' : 'md'"
        type="light"
        variant="light"
        fixed
        style="white-space: nowrap; max-width: 1600px; margin: auto !important;"
        class="mb-0 pb-0 "
      >
        <b-navbar-toggle target="primary-nav-collapse" />
        <b-navbar-brand style="z-index: 2;">
          <div
            :title="
              'nav.storeKey: ' +
                nav.storeKey +
                ', nav.departmentId: ' +
                nav.departmentId +
                ', nav.departments.length: ' +
                nav.departments.length
            "
          >
            <!-- DRB Oct 12, 2021. Change this from just '#' since this reloads page and does not quickly just navigate to home page. -->

            <a href="#/home">
              <template v-if="nav.screenMode === 'zap'">
                <span
                  style="width: 150px; display: inline-block; font-size: 0.8em;
                    white-space: pre-line; text-align: center; color: #777; margin-right: 20px;
                    line-height: 1.0em; vertical-align: bottom; padding-bottom: 4px; margin-top: -5px;"
                >
                  Welcome&nbsp;to Production&nbsp;Planning
                </span>
              </template>
              <!--ideally would like to bind the image source like so :src="'../../img/' + marketLogo", where marketLogo would be a computed property that returns the right png name, instead of the v-ifs, but runs into trouble with webpack-->
              <img
                v-if="userInfo && userInfo.permissionMarketKey <= 10"
                class="logo"
                src="../../img/ahold-delhaize-hannaford.png"
              />
              <template v-else-if="userInfo && userInfo.permissionMarketKey === 20">
                <img
                  class="d-xl-inline d-lg-inline d-md-inline d-sm-inline d-none logo"
                  src="../../img/food-lion-squat.png"
                />
                <img
                  class="d-xl-none d-lg-none d-md-none d-sm-none d-inline logo"
                  src="../../img/food-lion.png"
                />
              </template>
              <img
                v-else-if="userInfo && userInfo.permissionMarketKey === 30"
                style="height: 36px; margin-top: 5px; margin-bottom: 5px;"
                class="logo"
                src="../../img/ahold-delhaize-giant-food.png"
              />
              <img
                v-else-if="userInfo && userInfo.permissionMarketKey === 40"
                class="logo"
                src="../../img/ahold-delhaize-giant-martin.png"
              />
              <img
                v-else-if="userInfo && userInfo.permissionMarketKey === 50"
                width="128"
                src="../../img/ahold-delhaize-stopNshop.png"
              />
              <img v-else class="logo" src="../../img/ahold-delhaize.png" />
            </a>
          </div>
        </b-navbar-brand>

        <!-- Navbar design:
         In normal mode (desktop, tablet) we have LOTS of controls, and split them up into two navbars.
         In phone more, we have fewer controls and they all fit into one. (There is only the viewer, for example, in the normal routes).
         In this b-navbar section right here is the design for the first navbar. Below this is the second, for normal mode on bigger screens.
       -->

        <!-- normal mode: collapse control with all routes, planning, labor, admin, support, but NOT roles, stores, etc.-->
        <template v-if="nav.screenMode === 'normal'">
          <b-collapse is-nav id="primary-nav-collapse" v-model="nav.isCollapseOpen">
            <!-- Primary navigation -->
            <b-navbar-nav v-if="userInfo">
              <!--Regular routes-->
              <b-nav-item
                v-for="route in normalScreenRoutes"
                :key="route.id"
                :class="route.colorClass"
                :to="{ path: route.path }"
                :title="route.id"
              >
                <span @click="anyTabClicked">{{ $tkey(route.linkText) }}</span>
              </b-nav-item>

              <!-- Ecom -->
              <!-- <b-nav-item
                v-for="route in routes"
                :key="route.id"
                :class="route.colorClass"
                v-if="
                  !route.omitFromNav &&
                    route.roles &&
                    route.roles.indexOf(userInfo.role) >= 0 &&
                    route.isEcomRoute &&
                    nav.isEcomActiveStore
                "
                :to="{ path: route.path }"
              >
                <span @click="anyTabClicked">{{ $tkey(route.linkText) }}</span>
              </b-nav-item> -->

              <!--Planning (labor, etc) -->
              <!-- planningRoutes is a computed property that looks at nav.allowLaborPlanning and nav.allowOrderPlanning live and will contain planning routes based on current store. Non-specific-store users do not have access to this menu. -->
              <b-nav-item-dropdown
                v-if="planningRoutes.length > 0"
                :text="$tkey('Planning')"
                class="planning-underline"
              >
                <b-dropdown-item
                  v-for="route in planningRoutes"
                  :key="route.id"
                  :to="{ path: route.path }"
                >
                  <span @click="anyTabClicked">{{ $tkey(route.linkText) }}</span>
                </b-dropdown-item>
              </b-nav-item-dropdown>

              <!-- Reporting -->
              <b-nav-item
                v-for="route in reportingRoutes"
                :key="route.id"
                :class="route.colorClass"
                :to="{ path: route.path }"
              >
                <span @click="anyTabClicked">{{ $tkey(route.linkText) }}</span>
              </b-nav-item>
              <b-nav-item
                v-if="userInfo.permissionMarketKey === 40"
                href="https://app.powerbi.com/groups/me/reports/de68ce6d-8905-4fa2-8120-a9018d71fa7d/ReportSection0546f2734d809191c0d1?experience=power-bi"
                target="_blank"
              >
                <span @click="anyTabClicked">Reports</span>
              </b-nav-item>
            </b-navbar-nav>
            <!-- remove the xxxxxxxx here to make admin and support right-aligned -->
            <b-navbar-nav v-if="userInfo" class="xxxxxxxxml-auto" style="z-index: 1005;">
              <!--Admin-->
              <b-nav-item-dropdown v-if="adminRoutes.length > 0" text="Admin" right>
                <b-dropdown-item
                  v-for="route in adminRoutes"
                  :key="route.id"
                  :to="{ path: route.path }"
                >
                  <span @click="anyTabClicked">{{ route.linkText }}</span>
                </b-dropdown-item>
              </b-nav-item-dropdown>

              <!--Support-->
              <b-nav-item-dropdown text="Support" right>
                <b-dropdown-item
                  v-if="userInfo.permissionMarketKey === 30"
                  href="https://ws1.aholdusa.com/jadcorrection/cfappldata/usretailpricing/reporterror.html"
                  target="_blank"
                >
                  {{ $tkey('SubmitRDS') }}
                </b-dropdown-item>
                <b-dropdown-item
                  v-for="route in supportRoutes"
                  :key="route.id"
                  :to="{ path: route.path }"
                >
                  {{ route.linkText }}
                </b-dropdown-item>
                <b-dropdown-item v-if="hasSupportAccess()" href="#">
                  <span v-b-modal.supportEmailModal>Contact Support</span>
                </b-dropdown-item>
              </b-nav-item-dropdown>
            </b-navbar-nav>
          </b-collapse>
        </template>

        <!-- phone mode: collapse control with routes (viewer only), user, store, role, brand -->
        <template v-if="nav.screenMode === 'phone'">
          <b-collapse
            is-nav
            id="primary-nav-collapse"
            v-model="nav.isCollapseOpen"
            class="phone-navbar"
            @show="pulseNow()"
            @hide="pulseNow()"
          >
            <!-- Primary navigation -->
            <b-navbar-nav v-if="userInfo">
              <!-- Phone: Username link and popup properties, including home department if available. -->
              <!-- No way to stop the modal showing if using v-b-modal. Just use a different link if it's not ready: -->
              <b-nav-text v-if="!departmentsLoaded" style="border-bottom: 1px solid #ddd;">
                <!--Person icon-->
                <span
                  class="fa fa-user"
                  aria-hidden="true"
                  style="width: 24px; font-size: 1.3em; padding-left: 2px;"
                />
                <span>
                  {{ currentUser }}
                </span>
              </b-nav-text>
              <b-nav-text
                v-else
                style="border-bottom: 1px solid #ddd;"
                v-b-modal.userInfoModal
                @click="usernameClick()"
              >
                <!--Person icon-->
                <span
                  class="fa fa-user"
                  aria-hidden="true"
                  style="width: 24px; font-size: 1.3em; padding-left: 2px;"
                />
                <span class="username-link-ready d-none d-xl-inline ">{{ currentUser }}</span>
                <span class="username-link-ready d-inline d-xl-none">{{
                  everythingBeforeAt(currentUser)
                }}</span>
              </b-nav-text>

              <!-- Phone: Store Selector -->
              <!-- House icon-->
              <template v-if="userInfo">
                <b-nav-item-dropdown
                  v-if="stores.length <= 10"
                  :text="storeInfo"
                  right
                  @show="pulseNow()"
                  @hide="pulseNow()"
                  style="border-bottom: 1px solid #ddd;"
                >
                  <b-dropdown-item
                    v-for="store in stores"
                    :key="store.storeKey"
                    href="#"
                    @click="selectStore(store)"
                  >
                    {{ store.storePhoneInfo + (store.storeKey === nav.storeKey ? '*' : '') }}
                  </b-dropdown-item>
                </b-nav-item-dropdown>
                <template v-else>
                  <!-- No way to stop the modal showing if using v-b-modal. Just use a different link if it's not ready: -->
                  <b-nav-text v-if="!departmentsLoaded" style="border-bottom: 1px solid #ddd;">
                    <span
                      class="fa fa-home"
                      aria-hidden="true"
                      style="width: 24px; font-size: 1.3em; padding-left: 2px;"
                    />
                    <span>{{ storeInfo }}</span>
                  </b-nav-text>
                  <b-nav-text
                    v-else
                    style="border-bottom: 1px solid #ddd;"
                    v-b-modal.storeSelectionModal
                    @click="storeClick()"
                  >
                    <span
                      class="fa fa-home"
                      aria-hidden="true"
                      style="width: 24px; font-size: 1.3em; padding-left: 2px;"
                    />
                    <span class="store-selector-link-ready">{{ storeInfo }}</span>
                  </b-nav-text>
                </template>
              </template>

              <!-- Phone: Role Selector -->
              <template v-if="userInfo && userInfo.allowSwitchRole === 'y'">
                <b-nav-item-dropdown
                  class=""
                  :text="switchableRoles.find(b => b.id === userInfo.role).name"
                  right
                  @show="pulseNow()"
                  @hide="pulseNow()"
                  style="border-bottom: 1px solid #ddd; z-index: 1004;"
                >
                  <b-dropdown-item
                    v-for="role in switchableRoles"
                    :key="role.id"
                    href="#"
                    @click="changeRole(role)"
                  >
                    {{ role.name }}
                  </b-dropdown-item>
                </b-nav-item-dropdown>
              </template>

              <!-- Phone: Market (Brand) Selector -->
              <template v-if="userInfo && userInfo.allowSwitchMarket === 'y'">
                <b-nav-item-dropdown
                  :text="switchableBrands.find(b => b.marketKey === nav.marketKey).name"
                  right
                  @show="pulseNow()"
                  @hide="pulseNow()"
                  style="border-bottom: 1px solid #ddd; z-index: 1004;"
                >
                  <b-dropdown-item
                    v-for="market in switchableBrands"
                    :key="market.marketKey"
                    href="#"
                    @click="changeMarket(market)"
                  >
                    {{ market.name }}
                  </b-dropdown-item>
                </b-nav-item-dropdown>
              </template>

              <!-- Phone: Regular routes -->
              <b-nav-item
                v-for="route in routes"
                style="border-bottom: 1px solid #ddd;"
                :style="{
                  backgroundColor:
                    route.id === 'plan-dashboard'
                      ? '#ffedff'
                      : route.id === 'plan-builder'
                      ? '#fff1dc'
                      : route.id === 'production-tasks'
                      ? '#f0ffda'
                      : route.id === 'ecommerce'
                      ? '#e1efff'
                      : undefined
                }"
                :key="route.id"
                :class="route.colorClass"
                v-if="
                  route.roles &&
                    route.roles.indexOf(userInfo.role) >= 0 &&
                    (route.id === 'production-tasks' ||
                      route.id === 'plan-builder' ||
                      route.id === 'plan-dashboard' ||
                      (route.id === 'ecommerce' && nav.isEcomActiveStore) ||
                      route.id === 'product-inventory')
                "
                :to="{ path: route.path }"
                @click="anyTabClicked"
              >
                <span>{{ $tkey(route.linkText) }}</span>
              </b-nav-item>

              <!-- add new here -->
              <language-selector :nav="nav" />

              <!-- Phone: Screen Size Selector - only one item but helps to prevent accidental screen mode changes. -->
              <b-nav-item-dropdown
                v-if="nav.phoneIconVisible"
                :text="'Size'"
                @show="pulseNow()"
                @hide="pulseNow()"
                style="border-bottom: 1px solid #ddd; border-top: 1px solid #ddd;"
              >
                <template slot="button-content">
                  <span
                    style="font-size: 1.2em; width: 24px;"
                    class="fa fa-desktop"
                    aria-hidden="true"
                  />
                  <!-- Screen Size -->
                  {{ $tkey('ScreenSize') }}
                </template>
                <b-dropdown-item href="#" @click="setScreenMode('normal')">
                  <!-- Enter Large Mode -->
                  {{ $tkey('EnterLargeMode') }}
                </b-dropdown-item>
              </b-nav-item-dropdown>
              <!-- Phone: Log Out Selector - only one item but helps to prevent accidental logging out. -->
              <b-nav-item-dropdown
                :text="'Log Out'"
                @show="pulseNow()"
                @hide="pulseNow()"
                style="border-bottom: 1px solid #ddd;"
              >
                <template slot="button-content">
                  <span
                    style="font-size: 1.2em; width: 24px;"
                    class="fa fa-sign-out"
                    aria-hidden="true"
                  />
                  <!-- Log Out -->
                  {{ $tkey('LogOut') }}
                </template>
                <b-dropdown-item href="#" @click="submitLogout">
                  <!-- Log Out of Production Planning -->
                  {{ $tkey('LogOutOfProductionPlanning') }}
                </b-dropdown-item>
              </b-nav-item-dropdown>
            </b-navbar-nav>
          </b-collapse>
        </template>
      </b-navbar>

      <!-- Normal mode ONLY with cog icon (not usually visible):
           collapse control with all role, market, store, username, logout, pdfs, etc.-->
      <b-navbar
        v-if="nav.screenMode === 'normal' && locale"
        toggleable="md"
        type="light"
        variant="light"
        fixed
        style="white-space: nowrap; max-width: 1600px; margin: auto; margin-top: -6px !important;"
        class="mb-0 pb-0 pt-0 pb-1 pb-md-0"
      >
        <b-navbar-toggle target="primary-nav-collapse-large-mode-cog">
          <div style="padding: 6px 6px;">
            <!-- cog icon is a little smaller than the hamburger in other collapsers -->
            <span class="fa fa-cog" />
          </div>
        </b-navbar-toggle>

        <!-- normal mode: collapse control with:
             role, market, username, store,
             language selector, mobile icon - to change to phone mode
             print, mute, pdf/download/export
             logout
      -->
        <b-collapse is-nav id="primary-nav-collapse-large-mode-cog">
          <!-- Right aligned nav items (ml-auto does the right aligning)-->
          <b-navbar-nav class="ml-auto">
            <!-- DRB Oct 2022. Modified to allow for more complete logic in what roles are visible. -->
            <!--        <template v-if="userInfo && (userInfo.allowSwitchRole==='y' || userInfo.allowAdmin==='y' || userInfo.allowCMSPSwitch==='y')">-->
            <template v-if="filteredSwitchableRoles.length > 0">
              <b-nav-item-dropdown right style="z-index: 1004;">
                <!-- This is the name of the current role, not the dropdown contents: -->
                <template slot="button-content">
                  <span class="d-none d-lg-inline my-minor-navbar">{{
                    switchableRoles.find(b => b.id === userInfo.role).name
                  }}</span>
                  <span class="d-inline d-lg-none my-minor-navbar">{{
                    switchableRoles.find(b => b.id === userInfo.role).id
                  }}</span>
                </template>

                <!-- This is actual dropdown roles: -->
                <b-dropdown-item
                  v-for="role in filteredSwitchableRoles"
                  :key="role.id"
                  href="#"
                  @click="changeRole(role)"
                >
                  <span>{{ role.name }}</span>
                </b-dropdown-item>
              </b-nav-item-dropdown>
            </template>

            <template v-if="userInfo && userInfo.allowSwitchMarket === 'y'">
              <b-nav-item-dropdown right style="z-index: 1004;">
                <template slot="button-content">
                  <span class="d-none d-lg-inline my-minor-navbar">{{
                    switchableBrands.find(b => b.marketKey === nav.marketKey).name
                  }}</span>
                  <span class="d-inline d-lg-none my-minor-navbar">{{
                    switchableBrands.find(b => b.marketKey === nav.marketKey).code
                  }}</span>
                </template>
                <b-dropdown-item
                  v-for="market in switchableBrands"
                  :key="market.marketKey"
                  href="#"
                  @click="changeMarket(market)"
                >
                  {{ market.name }}
                </b-dropdown-item>
              </b-nav-item-dropdown>
            </template>

            <!-- Username (person icon + email address) -->
            <b-nav-text style="margin-right: 10px;">
              <!--Person icon - Removed Oct 2021 no longer in use -->
              <!-- <span v-if="allowChangingPin === true" class="fa fa-user user-icon" aria-hidden="true" v-b-modal.setPinModal @click="checkIfPinCanBeChanged()"/> -->
              <span class="fa fa-user my-minor-navbar" aria-hidden="true" />

              <!-- add new here -->
              <!-- <b-nav-item-dropdown v-if="adminRoutes.length > 0" text="Admin" right>
              <b-dropdown-item
                v-for="route in adminRoutes"
                :key="route.id"
                :to="{ path: route.path }"
              >
                <span @click="anyTabClicked">{{ route.linkText }}</span>
              </b-dropdown-item>
            </b-nav-item-dropdown> -->
              <!-- No way to stop the modal showing if using v-b-modal. Just use a different link if it's not ready: -->
              <span class="my-minor-navbar" v-if="!departmentsLoaded">
                {{ everythingBeforeAt(currentUser) }}
              </span>
              <span
                v-else
                class="username-link-ready my-minor-navbar"
                v-b-modal.userInfoModal
                @click="usernameClick()"
              >
                <span class="d-none d-lg-inline">{{ currentUser }}</span>
                <span class="d-inline d-lg-none">{{ everythingBeforeAt(currentUser) }}</span>
              </span>
            </b-nav-text>

            <!-- Store list - if 10 or fewer stores -->
            <b-nav-item-dropdown
              v-if="stores.length <= 10"
              right
              :disabled="nav.processingMessage !== ''"
            >
              <template slot="button-content">
                <i
                  class="fa fa-home my-minor-navbar"
                  aria-hidden="true"
                  :title="nav.storeKey + ': ' + nav.mobilePrintersDebugString"
                />
                <span class="my-minor-navbar">{{ storeInfo }}</span>
              </template>
              <b-dropdown-item
                v-for="store in stores"
                :key="store.storeKey"
                href="#"
                @click="selectStore(store)"
              >
                {{ store.storeInfo }}
              </b-dropdown-item>
            </b-nav-item-dropdown>

            <!-- Store selector modal for more than 10 stores -->
            <b-nav-text v-else style="margin-right: 10px;">
              <span class="fa fa-home my-minor-navbar" aria-hidden="true" />

              <!-- No way to stop the modal showing if using v-b-modal. Just use a different link if it's not ready: -->
              <span class="my-minor-navbar" v-if="!departmentsLoaded">
                {{ storeInfo }}
              </span>
              <span
                v-else
                class="store-selector-link-ready my-minor-navbar"
                v-b-modal.storeSelectionModal
                @click="storeClick()"
              >
                <span>{{ storeInfo }}</span>
              </span>
            </b-nav-text>

            <language-selector :nav="nav" />
            <!--   KEEP FOR DEBUGGING         <div style="display: inline-block; color: blue; cursor: pointer;" @click="fakeIncreaseMto">MTO</div>-->

            <b-nav-item v-if="nav.phoneIconVisible" @click="setScreenMode('phone')">
              <span
                class="fa fa-mobile fa-mycustom15x"
                style="padding-left: 3px; padding-right: 6px;"
                aria-hidden="true"
              />
              <span class="d-inline d-md-none my-minor-navbar">{{ $tkey('PhoneView') }}</span>
            </b-nav-item>

            <b-nav-item @click="printCurrentPage">
              <span class="fa fa-print fa-mycustom15x" aria-hidden="true" />
            </b-nav-item>
            <!--<b-nav-item v-if="nav.muted" @click="allowAudioNotification" :title="JSON.stringify(nav.mutedItemIds, null, 2)">-->
            <!--<span class="fa fa-volume-off fa-mycustom15x" aria-hidden="true" style="color: #f44"/>-->
            <!--</b-nav-item>-->
            <b-nav-item v-if="nav.mute">
              <span
                class="fa fa-volume-off fa-mycustom15x"
                aria-hidden="true"
                style="color: red;"
                :title="'Muted: ' + (nav.mute ? 'Yes' : 'No')"
              />
            </b-nav-item>
            <b-nav-item-dropdown no-caret right v-if="pdfVisible">
              <!-- Create PDFs for Multiple Plans -->
              <!-- Using 'button-content' slot https://github.com/bootstrap-vue/bootstrap-vue/issues/3614 -->
              <template slot="button-content">
                <i class="fa fa-file-pdf-o fa-mycustom15x" style="color: #555;" />
              </template>
              <b-dropdown-item @click.prevent="createPDF">{{ $tkey('CreatePDF') }}</b-dropdown-item>

              <!-- NOTE: could not set disabled since it still fires off the launch of the modal. Hack has TWO of the same menu items
              and only shows one at a time. The DISABLED on has the modal entry removed. lol -->
              <b-dropdown-item v-if="pdfMultiPlansEnabled" @click.prevent="loadPlansForPdfExport">
                <span v-b-modal.pdfExportSelectedPlansModal>{{
                  $tkey('CreatePDFForAllMyDeptsAndPlans')
                }}</span>
              </b-dropdown-item>
              <b-dropdown-item v-else :disabled="true">
                <span>{{ $tkey('CreatePDFForAllMyDeptsAndPlans') }}</span>
              </b-dropdown-item>

              <b-dropdown-item @click.prevent="emailPdfDropdownClick">
                <span v-b-modal.pdfEmailModal>{{ $tkey('EmailPDF') }}</span>
              </b-dropdown-item>
            </b-nav-item-dropdown>

            <b-nav-item
              v-if="allowExport && exportVisible"
              @click="exportProductionsTasks"
              :class="isExporting ? 'export-nav-item-active' : 'export-nav-item-inactive'"
            >
              <div v-if="!isExporting">
                <span class="fa fa-download fa-mycustom15x" aria-hidden="true" />
              </div>
              <div
                v-else
                class="export-percentage-text"
                :class="
                  isExporting ? 'export-percentage-text-active' : 'export-percentage-text-inactive'
                "
              >
                {{ exportPercent }}%
              </div>
            </b-nav-item>
            <b-nav-item @click="submitLogout"
              ><span class="fa fa-sign-out fa-mycustom15x" aria-hidden="true" />
            </b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
      <!--    KEEP: -->
      <!--    <div>-->
      <!--      <div>-->
      <!--        stores.length: {{stores.length}}-->
      <!--      </div>-->
      <!--      <div style="font-size: 0.6em;">-->
      <!--        {{userInfo}}-->
      <!--      </div>-->
      <!--      <div style="font-size: 0.6em; color: blue;">-->
      <!--        {{storeInfo}}-->
      <!--      </div>-->
      <!--      <div style="font-size: 0.6em; color: red;">-->
      <!--        nav.storeKey = {{nav.storeKey}}, nav.storeNbr = {{nav.storeNbr}}, nav.storeInfo = {{nav.storeInfo}}-->
      <!--      </div>-->
      <!--    </div>-->

      <b-modal
        centered
        size="md"
        id="userInfoModal"
        ref="userInfoRef"
        no-close-on-esc
        no-close-on-backdrop
        hide-header-close
        header-bg-variant="dark"
        header-text-variant="light"
        ok-only
        ok-variant="secondary"
        :title="$tkey('userProfile')"
        ok-title="OK"
        :ok-disabled="userIsResettingProfile"
        @ok="submitHomeDepartment"
        modal-class="user-info-modal"
      >
        <div>
          <user-info
            :nav="nav"
            :use-home-department="useHomeDepartment"
            :stores="stores"
            :user-info="userInfo"
            :user-is-resetting-profile="userIsResettingProfile"
            :switchable-roles="switchableRoles"
          >
          </user-info>
        </div>
      </b-modal>

      <!--    @ok="submitCurrentStore"-->

      <b-modal
        centered
        size="md"
        id="storeSelectionModal"
        ref="storeSelectionRef"
        no-close-on-esc
        no-close-on-backdrop
        hide-header-close
        header-bg-variant="dark"
        header-text-variant="light"
        ok-only
        ok-variant="secondary"
        :title="$tkey('selectStore')"
        :ok-title="$tkey('Cancel')"
        :ok-disabled="userNeedsToClickAStore"
        modal-class="store-selector-modal"
      >
        <div>
          <store-selector
            :nav="nav"
            :stores="stores"
            :storeClickCount="storeClickCount"
          ></store-selector>
        </div>
      </b-modal>

      <b-modal
        centered
        size="lg"
        id="supportEmailModal"
        ref="support"
        title="How can we help?"
        ok-title="Send"
        @ok="submitEmail"
        @cancel="cancelEmail"
        :ok-variant="'primary ok-button-modal'"
      >
        <form>
          <div class="form-group">
            <input
              class="form-control"
              id="feedBackEmailSender"
              type="text"
              placeholder="Your Name"
              v-model="supportEmail.sender"
              v-focus
              required
            />
          </div>
          <div class="form-group">
            <textarea
              id="feedBackEmailText"
              class="form-control"
              rows="5"
              v-model="supportEmail.text"
            />
          </div>
          <div v-if="supportEmail.textNeedsConfirmation" class="form-control">
            <p>Really submit a blank message?</p>
            <div class="btn-group">
              <button type="button" class="btn btn-success" @click="sendEmail">Yes</button>
              <button type="button" class="btn btn-secondary" @click="toggleConfirmation">
                No
              </button>
            </div>
          </div>
        </form>
      </b-modal>

      <b-modal
        centered
        size="lg"
        id="pdfEmailModal"
        ref="pdfEmail"
        title="Send PDF"
        ok-title="Send"
        @ok="modalSendPdfClick"
        @cancel="cancelPdfEmail"
        :ok-variant="'primary ok-button-modal'"
      >
        <form>
          <div class="form-group">
            <h6>Email Address</h6>
            <input
              class="form-control"
              id="pdfEmailRecipient"
              type="text"
              placeholder="email address"
              v-model="pdfEmail.to"
              v-focus
              required
            />
          </div>
          <div class="form-group">
            <h6>Subject</h6>
            <input
              class="form-control"
              id="pdfEmailSubject"
              type="text"
              placeholder="subject"
              v-model="pdfEmail.subject"
              required
            />
          </div>
          <div class="form-group">
            <h6>Message</h6>
            <textarea class="form-control" id="pdfEmailText" rows="5" v-model="pdfEmail.text" />
          </div>
          <div class="form-group">
            <h6>Attachment</h6>
            <input
              class="form-control"
              id="pdfEmailAttachment"
              type="text"
              placeholder="Pending..."
              v-model="pdfEmail.attachmentSizeMessage"
              required
            />
          </div>

          <div v-if="pdfEmail.textNeedsConfirmation" class="form-control">
            <p>Really submit a blank message?</p>
            <div class="btn-group">
              <button type="button" class="btn btn-success" @click="sendPdfEmail">Yes</button>
              <button type="button" class="btn btn-secondary" @click="togglePdfEmailConfirmation">
                No
              </button>
            </div>
          </div>
        </form>
      </b-modal>
      <!-- FindMe Export Plans -->
      <b-modal
        centered
        no-close-on-esc
        no-close-on-backdrop
        hide-header-close
        size="lg"
        id="pdfExportSelectedPlansModal"
        ref="pdfExportPlans"
        :title="$tkey('ExportPlans')"
        :ok-title="$tkey('CreatePDF')"
        @ok="createPDFForAllMyDeptsAndPlans"
        :ok-disabled="!pdfModalExportCount || pdfPlansLoading || exportingMultiplePDFs"
        @cancel="cancelMultiplePlanPdf"
        :cancel-disabled="pdfPlansLoading || pdfPlansCancelling"
        :cancel-title="
          pdfPlansCancelling
            ? $tkey('Wait')
            : exportingMultiplePDFs
            ? $tkey('Cancel')
            : $tkey('Close')
        "
        header-bg-variant="dark"
        header-text-variant="light"
        :ok-variant="'primary ok-button-modal'"
        modal-class="print-pdf-modal"
      >
        <form>
          <div class="form-control">
            <p>
              <b>{{ $tkey('ExportMultiplePlansToASinglePDFDocument') }}</b
              >&nbsp;&nbsp;&nbsp;&nbsp;
              {{ pdfModalExportCountText }}
            </p>

            <div style="padding-bottom: 0.3em; opacity: 0.7;">
              <select
                :disabled="exportingMultiplePDFs"
                v-model="pdfMultiplePlansDate"
                @change="setMultiplePlansDate"
              >
                <option
                  v-for="item in pdfMultiplePlansDates"
                  :value="item.offset"
                  :key="'date_' + item.offset"
                >
                  {{ item.text }}
                </option>
              </select>
            </div>

            <div>
              <table class="header-fixed export-plans-to-pdf-table">
                <thead>
                  <tr class="generic-table-header pdf-title-row" style="font-size: 0.9em;">
                    <th class="pdf-department">{{ $tkey('Department') }}</th>
                    <th class="pdf-plan">{{ $tkey('Plan') }}</th>
                    <th class="pdf-checkbox">{{ $tkey('Include') + '?' }}</th>
                  </tr>
                  <!-- Filter row:-->
                  <tr>
                    <th class="pdf-department">
                      <input
                        type="text"
                        class="form-control my-filter-cell"
                        :placeholder="$tkey('Search')"
                        :style="{
                          backgroundColor: pdfModalFiltering ? '#ffffa0' : undefined,
                          opacity: pdfModalFiltering ? 1.0 : 0.8,
                        }"
                        v-model="searchDepartment"
                      />
                    </th>
                    <th class="pdf-plan">
                      <input
                        type="text"
                        class="form-control my-filter-cell"
                        :placeholder="$tkey('Search')"
                        :style="{
                          backgroundColor: pdfModalFiltering ? '#ffffa0' : undefined,
                          opacity: pdfModalFiltering ? 1.0 : 0.8,
                        }"
                        v-model="searchPlan"
                      />
                    </th>
                    <th style="background-color: #f8f8f8;">
                      <div class="my-hyperlink" @click="pdfPlansCheckVisible('y')">
                        <span>{{ $tkey('CheckAll') }}</span>
                      </div>
                      <div class="my-hyperlink" @click="pdfPlansCheckVisible('n')">
                        <span>{{ $tkey('None') }}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <i
                    v-if="pdfPlansLoading || pdfPlansCancelling || exportingMultiplePDFs"
                    class="fa fa-spinner fa-spin spinner spinner-small"
                  />

                  <tr v-for="(plan, planIndex) in pdfModalFilteredItems" :key="plan.planKey">
                    <td class="left pdf-department">{{ plan.departmentCode }}</td>
                    <td class="left pdf-plan">
                      {{ plan.planCode }}
                      <span
                        :style="{
                          color: pdfExportCurrentVisualIndex === planIndex ? 'blue' : 'transparent',
                        }"
                        >***</span
                      >
                    </td>
                    <td class="left pdf-checkbox pdf-checkbox-body">
                      <b-form-checkbox
                        class="bigger-form-checkbox ml-3"
                        v-model="plan.export"
                        value="y"
                        size="lg"
                        unchecked-value="n"
                        :disabled="exportingMultiplePDFs"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <!--          <span v-for="plan in pdfPlans">-->
              <!--            {{ plan.planKey }}-->
              <!--          </span>-->
            </div>
            <!--          <div class="btn-group" >-->
            <!--            <button type="button" class="btn btn-success" @click="createPDFForAllMyDeptsAndPlans">Create PDF</button>-->
            <!--            <button type="button" class="btn btn-secondary">Cancel</button>-->
            <!--          </div>-->
          </div>
        </form>
      </b-modal>

      <b-modal
        centered
        size="md"
        id="supportEmailThankYouModal"
        ref="emailthankyou"
        title="Thanks for Your Feedback!"
        ok-title="Ok"
        ok-only
      >
        <div>
          We'll get back to you as soon as we can!
        </div>
      </b-modal>

      <!--Small thank-you modal that appears after the user submits the pdfEmailModal modal.-->
      <b-modal
        centered
        size="md"
        id="pdfEmailThankYouModal"
        ref="pdfEmailThankyou"
        title="PFD Document Sent!"
        ok-title="Ok"
        ok-only
      >
        <div>An email has been sent with attached PDF document.</div>
      </b-modal>

      <!-- change pin -->
      <b-modal
        centered
        size="md"
        id="setPinModal"
        ref="submitNewPin"
        title="Set pin to be able to lock the viewer:"
        ok-title="Ok"
        @ok="submitNewPin"
      >
        <div>
          <div>
            <p v-if="isCurrentlyLocked === true">
              The Viewer is currently locked. Please unlock before attempting to change the pin.
            </p>
            <div v-else>
              <input
                type="password"
                class="form-control"
                id="newPinEntryInput"
                placeholder="Enter pin"
                v-focus
                v-model="pin"
                maxlength="4"
                required
              />
              <i>Any four numbers or letters</i>
            </div>
          </div>
        </div>
      </b-modal>
    </header>
    <header v-else-if="userInfoLoaded" :style="{ opacity: loggingOut ? 0.5 : 1.0 }">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading text-center">
          Your account is currently not assigned to any Production Planning store(s).
        </h4>
        <p class="text-center" style="margin-bottom: 0.5rem;">
          To use the tool, please contact Helpdesk or your local Production Planning Super User, so
          they can assign the relevant store(s) to your profile!
        </p>
        <div style="text-align: center;">
          <span class="red-log-out" @click="submitLogout">
            <span
              style="font-size: 1.2em; width: 24px;"
              class="fa fa-sign-out"
              aria-hidden="true"
            />
            <!-- Log Out -->
            {{ $tkey('LogOut') }}
          </span>
        </div>
      </div>
    </header>
  </div>
</template>

<style lang="scss">
.user-and-store {
  .nav-link {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 4px !important;
  }
}

// planning-underline is a dropdown menu, not a normal menu. It has a different structure for the underline color, hence here in unscoped world.
.planning-underline > a > span {
  border-bottom: 3px solid #3bb3ff;
  text-decoration: none;
  padding-bottom: 1px;
}

.user-info-modal {
  .btn-secondary {
    width: 90px;
  }
}
.store-selector-modal {
  .btn-secondary {
    width: 90px;
  }
}
.my-scrim {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000000000;
}

.print-pdf-modal {
  .modal-dialog {
    max-width: 1000px;
    width: 90vw;
  }
  .modal-body {
    overflow-y: hidden;
    overflow-x: hidden;
    height: 70vh;
  }
}
</style>

<style scoped lang="scss">
@import '../../style/base/_variables.scss';
@import '../../style/components/_table.scss';

.red-log-out {
  cursor: pointer;
}
.red-log-out:hover {
  color: #ff5100;
}

// Make the hamburger icon more compact on small screens. Adjust the width below as appropriate.
@media screen and (max-width: 600px) {
  .navbar-toggler {
    padding: 3px 5px !important;
    //color: red !important;
    border-color: #888 !important;
    //background-color: aliceblue !important;
  }
  .navbar-toggler:active,
  .navbar-toggler:focus {
    //border-color: red !important;
    //background-color: yellow !important;
    //color: blue !important;
  }
  .navbar {
    padding: 0.25rem 0.5rem;
  }
}

.logo {
  height: 45px;
}
.user-icon {
  color: $tool-green-pea;
}
.user-info {
  font-size: 0.8em;
}
// to take care of the store bootstrap drop down selection
.m-2 {
  margin: 0 !important;
}
.export-nav-item-active {
  opacity: 0.7; // Gray out a little while exporting
}
.export-nav-item-inactive {
  /*opacity: 1.0;*/
}
.export-percentage-text {
  font-size: 0.6em;
  text-align: center;
}
.export-percentage-text-active {
  opacity: 1;
}
.export-percentage-text-inactive {
  opacity: 0; // Hide, do not remove, the control (stops flicker)
}

.viewer-underline a span {
  border-bottom: 3px solid $tool-green-pea;
  text-decoration: none;
  padding-bottom: 1px;
}

.dashboard-underline a span {
  border-bottom: 3px solid $tool-purple-darker;
  text-decoration: none;
  padding-bottom: 1px;
}

.builder-underline a span {
  border-bottom: 3px solid $tool-orange;
  text-decoration: none;
  padding-bottom: 1px;
}

.ecommerce-underline a span {
  border-bottom: 3px solid #007bff;
  text-decoration: none;
  padding-bottom: 1px;
}

.export-plans-to-pdf-table {
  tbody tr:hover {
    background-color: #f5f5f5;
  }

  .pdf-title-row {
    background-color: #666;
    padding-left: 2px;
  }
  .pdf-department {
    width: 20%;
    float: left;
  }

  .pdf-plan {
    width: 50%;
    float: left;
  }

  .pdf-checkbox {
    width: 20%;
    float: left;
  }

  .pdf-checkbox-body {
    margin-left: 11px;
  }

  .my-filter-cell {
    padding: 0;
    opacity: 0.8;
    border-width: 0;
    background-color: #f8f8f8;
    border-radius: 0;
    padding-left: 2px;
  }

  .my-hyperlink {
    display: inline-block;
    font-size: 0.7em;
    color: #298ecc;
    font-weight: 600;
    cursor: pointer;
    padding-left: 0.3em;
  }
  .my-hyperlink:hover {
    color: #285591;
    background-color: aliceblue;
  }
}

.username-link-ready {
  text-decoration: underline;
  cursor: pointer;
}

.username-link-ready:hover {
  color: #777;
}
.my-minor-navbar {
  font-size: 0.8em;
}

.store-list-hyperlink-container {
  color: #0f5fb4;
}
.store-selector-link-ready {
  text-decoration: underline;
  cursor: pointer;
}

.store-selector-link-ready:hover {
  color: #777;
}
</style>

<script src="./ow-navbar.js"></script>
