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
            <v-card-title>Profile Info</v-card-title>
            <v-card-text>
              <ul>
                <li>E-mail: {{ userEmail }}</li>
                <li>Username: {{ username }}</li>
                <li v-if="regDate">Registration Date: {{ regDate }}</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title>Add Partner</v-card-title>
            <v-card-text>Search for your partner by email</v-card-text>
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
            <v-card-title>Your current partner</v-card-title>
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
              <v-card-title>{{ foundUser.email }}</v-card-title>
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
      <v-row justify="center">
        <v-dialog v-model="dialog" persistent max-width="290">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="red" dark v-bind="attrs" v-on="on">
              Delete account
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="headline">
              Do you want to delete account?
            </v-card-title>
            <v-card-text>
              You can't undo it. Your partner will lose all matches with you
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="dialog = false">
                Go Back
              </v-btn>
              <v-btn color="red" text @click="removeAccount"> Delete </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
    partnerData: null,
    email: "",
    foundUser: "",
    message: "",
    dialog: false,
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
      console.log(id);
      if (this.$store.state.user.partnerId) {
        console.log("You can have only one partner", id);
        this.toastMessage = "You can have only one partner";
      } else if (this.foundUser.partnerId && this.foundUser.partnerId != this.$store.state.user.id) {
        console.log(this.foundUser.partnerId != this.$store.state.user.id)
        this.message = "That person is watching movies with someone else";
        console.log(this.message)
      } else {
        try {
          console.log("11");
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

      db.collection("users")
        .doc(authUserId)
        .collection("matches")
        .get()
        .then((doc) => {
          doc.docs.forEach((i) =>
            db
              .collection("users")
              .doc(authUserId)
              .collection("matches")
              .doc(i.id)
              .delete()
              .then(function () {
                console.log("Document successfully deleted!");
              })
              .catch(function (error) {
                console.error("Error removing document: ", error);
              })
          );
          db.collection("users")
            .doc(this.$store.state.user.partnerId)
            .collection("matches")
            .get()
            .then((doc) => {
              doc.docs.forEach((i) =>
                db
                  .collection("users")
                  .doc(authUserId)
                  .collection("matches")
                  .doc(i.id)
                  .delete()
                  .then(function () {
                    console.log("Document successfully deleted!");
                  })
                  .catch(function (error) {
                    console.error("Error removing document: ", error);
                  })
              );
            });
        });

      this.showToast = true;
    },
    removeAccount() {
      const user = firebase.auth().currentUser.uid;
      console.log(user);
      if (this.$store.state.user.partnerId) {
        db.collection("users")
          .doc(this.$store.state.user.partnerId)
          .collection("matches")
          .get()
          .then((doc) => {
            doc.docs.forEach((i) =>
              db
                .collection("users")
                .doc(user)
                .collection("matches")
                .doc(i.id)
                .delete()
                .then(function () {
                  console.log("Document successfully deleted!");
                })
                .catch(function (error) {
                  console.error("Error removing document: ", error);
                })
            );
          });
      }
      console.log(this.$store.state.user.partnerId == true);
      db.collection("users")
        .doc(user)
        .delete()
        .then(function () {
          console.log("User is deleted");
        })
        .catch(function (error) {
          console.log(error);
        });
      this.dialog = false;
      this.$router.push({ name: "SignUp" });
    },
  },
  created() {
    this.$store.state.user.partnerId ? this.currentPartner() : "";
    console.log(this.$store.state.user.partnerId);
  },
  computed: {
    regDate() {
      if (this.$store.state.user.regDate) {
        return this.$store.state.user.regDate;
      } else {
        return "Not recorded";
      }
    },
    userEmail() {
      return this.$store.state.user.email;
    },
    username() {
      return this.$store.state.user.email;
    },
  },
};
</script>