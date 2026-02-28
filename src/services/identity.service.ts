import { pool } from "../db";

export const identifyService = async (
  email?: string,
  phoneNumber?: string
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Find direct matches
    const matchResult = await client.query(
      `SELECT * FROM "Contact"
       WHERE email = $1 OR "phoneNumber" = $2`,
      [email || null, phoneNumber || null]
    );

    if (matchResult.rows.length === 0) {
      const insertResult = await client.query(
        `INSERT INTO "Contact"
         (email, "phoneNumber", "linkPrecedence")
         VALUES ($1, $2, 'primary')
         RETURNING *`,
        [email || null, phoneNumber || null]
      );

      await client.query("COMMIT");

      return buildResponse([insertResult.rows[0]]);
    }

    const matches = matchResult.rows;

    const relatedIds = new Set<number>();

    matches.forEach((contact: any) => {
      relatedIds.add(contact.id);
      if (contact.linkedId) relatedIds.add(contact.linkedId);
    });

    const clusterResult = await client.query(
      `SELECT * FROM "Contact"
       WHERE id = ANY($1)
       OR "linkedId" = ANY($1)`,
      [Array.from(relatedIds)]
    );

    const cluster = clusterResult.rows;

    const primaries = cluster.filter(
      (c: any) => c.linkPrecedence === "primary"
    );

    const primary = primaries.sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    )[0];

    // Convert extra primaries
    for (const contact of primaries) {
      if (contact.id !== primary.id) {
        await client.query(
          `UPDATE "Contact"
           SET "linkPrecedence"='secondary',
               "linkedId"=$1
           WHERE id=$2`,
          [primary.id, contact.id]
        );
      }
    }

    // Check new info
    const existingEmails = cluster.map((c: any) => c.email);
    const existingPhones = cluster.map((c: any) => c.phoneNumber);

    if (
      (email && !existingEmails.includes(email)) ||
      (phoneNumber && !existingPhones.includes(phoneNumber))
    ) {
      await client.query(
        `INSERT INTO "Contact"
         (email, "phoneNumber", "linkPrecedence", "linkedId")
         VALUES ($1, $2, 'secondary', $3)`,
        [email || null, phoneNumber || null, primary.id]
      );
    }

    const finalResult = await client.query(
      `SELECT * FROM "Contact"
       WHERE id=$1 OR "linkedId"=$1`,
      [primary.id]
    );

    await client.query("COMMIT");

    return buildResponse(finalResult.rows);

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

function buildResponse(contacts: any[]) {
  const primary = contacts.find(
    (c: any) => c.linkPrecedence === "primary"
  );

  const secondaries = contacts.filter(
    (c: any) => c.linkPrecedence === "secondary"
  );

  return {
    contact: {
      primaryContactId: primary.id,
      emails: [
        primary.email,
        ...secondaries.map((c: any) => c.email)
      ].filter(Boolean),
      phoneNumbers: [
        primary.phoneNumber,
        ...secondaries.map((c: any) => c.phoneNumber)
      ].filter(Boolean),
      secondaryContactIds: secondaries.map((c: any) => c.id)
    }
  };
}