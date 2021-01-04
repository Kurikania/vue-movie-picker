<template>
  <div>
    <v-overlay :value="isLoading">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <v-container>
      <v-row>
        <v-col>
          <v-card>
            <h2>Add Partner</h2>
            <p>Search for your partner by email</p>
            <v-col class="d-inline-flex">
              <v-card>
                <v-form ref="form" v-model="form">
                  <v-col class="d-inline-flex">
                    <v-text-field
                      v-model="email"
                      :rules="[rules.email]"
                      filled
                      label="email of your partner"
                      type="email"
                    >
                    </v-text-field>
                    <v-btn
                      @click="searchUserByEmail"
                      :disabled="!form"
                      large
                      color="primary"
                      class="ml-2 mt-2"
                      >Search</v-btn
                    >
                  </v-col>
                </v-form>
              </v-card>
            </v-col>
          </v-card>
        </v-col>
        <v-col>
          <v-card v-if="partnerData">
            <h2>Your current partner</h2>
            <v-col class="d-inline-flex">
              <v-card>
                <v-card-text>
                  <div>{{ partnerData.email }}</div>
                  <p class="display-1 text-primary">{{ partnerData.name }}</p>
                  <div class="text-primary">
                    To remove this User, click the button below
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="red" @click="removeCurrentPartner()">
                    Remove
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="foundUser">
        <v-col class="d-inline-flex">
          <v-card>
            <v-card-text>
              <div>{{ foundUser.email }}</div>
              <p class="display-1 text-primary">{{ foundUser.name }}</p>
              <div class="text-primary">
                To add this User, click the button below
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="addUserAsPartner(foundUser.id)">
                Add
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="message">
        <v-col>
          <h3>{{ message }}</h3>
        </v-col>
      </v-row>
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
    </v-container>
  </div>
</template>

<script>
import firebase from "firebase";
import { db } from "../main";
export default {
  data: () => ({
    form: false,
    isLoading: false,
    toastColor: "",
    toastMessage: "",
    showToast: false,
    partnerData: "",
    email: "",
    foundUser: "",
    message: "",
    rules: {
      email: (v) => !!(v || "").match(/@/) || "Please enter a valid email",
    },
  }),
  methods: {
    async searchUserByEmail() {
      this.isLoading = true;
      this.message = "";
      this.foundUser = null;
      try {
        const snapshot = await db
          .collection("users")
          .where("email", "==", this.email.toLowerCase())
          .get();
        if (!snapshot.email) {
          const userId = snapshot.docs[0].id;
          const userIData = snapshot.docs[0].data();
          this.foundUser = {
            id: userId,
            ...userIData,
          };
        } else {
          this.message = "No user found";
        }
        this.isLoading = false;
      } catch (error) {
        this.isLoading = false;
        this.message = error;
      }
    },
    async addUserAsPartner(id) {
      if (this.$store.state.user.partnerId) {
        this.toastMessage = "You can have only one partner";
      } else {
        try {
          const authUserId = this.$store.state.user.id;
          await db
            .collection("users")
            .doc(authUserId)
            .update({ partnerId: id });
          this.$store.dispatch("user/setPartnerId", id);
          this.toastColor = "success";
          this.toastMessage = "partner added";
          this.currentPartner();
          this.showToast = true;
        } catch (error) {
          this.toastColor = "red";
          this.toastMessage = `partner is not added ${error.message}`;
          this.showToast = true;
        }
      }
    },
    currentPartner() {
      this.partner = this.$store.state.user.partnerId;
      const snapshot2 = db.collection("users").doc(this.partner);
      snapshot2
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userId = doc.id;
            const userIData = doc.data();
            this.partnerData = { id: userId, ...userIData };
          } else {
            console.log("No such document!");
          }
        })
        .catch(function (error) {
          console.log("Error getting document:", error);
        });
    },
    async removeCurrentPartner() {
      const authUserId = this.$store.state.user.id;
      const snapshot2 = db.collection("users").doc(authUserId);
      var remove = await snapshot2.update({
        partnerId: firebase.firestore.FieldValue.delete(),
      });
      this.$store.dispatch("user/unSetPartnerId");
      this.toastColor = "success";
      this.toastMessage = `partner ${remove} removed`;
      this.partnerData = "";
      console.log(this.$store.state.user.partnerId);
      this.showToast = true;
    },
  },
  created() {
    this.$store.state.user.partnerId ? this.currentPartner() : "";
    console.log(this.$store.state.user.partnerId)
  },
};
</script>