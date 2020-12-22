import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import firebase from 'firebase' 

Vue.config.productionTip = false

var firebaseConfig = {
  apiKey: "AIzaSyAZvdEQQcyVpgMX5V3ma2_jeP6x0TkPSmU",
  authDomain: "vue-movie-picker.firebaseapp.com",
  projectId: "vue-movie-picker",
  storageBucket: "vue-movie-picker.appspot.com",
  messagingSenderId: "310645682656",
  appId: "1:310645682656:web:c1046358c6dcf26669fb85"
};
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore(); 

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
