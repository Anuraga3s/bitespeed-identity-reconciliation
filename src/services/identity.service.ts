import { prisma } from "../prisma/client";

export const identifyContact = async (
  email?: string,
  phoneNumber?: string
) => {

  // 1️⃣ Find direct matches
  const matches = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined }
      ]
    }
  });

  // 2️⃣ If no matches → create primary
  if (matches.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "primary"
      }
    });

    return buildResponse([newContact]);
  }

  // 3️⃣ Collect primary IDs
  const primaryIds = matches.map(c =>
    c.linkPrecedence === "primary" ? c.id : c.linkedId!
  );

  const uniquePrimaryIds = [...new Set(primaryIds)];

  // 4️⃣ Fetch entire cluster
  const allContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: { in: uniquePrimaryIds } },
        { linkedId: { in: uniquePrimaryIds } }
      ]
    }
  });

  // 5️⃣ Determine oldest primary
  const sorted = allContacts.sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const truePrimary = sorted[0];

  // 6️⃣ Convert other primaries if needed
  await Promise.all(
    allContacts
      .filter(c => c.id !== truePrimary.id && c.linkPrecedence === "primary")
      .map(c =>
        prisma.contact.update({
          where: { id: c.id },
          data: {
            linkPrecedence: "secondary",
            linkedId: truePrimary.id
          }
        })
      )
  );

  // 7️⃣ Check if new secondary needed
  const exists = allContacts.some(
    c => c.email === email && c.phoneNumber === phoneNumber
  );

  if (!exists) {
    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "secondary",
        linkedId: truePrimary.id
      }
    });
  }

  // 8️⃣ Re-fetch updated cluster
  const finalContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: truePrimary.id },
        { linkedId: truePrimary.id }
      ]
    }
  });

  return buildResponse(finalContacts);
};

const buildResponse = (contacts: any[]) => {

  const primary = contacts.find(c => c.linkPrecedence === "primary");

  const emails = [...new Set(contacts.map(c => c.email).filter(Boolean))];
  const phones = [...new Set(contacts.map(c => c.phoneNumber).filter(Boolean))];

  return {
    contact: {
      primaryContactId: primary.id,
      emails,
      phoneNumbers: phones,
      secondaryContactIds: contacts
        .filter(c => c.linkPrecedence === "secondary")
        .map(c => c.id)
    }
  };
};