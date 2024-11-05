// api/admin.js
const express = require("express");
const path = require("path");
const project = require("../../db/model/project");
const multer = require("multer");
const skill = require("../../db/model/Skill");
const fs = require("fs");
const skillsSection = require("../../db/model/skillsSection");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../assets/projects");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // Create the directory if it doesn't exist
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
// Multer setup with storage and file filter
const storageIcon = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../assets/skills");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // Create the directory if it doesn't exist
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

// File filter to only allow SVGs
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/svg+xml"]; // Allow only SVGs
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Only SVG files are allowed");
    error.status = 400;
    return cb(error);
  }
  cb(null, true);
};

// Configure multer to handle icon uploads
const uploadIcon = multer({
  storage: storageIcon,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
  fileFilter, // Add the file filter for SVG
}).single("icon");

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single("video");

const storageResume = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../assets/resumes");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // Create the directory if it doesn't exist
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `Happy_Patel${ext}`;
    cb(null, filename);
  },
});

const uploadResume = multer({
  storage: storageResume,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
}).single("resume");

router.post("/sign-in", async (req, res) => {
  const { userName, password } = req.body;

  if (
    userName === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.admin = true;
    return res.status(200).json({ message: "Logged in successfully" });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

router.post("/projects", upload, async (req, res) => {
  const { name, description, skillsUsed, githubLink, websiteLink } = req.body;
  const videoPath = req.file ? `/assets/projects/${req.file.filename}` : null;

  try {
    const newProject = new project({
      name,
      description,
      skillsUsed: JSON.parse(skillsUsed),
      githubLink,
      websiteLink,
      videoPath,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Error creating project", error: err });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const projects = await project.find();
    res.status(200).json(projects);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching projects", error: err });
  }
});

router.put("/projects/:id", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error uploading video", error: err });
    }

    const { id } = req.params;
    const { name, description, skillsUsed, githubLink, websiteLink } = req.body;
    const videoPath = req.file ? `/assets/projects/${req.file.filename}` : null;
    try {
      if (videoPath) {
        const projectData = await project.findById(id);
        if (projectData && projectData.videoPath) {
          const oldVideoPath = path.join(
            __dirname,
            "../../",
            projectData.videoPath
          );
          fs.unlinkSync(oldVideoPath);
        }
      }

      const updatedProject = await project.findByIdAndUpdate(
        id,
        {
          name,
          description,
          skillsUsed: JSON.parse(skillsUsed),
          githubLink,
          websiteLink,
          ...(videoPath && { videoPath }),
        },
        { new: true }
      );

      res.status(200).json(updatedProject);
    } catch (err) {
      res.status(500).json({ message: "Error updating project", error: err });
    }
  });
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = await project.findByIdAndDelete(id);

    if (projectData && projectData.videoPath) {
      const videoFullPath = path.join(
        __dirname,
        "../../",
        projectData.videoPath
      );
      fs.unlinkSync(videoFullPath);
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting project", error: err });
  }
});

// Route handler
router.post("/skills", uploadIcon, async (req, res) => {
  const { name, officialLink } = req.body;
  const iconPath = req.file ? `/assets/skills/${req.file.filename}` : null; // Use req.file.filename to get the correct path

  try {
    const newSkill = new skill({
      name,
      officialLink,
      icon: iconPath,
    });

    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (err) {
    console.error("Error creating skill:", err);
    res.status(500).json({ message: "Error creating skill", error: err });
  }
});

router.get("/skills", async (req, res) => {
  try {
    const skills = await skill.find();
    res.status(200).json(skills);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching skills", error: err });
  }
});

router.put("/skills/:id", (req, res) => {
  uploadIcon(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error uploading icon", error: err });
    }

    const { id } = req.params;
    const { name, officialLink } = req.body;
    const iconPath = req.file ? `/assets/skills/${req.file.filename}` : null;
    try {
      if (iconPath) {
        const skillData = await skill.findById(id);
        if (skillData && skillData.icon) {
          const oldIconPath = path.join(__dirname, "../../", skillData.icon);
          fs.unlinkSync(oldIconPath);
        }
      }

      const updatedSkill = await skill.findByIdAndUpdate(
        id,
        {
          name,
          officialLink,
          ...(iconPath && { icon: iconPath }),
        },
        { new: true }
      );

      res.status(200).json(updatedSkill);
    } catch (err) {
      res.status(500).json({ message: "Error updating skill", error: err });
    }
  });
});

router.delete("/skills/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const skillData = await skill.findByIdAndDelete(id);

    if (skillData && skillData.icon) {
      const iconPath = path.join(__dirname, "../../", skillData.icon);
      fs.unlinkSync(iconPath);
    }

    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting skill", error: err });
  }
});

router.post("/skills-section", async (req, res) => {
  const { name, skills } = req.body;

  try {
    const newSkillsSection = new skillsSection({
      name,
      skills,
    });

    await newSkillsSection.save();
    res.status(201).json(newSkillsSection);
  } catch (err) {
    console.error("Error creating skills section:", err);
    res
      .status(500)
      .json({ message: "Error creating skills section", error: err });
  }
});

// Get all skills sections
router.get("/skills-section", async (req, res) => {
  try {
    const skillsSections = await skillsSection.find().populate("skills");
    res.status(200).json(skillsSections);
  } catch (err) {
    console.error("Error fetching skills sections:", err);
    res
      .status(500)
      .json({ message: "Error fetching skills sections", error: err });
  }
});

// Get a single skills section by ID
router.get("/skills-section/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const skillsSection = await skillsSection.findById(id).populate("skills");

    if (!skillsSection) {
      return res.status(404).json({ message: "Skills section not found" });
    }

    res.status(200).json(skillsSection);
  } catch (err) {
    console.error("Error fetching skills section:", err);
    res
      .status(500)
      .json({ message: "Error fetching skills section", error: err });
  }
});

// Update a skills section by ID
router.put("/skills-section/:id", async (req, res) => {
  const { id } = req.params;
  const { name, skills } = req.body;

  try {
    const updatedSkillsSection = await skillsSection
      .findByIdAndUpdate(id, { name, skills }, { new: true })
      .populate("skills");

    if (!updatedSkillsSection) {
      return res.status(404).json({ message: "Skills section not found" });
    }

    res.status(200).json(updatedSkillsSection);
  } catch (err) {
    console.error("Error updating skills section:", err);
    res
      .status(500)
      .json({ message: "Error updating skills section", error: err });
  }
});

// Delete a skills section by ID
router.delete("/skills-section/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSkillsSection = await skillsSection.findByIdAndDelete(id);

    if (!deletedSkillsSection) {
      return res.status(404).json({ message: "Skills section not found" });
    }

    res.status(200).json({ message: "Skills section deleted successfully" });
  } catch (err) {
    console.error("Error deleting skills section:", err);
    res
      .status(500)
      .json({ message: "Error deleting skills section", error: err });
  }
});

// Route to upload a resume
router.post("/resume", uploadResume, (req, res) => {
  // If no file was uploaded, return an error
  if (!req.resume) {
    return res.status(400).json({ message: "Resume upload failed." });
  }

  res.status(201).json({
    message: "Resume uploaded successfully",
    path: "/assets/resumes/Happy_Patel.pdf",
  });
});

// Route to get the resume path
router.get("/resume", (req, res) => {
  // Here you should implement the logic to retrieve the resume path
  // This could be from a database or a configuration file, depending on your setup.
  // For demonstration, we'll assume you have a hardcoded path or fetch from a database.

  // Example: Fetch resume path from a database (assuming you have a Resume model)
  // const resumeData = await Resume.findOne(); // This would be your database call
  // if (!resumeData) {
  //   return res.status(404).json({ message: "No resume found." });
  // }
  // res.status(200).json({ path: resumeData.path });

  // For now, return a placeholder response
  const resumePath = "/assets/resumes/example-resume.pdf"; // Placeholder path
  res.status(200).json({ path: resumePath });
});

module.exports = router;
