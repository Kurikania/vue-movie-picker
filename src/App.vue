<template>
  <v-app>
    <TheNavigation />
    <v-main>
      <router-view> </router-view>
    </v-main>
  </v-app>
</template>

<script>

import TheNavigation from "./components/TheNavigation.vue"
export default {
  name: 'App',

  components: {
   TheNavigation
  },

  data: () => ({
    //
  }),
  computed: {
    userId() {
      return this.$store.state.user.id
    }
  }
};
</script>
