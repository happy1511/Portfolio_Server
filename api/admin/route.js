// // api/admin.js
// const express = require("express");
// const path = require("path");
// const project = require("../../db/model/project");
// const multer = require("multer");
// const skill = require("../../db/model/Skill");
// const fs = require("fs");
// const skillsSection = require("../../db/model/skillsSection");
// const Skill = require("../../db/model/Skill");
// const urls = require("../../db/model/urls");

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = path.join(__dirname, "../../assets/projects");
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true }); // Create the directory if it doesn't exist
//     }
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const filename = `${Date.now()}-${file.originalname}`;
//     cb(null, filename);
//   },
// });

// const storageIcon = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = path.join(__dirname, "../../assets/skills");
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true }); // Create the directory if it doesn't exist
//     }
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const filename = `${Date.now()}-${file.originalname}`;
//     cb(null, filename);
//   },
// });

// // File filter to only allow SVGs
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/svg+xml"]; // Allow only SVGs
//   if (!allowedTypes.includes(file.mimetype)) {
//     const error = new Error("Only SVG files are allowed");
//     error.status = 400;
//     return cb(error);
//   }
//   cb(null, true);
// };

// // Configure multer to handle icon uploads
// const uploadIcon = multer({
//   storage: storageIcon,
//   limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
//   fileFilter, // Add the file filter for SVG
// }).single("icon");

// const upload = multer({
//   storage,
//   limits: { fileSize: 50 * 1024 * 1024 },
// }).single("video");

// const storageResume = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = path.join(__dirname, "../../assets/resumes");
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true }); // Create the directory if it doesn't exist
//     }
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const filename = `Happy_Patel${ext}`;
//     cb(null, filename);
//   },
// });

// const uploadResume = multer({
//   storage: storageResume,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
// }).single("resume");

// router.post("/sign-in", async (req, res) => {
//   const { userName, password } = req.body;

//   if (
//     userName === process.env.ADMIN_USERNAME &&
//     password === process.env.ADMIN_PASSWORD
//   ) {
//     req.session.admin = true;
//     return res.status(200).json({ message: "Logged in successfully" });
//   } else {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }
// });

// router.post("/projects", upload, async (req, res) => {
//   const { name, description, skillsUsed, githubLink, websiteLink } = req.body;
//   const videoPath = req.file ? `/assets/projects/${req.file.filename}` : null;

//   try {
//     const newProject = new project({
//       name,
//       description,
//       skillsUsed: JSON.parse(skillsUsed),
//       githubLink,
//       websiteLink,
//       videoPath,
//     });

//     await newProject.save();
//     res.status(201).json(newProject);
//   } catch (err) {
//     console.error("Error creating project:", err);
//     res.status(500).json({ message: "Error creating project", error: err });
//   }
// });

// router.get("/projects", async (req, res) => {
//   try {
//     const projects = await project.find();
//     res.status(200).json(projects);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Error fetching projects", error: err });
//   }
// });

// router.put("/projects/:id", (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ message: "Error uploading video", error: err });
//     }

//     const { id } = req.params;
//     const { name, description, skillsUsed, githubLink, websiteLink } = req.body;
//     const videoPath = req.file ? `/assets/projects/${req.file.filename}` : null;
//     try {
//       if (videoPath) {
//         const projectData = await project.findById(id);
//         if (projectData && projectData.videoPath) {
//           const oldVideoPath = path.join(
//             __dirname,
//             "../../",
//             projectData.videoPath
//           );
//           fs.unlinkSync(oldVideoPath);
//         }
//       }

//       const updatedProject = await project.findByIdAndUpdate(
//         id,
//         {
//           name,
//           description,
//           skillsUsed: JSON.parse(skillsUsed),
//           githubLink,
//           websiteLink,
//           ...(videoPath && { videoPath }),
//         },
//         { new: true }
//       );

//       res.status(200).json(updatedProject);
//     } catch (err) {
//       res.status(500).json({ message: "Error updating project", error: err });
//     }
//   });
// });

// router.delete("/projects/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const projectData = await project.findByIdAndDelete(id);

//     if (projectData && projectData.videoPath) {
//       const videoFullPath = path.join(
//         __dirname,
//         "../../",
//         projectData.videoPath
//       );
//       fs.unlinkSync(videoFullPath);
//     }

//     res.status(200).json({ message: "Project deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error deleting project", error: err });
//   }
// });

// // Route handler
// router.post("/skills", uploadIcon, async (req, res) => {
//   const { name, officialLink } = req.body;
//   const iconPath = req.file ? `/assets/skills/${req.file.filename}` : null; // Use req.file.filename to get the correct path

//   try {
//     const newSkill = new skill({
//       name,
//       officialLink,
//       icon: iconPath,
//     });

//     await newSkill.save();
//     res.status(201).json(newSkill);
//   } catch (err) {
//     console.error("Error creating skill:", err);
//     res.status(500).json({ message: "Error creating skill", error: err });
//   }
// });

// router.get("/skills", async (req, res) => {
//   try {
//     const skills = await skill.find();
//     res.status(200).json(skills);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Error fetching skills", error: err });
//   }
// });

// router.put("/skills/:id", (req, res) => {
//   uploadIcon(req, res, async (err) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ message: "Error uploading icon", error: err });
//     }

//     const { id } = req.params;
//     const { name, officialLink } = req.body;
//     const iconPath = req.file ? `/assets/skills/${req.file.filename}` : null;
//     try {
//       if (iconPath) {
//         const skillData = await skill.findById(id);
//         if (skillData && skillData.icon) {
//           const oldIconPath = path.join(__dirname, "../../", skillData.icon);
//           fs.unlinkSync(oldIconPath);
//         }
//       }

//       const updatedSkill = await skill.findByIdAndUpdate(
//         id,
//         {
//           name,
//           officialLink,
//           ...(iconPath && { icon: iconPath }),
//         },
//         { new: true }
//       );

//       res.status(200).json(updatedSkill);
//     } catch (err) {
//       res.status(500).json({ message: "Error updating skill", error: err });
//     }
//   });
// });

// router.delete("/skills/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const skillData = await skill.findByIdAndDelete(id);

//     if (skillData && skillData.icon) {
//       const iconPath = path.join(__dirname, "../../", skillData.icon);
//       fs.unlinkSync(iconPath);
//     }

//     res.status(200).json({ message: "Skill deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error deleting skill", error: err });
//   }
// });

// router.post("/skills-section", async (req, res) => {
//   const { name, skills } = req.body;

//   try {
//     const newSkillsSection = new skillsSection({
//       name,
//       skills,
//     });

//     await newSkillsSection.save();
//     res.status(201).json(newSkillsSection);
//   } catch (err) {
//     console.error("Error creating skills section:", err);
//     res
//       .status(500)
//       .json({ message: "Error creating skills section", error: err });
//   }
// });

// // Get all skills sections
// router.get("/skills-section", async (req, res) => {
//   try {
//     const skillsSections = await skillsSection.find().populate("skills");
//     res.status(200).json(skillsSections);
//   } catch (err) {
//     console.error("Error fetching skills sections:", err);
//     res
//       .status(500)
//       .json({ message: "Error fetching skills sections", error: err });
//   }
// });

// // Get a single skills section by ID
// router.get("/skills-section/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const skillsSection = await skillsSection.findById(id).populate("skills");

//     if (!skillsSection) {
//       return res.status(404).json({ message: "Skills section not found" });
//     }

//     res.status(200).json(skillsSection);
//   } catch (err) {
//     console.error("Error fetching skills section:", err);
//     res
//       .status(500)
//       .json({ message: "Error fetching skills section", error: err });
//   }
// });

// // Update a skills section by ID
// router.put("/skills-section/:id", async (req, res) => {
//   const { id } = req.params;
//   const { name, skills } = req.body;

//   try {
//     const updatedSkillsSection = await skillsSection
//       .findByIdAndUpdate(id, { name, skills }, { new: true })
//       .populate("skills");

//     if (!updatedSkillsSection) {
//       return res.status(404).json({ message: "Skills section not found" });
//     }

//     res.status(200).json(updatedSkillsSection);
//   } catch (err) {
//     console.error("Error updating skills section:", err);
//     res
//       .status(500)
//       .json({ message: "Error updating skills section", error: err });
//   }
// });

// // Delete a skills section by ID
// router.delete("/skills-section/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedSkillsSection = await skillsSection.findByIdAndDelete(id);

//     if (!deletedSkillsSection) {
//       return res.status(404).json({ message: "Skills section not found" });
//     }

//     res.status(200).json({ message: "Skills section deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting skills section:", err);
//     res
//       .status(500)
//       .json({ message: "Error deleting skills section", error: err });
//   }
// });

// // Route to upload a resume
// router.post("/resume", uploadResume, (req, res) => {
//   // If no file was uploaded, return an error
//   if (!req.resume) {
//     return res.status(400).json({ message: "Resume upload failed." });
//   }

//   res.status(201).json({
//     message: "Resume uploaded successfully",
//     path: "/assets/resumes/Happy_Patel.pdf",
//   });
// });

// router.get("/resume", (req, res) => {
//   const resumePath = "/assets/resumes/example-resume.pdf";
//   res.status(200).json({ path: resumePath });
// });

// router.get("/dashboard", async (req, res) => {
//   try {
//     const skillsCount = await Skill.countDocuments();
//     const skillSectionsCount = await skillsSection.countDocuments();
//     const projectsCount = await project.countDocuments();

//     const resumePath = "/assets/resumes/Happy_Patel.pdf";

//     res.status(200).json({
//       counts: {
//         skills: skillsCount,
//         skillSections: skillSectionsCount,
//         projects: projectsCount,
//       },
//       urls: {
//         github_url: urls.github_url,
//         linkedin_url: urls.linkedin_url,
//       },
//       resumePath,
//       message: "Dashboard data fetched successfully",
//     });
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     res.status(500).json({ message: "Error fetching dashboard data", error });
//   }
// });

// router.put("/urls/:platform", async (req, res) => {
//   const { platform } = req.params;
//   const { url } = req.body;

//   if (!url) {
//     return res.status(400).json({ message: "URL is required" });
//   }

//   try {
//     if (platform === "github") {
//       urls.github_url = url;
//     } else if (platform === "linkedin") {
//       urls.linkedin_url = url;
//     } else {
//       return res.status(400).json({ message: "Invalid platform" });
//     }

//     res.status(200).json({
//       message: `${platform} URL updated successfully`,
//       url: urls[`${platform}_url`],
//     });
//   } catch (error) {
//     console.error(`Error updating ${platform} URL:`, error);
//     res.status(500).json({ message: "Server error", error });
//   }
// });
// module.exports = router;
// api/admin.js
// api/admin.js
const express = require("express");
const path = require("path");
const project = require("../../db/model/project");
const skill = require("../../db/model/Skill");
const fs = require("fs");
const skillsSection = require("../../db/model/skillsSection");
const Skill = require("../../db/model/Skill");
const urls = require("../../db/model/urls");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const dotenv = require("dotenv");

const router = express.Router();
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "projects",
    resource_type: "video",
    format: async (req, file) => "mp4",
  },
});

const storageIcon = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "skills",
    resource_type: "image",
    format: async (req, file) => "svg",
  },
});

const storageResume = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resumes",
    format: async (req, file) => "pdf",
    public_id: () => "Happy_Patel",
  },
});

const uploadIcon = multer({ storage: storageIcon }).single("icon");
const upload = multer({ storage }).single("video");
const uploadResume = multer({ storage: storageResume }).single("resume");

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

router.post(
  "/projects",
  upload,
  async (req, res) => {
    const { name, description, skillsUsed, githubLink } = req.body;
    const videoPath = req.file ? req.file.path : null;

    try {
      const data = {
        name,
        description,
        skillsUsed: JSON.parse(skillsUsed),
        githubLink,
        videoPath,
        websiteLink: req.body.websiteLink || null,
      };
      const newProject = new project(data);

      await newProject.save();
      res.status(201).json(newProject);
    } catch (err) {
      console.error("Error creating project:", err);
      res.status(500).json({ message: "Error creating project", error: err });
    }
  },
  (err, req, res, next) => {
    // Error handling middleware
    console.error("Multer Error:", err);
    res.status(500).json({
      error: "An error occurred while uploading the file",
      details: err.message,
    });
  }
);

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
    const videoPath = req.file ? req.file.path : null;

    try {
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
      const publicId = path.basename(
        projectData.videoPath,
        path.extname(projectData.videoPath)
      );
      await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting project", error: err });
  }
});

router.post("/skills", uploadIcon, async (req, res) => {
  const { name, officialLink } = req.body;
  const iconPath = req.file ? req.file.path : null;

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
    const iconPath = req.file ? req.file.path : null;

    try {
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
      const publicId = path.basename(
        skillData.icon,
        path.extname(skillData.icon)
      );
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
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

router.post(
  "/resume",
  uploadResume,
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Resume upload failed. No file found." });
      }

      urls.resume = req.file.path;

      // Send back the URL of the uploaded file
      res.status(201).json({
        message: "Resume uploaded successfully",
      });
    } catch (err) {
      console.log("Error uploading resume:", err);
      res.status(500).json({ message: "Error uploading resume", error: err });
    }
  },
  (err, req, res, next) => {
    // Error handling middleware
    console.error("Multer Error:", err);
    res.status(500).json({
      error: "An error occurred while uploading the file",
      details: err.message,
    });
  }
);

router.get("/resume", (req, res) => {
  res.status(200).json({ path: urls.resume });
});

router.get("/dashboard", async (req, res) => {
  try {
    const skillsCount = await Skill.countDocuments();
    const skillSectionsCount = await skillsSection.countDocuments();
    const projectsCount = await project.countDocuments();

    const resumePath = urls.resume;

    res.status(200).json({
      counts: {
        skills: skillsCount,
        skillSections: skillSectionsCount,
        projects: projectsCount,
      },
      urls: {
        github_url: urls.github_url,
        linkedin_url: urls.linkedin_url,
      },
      resumePath,
      message: "Dashboard data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
});

router.put("/urls/:platform", async (req, res) => {
  const { platform } = req.params;
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    if (platform === "github") {
      urls.github_url = url;
    } else if (platform === "linkedin") {
      urls.linkedin_url = url;
    } else {
      return res.status(400).json({ message: "Invalid platform" });
    }

    res.status(200).json({
      message: `${platform} URL updated successfully`,
      url: urls[`${platform}_url`],
      resumePath:
        "https://res.cloudinary.com/dszbuhdfz/image/upload/v1731069452/resumes/Happy_Patel.pdf",
    });
  } catch (error) {
    console.error(`Error updating ${platform} URL:`, error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
