const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatHistory = require("../models/ChatHistory");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        message: "Message and userId are required",
      });
    }

    // Lấy lịch sử từ DB
    let chatHistory = await ChatHistory.findOne({ userId });
    if (!chatHistory) {
      chatHistory = new ChatHistory({ userId, messages: [] });
    }

    // Tạo session với lịch sử
    const chat = model.startChat({
      history: chatHistory.messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: { maxOutputTokens: 10000 },
    });

    const result = await chat.sendMessage(message);
    console.log("result", result);
    const responseText = result.response.candidates[0].content.parts
      .map(p => p.text)
      .join("");

    // Lưu user message và model reply vào DB
    // chatHistory.messages.push({ role: "user", content: message });
    // chatHistory.messages.push({ role: "model", content: responseText });
    // if (chatHistory.messages.length > 50) {
    // chatHistory.messages = chatHistory.messages.slice(-50);
    // }
    // await chatHistory.save();

    return res.json({
      success: true,
      reply: responseText,
    });
  } catch (error) {
    console.error("Gemini Chatbot Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
