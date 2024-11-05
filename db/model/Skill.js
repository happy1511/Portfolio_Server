// models/Skill.js
const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  officialLink: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // URL or file path to the icon
    required: true,
  },
});

module.exports = mongoose.model("Skill", SkillSchema);
