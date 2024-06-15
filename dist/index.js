"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const Contact_1 = __importDefault(require("./models/Contact"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const uri = "mongodb+srv://watto:Saiprasadreddy@cluster0.tz7kuxn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose_1.default.connect(uri).then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.error('Error connecting to MongoDB', error);
});
app.post('/identify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phoneNumber } = req.body;
    // Find contacts matching email or phoneNumber
    const existingContacts = yield Contact_1.default.find({
        $or: [
            { email },
            { phoneNumber },
        ],
    });
    if (existingContacts.length === 0) {
        // No existing contact, create a new primary contact
        const newContact = new Contact_1.default({
            email,
            phoneNumber,
            linkPrecedence: 'primary',
        });
        const savedContact = yield newContact.save();
        return res.json({
            contact: {
                primaryContatctId: savedContact._id,
                emails: [email],
                phoneNumbers: [phoneNumber],
                secondaryContactIds: [],
            },
        });
    }
    // Find primary contact and all linked contacts
    const primaryContact = existingContacts.find(c => c.linkPrecedence === 'primary') || existingContacts[0];
    const linkedContacts = yield Contact_1.default.find({
        linkedId: primaryContact._id,
    });
    // Aggregate all unique emails and phoneNumbers
    const emails = Array.from(new Set([primaryContact.email, ...linkedContacts.map(c => c.email)]));
    const phoneNumbers = Array.from(new Set([primaryContact.phoneNumber, ...linkedContacts.map(c => c.phoneNumber)]));
    const secondaryContactIds = linkedContacts.map(c => c._id);
    // Check if a new secondary contact needs to be created
    if (!existingContacts.some(c => c.email === email && c.phoneNumber === phoneNumber)) {
        const newSecondaryContact = new Contact_1.default({
            email,
            phoneNumber,
            linkPrecedence: 'secondary',
            linkedId: primaryContact._id,
        });
        yield newSecondaryContact.save();
        secondaryContactIds.push(newSecondaryContact._id);
    }
    // Return the consolidated contact information
    return res.json({
        contact: {
            primaryContatctId: primaryContact._id,
            emails: emails.filter(e => e),
            phoneNumbers: phoneNumbers.filter(p => p),
            secondaryContactIds,
        },
    });
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
