const mongoose = require("mongoose");
const { userSchema } = require("../Schema/user.schema");

// The original code called mongoose.model(userSchema) which is invalid — a model
// needs a name. Reuse an already-compiled model if it exists (helps with
// nodemon hot-reloads).
const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);

module.exports = { UserModel };
