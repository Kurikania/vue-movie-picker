<template>
  <div class="home">
    <v-card :loading="isLoading" class="mx-auto my-12" max-width="600">
      <template slot="progress">
        <v-progress-linear
          color="primary"
          height="10"
          indeterminate
        ></v-progress-linear>
      </template>
      <v-row>
        <v-col md="6"><v-img class="ma-1" :src="movieImage"></v-img></v-col>
        <v-col md="6" class="mt-5">
          <v-card-title>{{ currentMovie.title }} </v-card-title>
          <v-card-subtitle v-if="currentMovie.release_date">
            <span v-if="currentMovie.original_title !== currentMovie.title">{{
              currentMovie.original_title
            }}</span>
            ({{ currentMovie.release_date.slice(0, 4) }})</v-card-subtitle
          >
          <v-card-text>
            <v-row align="center" class="mx-0">
              <!-- <p v-if="match.overview.slice(0, 200) === match.overview">
                  {{ match.overview }}
                </p> -->
              <div
                v-if="
                  currentMovie.overview === currentMovie.overview.slice(0, 400)
                "
              >
                {{ currentMovie.overview }}
              </div>
              <div v-else-if="!readMore">
                {{ currentMovie.overview.slice(0, 400) }}
                <a @click.prevent="readMore = true"> Read more...</a>
              </div>
              <div v-else-if="readMore">
                {{ currentMovie.overview }}
                <a @click.prevent="readMore = false"> Read less...</a>
              </div>
              <div>
                Genres: <span v-for="g in genres" :key="g"> {{ g }} , </span>
              </div>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-row class="d-flex justify-space-around">
              <v-btn color="green" @click="thumbsUp">
                <v-icon>mdi-thumb-up</v-icon>
              </v-btn>
              <v-btn color="red" @click="thumbsDown">
                <v-icon>mdi-thumb-down</v-icon>
              </v-btn>
            </v-row>
          </v-card-actions>
        </v-col>
      </v-row>
    </v-card>
    <v-snackbar
      :timeout="3000"
      :value="showToast"
      absolute
      bottom
      right
      :color="toastColor"
    >
      {{ toastMessage }}
    </v-snackbar>
    <v-row>
      <v-col class="text-center"
        >Powered by <a href="https://www.themoviedb.org/">The Movie Database</a>
      </v-col>
    </v-row>
  </div>
</template>

<script>
// @ is an alias to /src
import axios from "axios";
import { db } from "../main";
export default {
  name: "Home",
  data: () => ({
    readMore: false,
    isLoading: false,
    movies: [],
    toastColor: "",
    toastMessage: "",
    showToast: false,
    currentMovie: [],
    currentIndex: 0,
    genresIdMeaning: null,
  }),
  methods: {
    async fetchMovies(page) {
      const res = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=7f3c9e99261bf77cffebfa1b26a50e1f&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=false&page=${page}`
      );
      if (res.data && res.data.results.length > 0) {
        this.movies = res.data.results;
        this.currentMovie = this.movies[0];
      }
    },
    async getGenres() {
      const res2 = await axios.get(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=7f3c9e99261bf77cffebfa1b26a50e1f&language=en-US`
      );
      if (res2.data) {
        this.genresIdMeaning = res2.data;
      }
    },
    async incrementCurrentIndex() {
      if (this.currentIndex === this.movesResultsLength - 1) {
        const newPage = this.userMovieApiPage + 1;
        await db.collection("users").doc(this.authUserId).update({
          movieApiPage: newPage,
        });
        this.$store.dispatch("user/setMovieApiPage", newPage);
        this.fetchMovies(newPage);
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
        this.currentMovie = this.movies[this.currentIndex];
      }
    },
    async thumbsUp() {
      let currentUser = db.collection("users").doc(this.authUserId);
      let partner = db.collection("users").doc(this.parnterId);
      console.log(this.$store.state.user.likedMovies.length !== 0)
      if (
        this.$store.state.user.likedMovies.length !== 0 &&
        this.$store.state.user.likedMovies.filter(
          (a) => a.id == this.currentMovie.id).length > 0
      ) {
        this.toastColor = "red";
        this.toastMessage = `You already have this in collection`;
        this.showToast = true;
        this.incrementCurrentIndex();
      } else {
        await currentUser
          .collection("likedMovies")
          .doc('"' + this.currentMovie.id + '"')
          .set({ ...this.currentMovie });
        //console.log("111");
        this.$store.dispatch("user/addLikedMovie", { ...this.currentMovie });
        if (this.parnterId) {
          const partnerLikes = await partner
            .collection("likedMovies")
            .where("id", "==", this.currentMovie.id)
            .get();
          if (!partnerLikes.empty) {
            await currentUser
              .collection("matches")
              .doc('"' + this.currentMovie.id + '"')
              .set({ ...this.currentMovie });
            await partner
              .collection("matches")
              .doc('"' + this.currentMovie.id + '"')
              .set({ ...this.currentMovie });
            this.toastColor = "green";
            this.toastMessage = `It's a match!!!`;
            this.showToast = true;
          }
        } else {
          this.toastColor = "red";
          this.toastMessage = `You didnt add a partner yet`;
          this.showToast = true;
        }
      }
      this.incrementCurrentIndex();
    },
    async thumbsDown() {
      await this.incrementCurrentIndex();
    },
  },
  created() {
    this.getGenres();
    this.$store.dispatch("user/bindMatchesRef");
    this.fetchMovies(this.userMovieApiPage);
  },
  computed: {
    movesResultsLength() {
      return this.movies.length;
    },
    userMovieApiPage() {
      return this.$store.state.user.movieApiPage;
    },
    authUserId() {
      return this.$store.state.user.id;
    },
    parnterId() {
      return this.$store.state.user.partnerId;
    },
    movieImage() {
      return this.currentMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500/${this.currentMovie.poster_path}`
        : "";
    },
    genres() {
      let g = [];
      this.currentMovie.genre_ids.forEach((a) =>
        g.push(this.genresIdMeaning.genres.find((movie) => movie.id == a).name)
      );
      console.log(g);
      return g;
    },
  },
};
</script>
