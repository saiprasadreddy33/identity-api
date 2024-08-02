import { Router, Request, Response } from 'express';
import Contact, { IContact } from '../models/Contact';
import { Types } from 'mongoose';

const router = Router();

router.post('/identify', async (req: Request, res: Response) => {
  const { email, phoneNumber }: { email?: string; phoneNumber?: string } = req.body;

  try {
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Email or phoneNumber must be provided' });
    }

    // Find existing contacts
    const existingContacts = await Contact.find({
      $or: [{ email }, { phoneNumber }]
    }).sort({ createdAt: 1 });

    let primaryContact: IContact | null = null;
    let secondaryContactIds: Types.ObjectId[] = [];

    // If no existing contacts, create a new primary contact
    if (existingContacts.length === 0) {
      primaryContact = new Contact({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      });
      await primaryContact.save();
    } else {
      // The oldest contact is considered the primary one
      primaryContact = existingContacts[0];

      // Check if a secondary contact needs to be created
      if (existingContacts.length > 1) {
        for (let i = 1; i < existingContacts.length; i++) {
          const existingContact = existingContacts[i];
          if (existingContact.email !== primaryContact.email || existingContact.phoneNumber !== primaryContact.phoneNumber) {
            // Create a secondary contact if there's new information
            const newSecondaryContact = new Contact({
              email: existingContact.email,
              phoneNumber: existingContact.phoneNumber,
              linkPrecedence: 'secondary',
              linkedId: primaryContact._id,
            });
            await newSecondaryContact.save();
            secondaryContactIds.push(newSecondaryContact._id as Types.ObjectId);
          }
        }
      }
    }

    // Find all linked contacts
    const linkedContacts = await Contact.find({ linkedId: primaryContact?._id });

    // Consolidate email and phone numbers
    const emails = Array.from(new Set([primaryContact?.email, ...linkedContacts.map(c => c.email)]));
    const phoneNumbers = Array.from(new Set([primaryContact?.phoneNumber, ...linkedContacts.map(c => c.phoneNumber)]));

    // Response
    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact?._id,
        emails: emails.filter((email): email is string => !!email),
        phoneNumbers: phoneNumbers.filter((phoneNumber): phoneNumber is string => !!phoneNumber),
        secondaryContactIds: secondaryContactIds.filter((id): id is Types.ObjectId => !!id),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
