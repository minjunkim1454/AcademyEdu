const express = require("express");
const crypto = require("crypto");
const { exec } = require("child_process");

const app = express();
const PORT = 443; // HTTPS 포트
const WEBHOOK_SECRET = "Kmjrlaalswns318!";
const PROJECT_PATH = "C:\\Users\\academyedu\\Desktop\\AcademyEdu\\AcademyEdu";

app.use(express.json());

// Webhook 엔드포인트
app.post("/webhook", (req, res) => {
    const signature = req.headers["x-hub-signature-256"];
    const payload = JSON.stringify(req.body);

    // Webhook Secret 검증
    const hash = `sha256=${crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(payload)
        .digest("hex")}`;

    if (hash !== signature) {
        return res.status(401).send("Unauthorized");
    }

    console.log("Webhook payload received:", req.body);

    // Push 이벤트 처리
    if (req.body.ref === "refs/heads/main") {
        console.log("Push event detected. Pulling latest code...");
        exec(`cd ${PROJECT_PATH} && git pull origin main`, (error, stdout, stderr) => {
            if (error) {
                console.error("Error during git pull:", error);
                res.status(500).send("Git pull failed");
                return;
            }
            console.log("Git pull successful:", stdout);
            res.status(200).send("Code updated successfully!");
        });
    } else {
        res.status(200).send("No action required");
    }
});

app.listen(PORT, () => {
    console.log(`Webhook server running at https://academyedu.co.kr/webhook`);
});
