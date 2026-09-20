const express = require("express");

const app = express();
const PORT = 4000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "CLARO backend is running"
    });
});

app.listen(PORT, () => {
    console.log(`CLARO backend running on http://localhost:${PORT}`);
});