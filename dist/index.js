"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const identify_1 = __importDefault(require("./routes/identify"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
const uri = "mongodb+srv://watto:EGZFuG8nI1CE4yhT@cluster0.tz7kuxn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose_1.default.connect(uri).then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.error('Error connecting to MongoDB', error);
});
// Routes
app.use('/', identify_1.default);
// Global error handling middleware with explicit types
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
