const namespaced = true;
import { firestoreAction } from "vuexfire";
import { db } from "../../main.js"

const state = {
    id: null,
    name: null,
    email: null,
    partnerId: null,
    movieApiPage: 1,
    matches: [],
    likedMovies: [],
}

const mutations = {
    SET_USER_DATA: (state, payload) => {
        state.id = payload.id;
        state.name = payload.name;
        state.email = payload.email
        state.partnerId = payload.partnerId
        state.movieApiPage = payload.movieApiPage
        state.likedMovies = payload.likedMovies
    },
    SET_PARTNER_ID: (state, payload) => {
        state.partnerId = payload
    },
    UNSET_PARTNER_ID: (state) => {
        state.partnerId = null;
    },
    SET_MOVIE_API_PAGE: (state, payload) => {
        state.movieApiPage = payload
    },
    ADD_LIKED_MOVIE: (state, payload) => {
        //console.log(state.likedMovies)
        state.likedMovies.push(payload)
    },
    REMOVE_MATCH: (state, payload) => {
        state.matches.filter(a => a.id !== payload)
        state.likedMovies.filter(a => a.id !== payload)
    },
    CLEAR_DATA: (state) => {
        state.id = null;
        state.name = null;
        state.email = null;
        state.partnerId = null;
        state.movieApiPage = 1;
        state.matches = [];

    },

}

const actions = {
    setUserData(context, userdata) {
        context.commit('SET_USER_DATA', userdata)
    },
    setPartnerId(context, id) {
        context.commit('SET_PARTNER_ID', id)
    },
    unSetPartnerId(context, id) {
        context.commit('UNSET_PARTNER_ID', id)
    },
    addLikedMovie(context, movie) {
        context.commit('ADD_LIKED_MOVIE', movie)
    },
    removeMatch(context, movie) {
        context.commit('REMOVE_MATCH', movie)
    },
    setMovieApiPage(context, page) {
        context.commit('SET_MOVIE_API_PAGE', page)
    },
    bindMatchesRef: firestoreAction((context) => {
       // console.log(db.collection("users").doc(context.state.id).collection("matches"))
        return context.bindFirestoreRef("matches", db.collection("users").doc(context.state.id).collection("matches")
        );
    }),
    clearData(context, userData) {
        context.commit('CLEAR_DATA', userData)
    }

}

const getters = {}

export default {
    namespaced,
    state,
    mutations,
    actions,
    getters
}