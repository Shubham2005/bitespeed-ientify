"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyService = void 0;
const db_1 = require("../db");
const identifyService = async (email, phoneNumber) => {
    const client = await db_1.pool.connect();
    try {
        await client.query("BEGIN");
        // 1️⃣ Find direct matches
        const matchResult = await client.query(`SELECT * FROM "Contact"
       WHERE email = $1 OR "phoneNumber" = $2`, [email || null, phoneNumber || null]);
        if (matchResult.rows.length === 0) {
            const insertResult = await client.query(`INSERT INTO "Contact"
   (email, "phoneNumber", "linkPrecedence", "createdAt", "updatedAt")
   VALUES ($1, $2, 'primary', NOW(), NOW())
   RETURNING *`, [email || null, phoneNumber || null]);
            await client.query("COMMIT");
            return buildResponse([insertResult.rows[0]]);
        }
        const matches = matchResult.rows;
        const relatedIds = new Set();
        matches.forEach((contact) => {
            relatedIds.add(contact.id);
            if (contact.linkedId)
                relatedIds.add(contact.linkedId);
        });
        const clusterResult = await client.query(`SELECT * FROM "Contact"
       WHERE id = ANY($1)
       OR "linkedId" = ANY($1)`, [Array.from(relatedIds)]);
        const cluster = clusterResult.rows;
        const primaries = cluster.filter((c) => c.linkPrecedence === "primary");
        const primary = primaries.sort((a, b) => new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime())[0];
        // Convert extra primaries
        for (const contact of primaries) {
            if (contact.id !== primary.id) {
                await client.query(`UPDATE "Contact"
           SET "linkPrecedence"='secondary',
               "linkedId"=$1
           WHERE id=$2`, [primary.id, contact.id]);
            }
        }
        // Check new info
        const existingEmails = cluster.map((c) => c.email);
        const existingPhones = cluster.map((c) => c.phoneNumber);
        if ((email && !existingEmails.includes(email)) ||
            (phoneNumber && !existingPhones.includes(phoneNumber))) {
            await client.query(`INSERT INTO "Contact"
   (email, "phoneNumber", "linkPrecedence", "linkedId", "createdAt", "updatedAt")
   VALUES ($1, $2, 'secondary', $3, NOW(), NOW())`, [email || null, phoneNumber || null, primary.id]);
        }
        const finalResult = await client.query(`SELECT * FROM "Contact"
       WHERE id=$1 OR "linkedId"=$1`, [primary.id]);
        await client.query("COMMIT");
        return buildResponse(finalResult.rows);
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
};
exports.identifyService = identifyService;
function buildResponse(contacts) {
    const primary = contacts.find((c) => c.linkPrecedence === "primary");
    const secondaries = contacts.filter((c) => c.linkPrecedence === "secondary");
    return {
        contact: {
            primaryContactId: primary.id,
            emails: [
                primary.email,
                ...secondaries.map((c) => c.email)
            ].filter(Boolean),
            phoneNumbers: [
                primary.phoneNumber,
                ...secondaries.map((c) => c.phoneNumber)
            ].filter(Boolean),
            secondaryContactIds: secondaries.map((c) => c.id)
        }
    };
}
