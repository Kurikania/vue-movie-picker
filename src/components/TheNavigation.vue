<template>
  <div>
    <v-app-bar app  dark>
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        v-if="userId"
      ></v-app-bar-nav-icon>

      <div class="d-flex align-center">
        <h2>Movie Picker</h2>
      </div>
      <v-spacer></v-spacer>
      <div>Welcome {{ userName }}</div>
      <v-spacer></v-spacer>
      <v-btn v-if="userId" @click="logoutUser" text>Logout</v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" absolute bottom temporary>
      <v-list nav dense>
        <v-list-item-group active-class="primary">
          <v-list-item to="/home">
            <v-list-item-title> Home </v-list-item-title>
          </v-list-item>
          <v-list-item to="/match">
            <v-list-item-title> Matches </v-list-item-title>
          </v-list-item>
          <v-list-item to="/add-partner">
            <v-list-item-title> Add Partner </v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import firebase from "firebase";
export default {
  name: "TheNavigation",
  data: () => ({
    drawer: false,
  }),
  computed: {
    userId() {
      return this.$store.state.user.id;
    },
    userName() {
      return this.$store.state.user.name;
    },
  },
  methods: {
    async logoutUser() {
      await firebase.auth().signOut();
      this.$store.dispatch("user/clearData");
      this.$router.replace("/");
    },
  },
};
</script>