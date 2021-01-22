<template>
  <v-container>
    <v-row v-if="matches.length > 0">
      <v-col md="6" v-for="match in matches[0]" :key="match.id">
        <v-card class="mx-auto">
      <v-overlay :value="isLoading">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
          <v-container style="overflow: auto; ">
            <v-row>
              <v-col md="8">
                <v-list-item-title class="headline mb-1">
                  {{ match.title }}
                </v-list-item-title>
                <p v-if="match.overview.slice(0, 200) === match.overview">
                  {{ match.overview }}
                </p>
                <p v-else-if="!match.readMoreActivated">
                  {{ match.overview.slice(0, 200) }}
                  <a
                    v-if="!match.readMoreActivated"
                    @click.prevent="match.readMoreActivated = true"
                  >
                    Read more...
                  </a>
                </p>
                
                <p v-else-if="match.readMoreActivated">
                   {{ match.overview }}
                  <a
                    v-if="match.readMoreActivated"
                    @click.prevent="match.readMoreActivated = false"
                  >
                    Read less...
                  </a>
                </p>
                <v-btn color="red" @click="dislike(match.id)">
                  <v-icon>mdi-thumb-down</v-icon>
                </v-btn>
              </v-col>
              <v-col md="4">
                <v-img :src="getMovieImage(match.poster_path)"></v-img>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <h2>You don't have any matches yet</h2>
    </v-row>
  </v-container>
</template>

<script>

import { db } from "../main";
export default {
    
  data() {
    return {
      isLoading: false,
      matches: [],
            settings: {
        suppressScrollY: false,
        suppressScrollX: false,
        wheelPropagation: false
      }
    };
  },
  methods: {
    
    getMovieImage(posterPath) {
      return posterPath ? `https://image.tmdb.org/t/p/w500/${posterPath}` : "";
    },
    dislike(id) {
      console.log(id);
      const authUserId = this.$store.state.user.id;
      const snapshot2 = db
        .collection("users")
        .doc(authUserId)
        .collection("matches")
        .doc('"' + id + '"')
        .delete()
        .then(function () {
          console.log("Document successfully deleted!");
        })
        .catch(function (error) {
          console.error("Error removing document: ", error);
        });
      db.collection("users")
        .doc(authUserId)
        .collection("likedMovies")
        .doc('"' + id + '"')
        .delete();
      console.log(snapshot2);
      this.$store.dispatch("user/removeMatch");
    },
    async getData() {
       this.isLoading = true;
      const authUserId = this.$store.state.user.id;
      const parnterId = this.$store.state.user.partnerId;
      const currentUser = db.collection("users").doc(authUserId);
      const partner = db.collection("users").doc(parnterId);
      let partnerLikes = [];
      await partner
        .collection("likedMovies")
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            partnerLikes.push(doc.data());
          });
        });
      let userLikes = [];
      await currentUser
        .collection("likedMovies")
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            let entry = doc.data();
            entry.readMoreActivated = false;
            userLikes.push(entry);
          });
        });

      userLikes.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
      partnerLikes.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
      console.log("user Sorted", userLikes);
      this.matches.push(
        userLikes.filter((o1) => partnerLikes.some((o2) => o1.id === o2.id))
      );
      this.isLoading = false;
    },
  },

  created() {
    this.getData();
  },
};
</script>

<style scoped>

</style>