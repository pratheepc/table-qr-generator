const express = require("express");
const path = require("path");
const JSZip = require("jszip");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// Increase payload size limit to handle larger JSON data
app.use(express.json({ limit: "50mb" }));

const publicDir = path.join(__dirname, "public");

// Generate and save the ZIP file at startup
const generateAndSaveZip = () => {
  const zip = new JSZip();
  // Add files to the zip as needed

  zip
    .generateNodeStream({ type: "nodebuffer", streamFiles: true })
    .pipe(fs.createWriteStream(path.join(publicDir, "QR_Codes.zip")))
    .on("finish", () => {
      console.log("ZIP file generated and saved.");
    })
    .on("error", (err) => {
      console.error("Error writing ZIP file:", err);
    });
};

generateAndSaveZip(); // Call the function at startup

// Serve static files from the 'public' directory
app.use(express.static(publicDir));

// Serve the HTML file when accessing the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/generateAndDownloadZip", (req, res) => {
  const zip = new JSZip();
  const data = req.body;

  data.forEach(({ folderPath, fileName, content }) => {
    zip.file(`${folderPath}/${fileName}`, content, { base64: true });
  });

  zip
    .generateNodeStream({ type: "nodebuffer", streamFiles: true })
    .pipe(fs.createWriteStream(path.join(publicDir, "QR_Codes.zip")))
    .on("finish", () => {
      res.json({ success: true });
    })
    .on("error", (err) => {
      console.error("Error writing ZIP file:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// ... (other routes if any)

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
