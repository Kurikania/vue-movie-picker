<template>
<div> 
  <v-card class="mx-auto" style="max-width: 500px">
    <v-overlay :value="isLoading">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <v-form ref="form" v-model="form" class="pa-4 mt-6">
      <v-text-field
        v-model="name"
        :rules="[rules.required]"
        filled
        label="Name"
      >
      </v-text-field>
      <v-text-field
        v-model="email"
        :rules="[rules.email]"
        filled
        label="email"
        type="email"
      >
      </v-text-field>
      <v-text-field
        v-model="password"
        :rules="[rules.password, rules.length(6)]"
        filled
        counter="6"
        label="password"
        type="password"
        style="min-height: 96px"
      >
      </v-text-field>
    </v-form>
    <v-alert v-if="errorMsg" border="top" color="red" class="ml-5 mr-3">
      {{ errorMsg }}
    </v-alert>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn text @click="refs.form.reset()">Reset</v-btn>
      <v-spacer></v-spacer>
      <v-btn
        :disabled="!form"
        color="primary"
        :loading="isLoading"
        depressed
        @click="signup"
        >Sign Up</v-btn
      >
    </v-card-actions>
    <div class="text-end pa-4">
      Already have an account? <router-link to="/">Sign In</router-link>
    </div>
  </v-card>
  </div>
</template>


<script>
import firebase from "firebase";
import { db } from "../main";
export default {
  data: () => ({
    name: "",
    email: "",
    password: "",
    errorMsg: "",
    form: false,
    isLoading: false,
    rules: {
      email: (v) => !!(v || "").match(/@/) || "Please enter a valid email",
      length: (len) => (v) =>
        (v || "").length >= len || `Invalid character length, requires ${len}`,
      password: (v) =>
        !!(v || "").match(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/
        ) ||
        "Password must contain uppercase, lowercase, number, and special character",
      required: (v) => !!v || "This field is required",
    },
  }),
  methods: {
    async signup() {
      let date = new Date();
      date =
        (date.getUTCHours() + 3 < 10
          ? "0" + (date.getUTCHours() + 3)
          : date.getUTCHours() + 3) +
        ":" +
        (date.getUTCMinutes() < 10
          ? "0" + date.getUTCMinutes()
          : date.getUTCMinutes()) +
        "\n" +
        date.getUTCDate() +
        "." +
        (date.getUTCMonth() + 1) +
        "." +
        date.getUTCFullYear();

      this.isLoading = true;
      try {
        let authRes = await firebase
          .auth()
          .createUserWithEmailAndPassword(
            this.email.toLowerCase(),
            this.password
          );
        await db
          .collection("users")
          .doc(authRes.user.uid)
          .set({ name: this.name, email: this.email, regDate: date });
        this.$store.dispatch("user/setUserData", {
          id: authRes.user.uid,
          name: this.name,
          email: this.email,
          regDate: date,
          partnerId: "",
        });
        this.$router.replace({ name: "AddPartner" });
      } catch (error) {
        this.errorMsg = "An error!!!";
        if (error.message) {
          this.errorMsg = error.message;
        }
      }
      this.isLoading = false;
    },
  },
};
</script>