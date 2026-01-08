const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitor");

router.post("/", async (req, res, next) => {
    try {
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress;

        const userAgent = req.headers["user-agent"];
        const today = new Date().toISOString().split("T")[0];        

        const alreadyVisited = await Visitor.findOne({
            ip,
            date: today
        });

        if (!alreadyVisited) {
            await Visitor.create({ ip, userAgent, date: today });
        }

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
