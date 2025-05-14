<template>
  <div v-if="userInfo && nav" style="overflow: hidden;">
    <table style="width: 100%;">
      <tbody>
        <!-- Username -->
        <tr class="my-row">
          <td class="paramter-name">
            <span @click="debugUserInfoClick()">{{ $tkey('Username') }}</span>
          </td>
          <td class="paramter-value">
            <div>
              <span style="overflow-wrap: anywhere;">{{ userInfo.username }}</span>
            </div>
          </td>
        </tr>
        <!-- Role -->
        <tr class="my-row">
          <td class="paramter-name">
            <span>{{ $tkey('Role') }}</span>
          </td>
          <td class="paramter-value">
            <span>{{ switchableRoles.find(r => r.id === userInfo.role).name }}</span>
          </td>
        </tr>
        <!-- Departments -->
        <tr class="my-row">
          <td class="paramter-name">
            <span>{{ $tkey('DepartmentsAssigned') }}</span>
          </td>
          <td class="paramter-value">
            <div v-if="userInfo.allDepartments === 'y'">
              <span> {{ $tkey('AllDepartments') }} </span>
            </div>
            <div v-else v-for="oneDepartment in nav.departments">
              <span> {{ oneDepartment.departmentCode }} </span>
            </div>
          </td>
        </tr>
        <!-- Home Department -->
        <tr class="my-row" v-if="useHomeDepartment">
          <td class="paramter-name">
            <span>{{ $tkey('HomeDepartment') }}</span>
          </td>
          <td class="paramter-value">
            <select
              required
              id="myHomeDepartmentSelector"
              v-model="userInfo.homeDepartmentKey"
              style="width: 100%; border-color: #ccc;"
            >
              <!-- Placeholder for select control -->
              <option :value="null" disabled>{{ $tkey('SelectDepartment') }}</option>
              <option
                v-for="item in nav.departments"
                :value="item.departmentId"
                :key="item.departmentId"
                >{{ item.departmentCode }}</option
              >
            </select>
          </td>
        </tr>
        <!-- Stores Assigned -->
        <tr class="my-row">
          <td v-if="userInfo.allStores === 'y'" class="paramter-name">
            <span>{{ $tkey('StoresAssigned') }}</span>
          </td>
          <td v-else class="paramter-name">
            <span>{{ $tkey('StoresAssigned') }} ({{ stores.length }} {{ $tkey('items') }})</span>
          </td>
          <td class="paramter-value">
            <div v-if="userInfo.allStores === 'y'">
              <span> {{ $tkey('AllStores') }} </span>
            </div>
            <div v-else style="max-height: 120px; overflow-y: scroll;">
              <div v-for="store in stores">
                <span> {{ store.storeInfo }} </span>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div>
      <div v-if="userInfo.isSSO === 'n'" class="reset-sso-container mt-3 p-1">
        <div>
          <button
            class="btn my-btn-red mb-1"
            @click="resetUserProfileClick()"
            :disabled="userIsResettingProfile"
            :style="{ opacity: userIsResettingProfile ? 0.2 : 1.0 }"
          >
            {{ $tkey('resetUserProfile') }}
          </button>
          <i
            class="fa fa-spinner fa-spin ml-2 mt-1"
            style="font-size: 1.5em; color: gray;"
            :style="{ opacity: userIsResettingProfile ? 1.0 : 0.0 }"
          />
        </div>
        <div class="sso-text-can-reset">
          {{ $tkey('removeAnyPreviousOverrides') }}
        </div>
      </div>
      <div v-if="userInfo.isSSO === 'y'" class="reset-sso-container mt-3 p-1">
        <div class="sso-text-up-to-date">
          <i> {{ $tkey('userProfileUpToDateWithLatestInformation') }}</i>
        </div>
      </div>
    </div>

    <div v-if="debugUserInfo" style="font-size: 0.8em; max-height: 300px; overflow-y: scroll;">
      userInfo.homeDepartmentKey:
      <pre style="color: green;">{{ userInfo.homeDepartmentKey }}</pre>
      <hr />
      newHomeDepartmentKey:
      <pre style="color: green;">{{ newHomeDepartmentKey }}</pre>
      <hr />
      nav:
      <pre style="color: green;">{{ nav }}</pre>
      <hr />
      userInfo:
      <pre style="color: blue;">{{ userInfo }}</pre>
      stores:
      <pre style="color: darkgray;">{{ stores }}</pre>
    </div>
  </div>
</template>

<style scoped lang="scss">
.reset-sso-container {
  border: 1px solid #f0f0f0;
  width: 100%;
  background-color: #f9f9f9;
}
.sso-text-can-reset {
  font-size: 0.7em;
  //width: 70%;
  font-weight: bold;
}
.sso-text-up-to-date {
  font-size: 0.8em;
  //width: 70%;
  font-weight: bold;
}
.my-btn-red {
  background-color: red;
  color: white;
}
.my-row {
  vertical-align: top;
  color: black;
}
tr:nth-child(even) {
  background-color: #f2f2f2;
}
.paramter-name {
  width: 40%;
}
.paramter-value {
  width: 60%;
}
</style>

<script src="./user-info.js"></script>
