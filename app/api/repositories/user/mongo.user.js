// mongo.user.js

const mongoose = require('mongoose');
const mongooseHidden = require('mongoose-hidden')();

const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  surname: String,
  username: String,
  email: String,
  password: String,
  enabled: Boolean,
  initDate: Date,
  groups: [{ type: String }],
});

userSchema.plugin(mongooseHidden); // to hidden _id and __v in query results

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
};
