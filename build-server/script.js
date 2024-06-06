const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});
const PROJECT_ID = process.env.PROJECT_ID;
async function init() {
  console.log("Executing script.js");

  const outDirPath = path.join(__dirname, "output");

  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  p.stdout.on("data", function (data) {
    console.log(data.toString());
  });
  p.stdout.on("error", function (data) {
    console.log("Error", data.toString());
  });
  p.on("close", async function () {
    console.log("Build Complete");
    const distFolderPath = path.join(__dirname, "output", "dist");
    console.log(distFolderPath);
    const distFolderContent = fs.readdirSync(distFolderPath, {
      recursive: true,
    });
    for (const file of distFolderContent) {
      const filePath = path.join(distFolderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) continue;
      console.log("Uploading...", filePath, "🚀🚀");
      const command = new PutObjectCommand({
        Bucket: "vercerl-clone",
        Key: `__outputs/${PROJECT_ID}/${file}`,
        body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath),
      });
      await s3Client.send(command);
      console.log("Uploaded...", filePath, "😁😁");
    }
    console.log("Uploading Done To S3 Bucket    ");
  });
}
init();
