// models/Project.js
const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  skillsUsed: [
    {
      type: String,
      required: true,
    },
  ],
  githubLink: {
    type: String,
    required: true,
  },
  websiteLink: {
    type: String,
    required: false,
  },
  videoPath: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Project", ProjectSchema);
