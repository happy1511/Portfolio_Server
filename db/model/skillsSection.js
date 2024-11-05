// models/SkillsSection.js
const mongoose = require("mongoose");

const SkillsSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  skills: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
    },
  ],
});

module.exports = mongoose.model("SkillsSection", SkillsSectionSchema);
