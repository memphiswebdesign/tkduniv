// cal-spark.js — Cal.com → Spark Membership REST API integration
// Receives Cal.com BOOKING_CREATED webhook and:
//   1. Logs into Spark with a service account
//   2. Creates a Prospect contact
//   3. Tags the contact with the program name
//   4. Creates a calendar event with the booked appointment time
//
// Required Netlify env vars:
//   SPARK_USER          — service account email (tkdunivappt@gmail.com)
//   SPARK_PASS          — service account password
//   CAL_WEBHOOK_SECRET  — HMAC secret set on the Cal.com webhook

const https  = require("https");
const crypto = require("crypto");

const SPARK_HOST       = "app.sparkmembership.com";
const SPARK_API_PATH   = "/api/mobileApp/api.ashx";
const SPARK_LOCATION   = "6448";

// Match Cal.com event type title substrings → Spark event type IDs
const EVENT_TYPE_MAP = [
  { match: /little warrior/i, id: 101740 },
  { match: /kid/i,            id: 101741 },
  { match: /teen|adult/i,     id: 101883 },
];

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // ── Verify Cal.com HMAC-SHA256 signature ─────────────────────────────────
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (secret) {
    const sig      = event.headers["x-cal-signature-256"] || "";
    const expected = crypto.createHmac("sha256", secret).update(event.body).digest("hex");
    if (sig !== expected) {
      console.error("cal-spark: invalid signature");
      return { statusCode: 401, body: "Unauthorized" };
    }
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const triggerEvent = body.triggerEvent || "";
  if (triggerEvent && triggerEvent !== "BOOKING_CREATED") {
    return { statusCode: 200, body: "Ignored: " + triggerEvent };
  }

  const payload   = body.payload || body;
  const responses = payload.responses || {};
  const attendees = payload.attendees || [];

  const fullName  = valueOf(responses.name)  || (attendees[0] && attendees[0].name)  || "";
  const email     = valueOf(responses.email) || (attendees[0] && attendees[0].email) || "";
  const phone     = valueOf(responses.attendeePhoneNumber) || "";
  const notes     = valueOf(responses.notes) || "";
  const program   = (payload.eventType && payload.eventType.title) || payload.type || "";
  const startTime = payload.startTime || "";
  const endTime   = payload.endTime   || "";

  const parts     = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName  = parts.slice(1).join(" ") || "";

  console.log("cal-spark: booking received", { firstName, lastName, email, phone, program, startTime, endTime });

  try {
    // 1) Login → get session credentials
    const { userID, apiKey } = await sparkLogin();
    console.log("cal-spark: logged in, userID:", userID);

    // 2) Create Prospect contact
    const contactID = await sparkAddContact({
      userID, apiKey,
      firstName, lastName, email, phone, notes,
      source: program,
    });
    console.log("cal-spark: prospect created, contactID:", contactID);

    // 3) Tag with program name
    if (program) {
      await sparkAddTag({ userID, apiKey, contactID, tag: program });
      console.log("cal-spark: tagged:", program);
    }

    // 4) Calendar event with booked appointment time
    if (startTime) {
      const entry = EVENT_TYPE_MAP.find((e) => e.match.test(program));
      await sparkAddCalendarEvent({
        userID, apiKey, contactID,
        subject:     program || "Intro Class",
        startTime,
        endTime:     endTime || startTime,
        eventTypeID: entry ? entry.id : undefined,
      });
      console.log("cal-spark: calendar event created");
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("cal-spark: error —", err.message);
    return { statusCode: 502, body: "Upstream error" };
  }
};

// ── Spark API calls ────────────────────────────────────────────────────────

async function sparkLogin() {
  const res = await sparkPost({
    action:       "login",
    userEmail:    process.env.SPARK_USER || "",
    userPassword: process.env.SPARK_PASS || "",
  });
  console.log("cal-spark: login response", JSON.stringify(res));
  if (!res.userID || !res.apiKey) {
    throw new Error("Spark login failed: " + JSON.stringify(res));
  }
  return { userID: String(res.userID), apiKey: String(res.apiKey) };
}

async function sparkAddContact({ userID, apiKey, firstName, lastName, email, phone, notes, source }) {
  const res = await sparkPost({
    action:      "addContact",
    userID,
    apiKey,
    locationID:  SPARK_LOCATION,
    contactType: "P",
    firstName,
    lastName,
    email,
    mobile:      phone,
    notes,
    source,
  });
  console.log("cal-spark: addContact response", JSON.stringify(res));
  // Spark may return contactID directly or nested — handle both
  const id = res.contactID || (res.data && res.data.contactID) || res.id;
  if (!id) throw new Error("addContact: no contactID in response — " + JSON.stringify(res));
  return String(id);
}

async function sparkAddTag({ userID, apiKey, contactID, tag }) {
  const res = await sparkPost({
    action:    "addTagToContact",
    userID,
    apiKey,
    contactID,
    tagName:   tag,
  });
  console.log("cal-spark: addTagToContact response", JSON.stringify(res));
}

async function sparkAddCalendarEvent({ userID, apiKey, contactID, subject, startTime, endTime, eventTypeID }) {
  const payload = {
    action:           "addNewCalendarEvent",
    userID,
    apiKey,
    contactID,
    locationID:       SPARK_LOCATION,
    subject,
    startDate:        startTime,
    endDate:          endTime,
    userIDCreatedBy:  userID,
    userIDAssignedTo: userID,
    status:           "Scheduled",
  };
  if (eventTypeID) payload.eventTypeID = String(eventTypeID);

  const res = await sparkPost(payload);
  console.log("cal-spark: addNewCalendarEvent response", JSON.stringify(res));
}

// ── HTTP helper ────────────────────────────────────────────────────────────

function sparkPost(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: SPARK_HOST,
      path:     SPARK_API_PATH,
      method:   "POST",
      headers:  {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(body),
        "User-Agent":     "tkduniv-netlify-function/1.0",
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try   { resolve(JSON.parse(data)); }
        catch { resolve({ _raw: data }); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── Utility ────────────────────────────────────────────────────────────────

function valueOf(field) {
  if (!field) return "";
  return typeof field === "string" ? field : (field.value || "");
}
