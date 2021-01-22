<template>
  <v-app>
    <TheNavigation />
    <v-main class="bg">
      <router-view> </router-view>
    </v-main>
  </v-app>
</template>

<script>
import TheNavigation from "./components/TheNavigation.vue";
export default {
  name: "App",

  components: {
    TheNavigation,
  },

  data: () => ({
    //
  }),
  computed: {
    userId() {
      return this.$store.state.user.id;
    },
  },
};
</script>

<style >
::-webkit-scrollbar {
  width: 15px;
}

::-webkit-scrollbar-track {
  background: #202020;
  border-left: 1px solid #2c2c2c;
}

::-webkit-scrollbar-thumb {
  background: #3e3e3e;
  border: solid 3px #202020;
  border-radius: 7px;
}
::-webkit-scrollbar-thumb:hover {
  background: white;
}

.bg {
  background-image: url("./assets/background.jpg");
  background-position: bottom;
  background-repeat: no-repeat;
  background-size: contain;
  background-color:  #121212;
  background-blend-mode: difference;
}
</style>
