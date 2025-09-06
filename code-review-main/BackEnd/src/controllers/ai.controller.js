const aiService = require("../services/ai.service")


module.exports.getReview = async (req, res) => {

    const code = req.body.code;
    const language = req.body.language || 'javascript';

    if (!code) {
        return res.status(400).send("Prompt is required");
    }

    // Pass both code and language to the service
    const response = await aiService(code, language);

    res.send(response);

}