// mongo.role.js

const mongoose = require('mongoose');
const mongooseHidden = require('mongoose-hidden')();

const roleSchema = new mongoose.Schema({
  id: String,
  name: String,
  functionalities: [{ type: String }],
});

roleSchema.plugin(mongooseHidden); // to hidden _id and __v in query results

const Role = mongoose.model('Role', roleSchema);

module.exports = {
  Role,
};
