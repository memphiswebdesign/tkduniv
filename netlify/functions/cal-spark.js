// cal-spark.js — Cal.com → Spark Membership REST API integration
// Receives Cal.com BOOKING_CREATED webhook and:
//   1. Creates a Prospect contact                   (action=addContact)
//   2. Tags the contact with the program tag        (action=addTagToContact)
// The time the lead picked is written into the contact's About field; staff
// confirm by phone and set the Spark appointment themselves (see NOTE below).
//
// Transport: x-www-form-urlencoded, NOT JSON. Responses are array-wrapped.
//
// IMPORTANT — why there is no login step: Spark validates `apiKey` before it
// parses anything else, so a missing/invalid key returns a bare 400
// "Bad Request" for EVERY request regardless of action or params. With a valid
// key, apiKey + a staff userID is sufficient for all three calls below, so
// action=login (and any stored login credentials) is unnecessary.
//
// Reference data below was read live from the account via getCalendarEventTypes,
// getTags and getCalendarUsers.
//
// Required Netlify env vars:
//   SPARK_API_KEY       — Spark Settings → API/Tracking key
//   CAL_WEBHOOK_SECRET  — HMAC secret set on the Cal.com webhook
//                         (every Cal webhook pointing here must use this value)

const https  = require("https");
const crypto = require("crypto");

const SPARK_HOST     = "app.sparkmembership.com";
const SPARK_API_PATH = "/api/mobileApp/api.ashx";
const SPARK_LOCATION = "6448";
const STUDIO_TZ      = "America/Chicago";

// Staff member the booking is created by / assigned to — "TKDUNIV APPT" (the
// service account), from action=getCalendarUsers.
const SPARK_STAFF_USER_ID = process.env.SPARK_STAFF_USER_ID || "97768";

// Cal.com sends the event-type SLUG (e.g. "little-warrior"), not the title.
// Match on a normalized form so either a slug or a title works.
// eventTypeID  → action=getCalendarEventTypes (unused while the calendar call
//                is disabled; kept so it need not be looked up again)
// tagID        → action=getTags (reuses the existing "interested-in-*" lead
//                tags the /free form already applies, so the CRM stays consistent)
const PROGRAMS = [
  { match: /little\s*warrior/, title: "Little Warriors", eventTypeID: 101740, tagID: 596995 },
  { match: /kid/,              title: "Kids Taekwondo",  eventTypeID: 101741, tagID: 596988 },
  { match: /teen|adult/,       title: "Teen / Adult",    eventTypeID: 101883, tagID: 596993 },
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

  const fullName  = respVal(responses.name)  || (attendees[0] && attendees[0].name)  || "";
  const email     = respVal(responses.email) || (attendees[0] && attendees[0].email) || "";
  const phone     = respVal(responses.attendeePhoneNumber) || "";
  const calNotes  = respVal(responses.notes) || "";
  const rawType   = (payload.eventType && payload.eventType.slug)
                 || (payload.eventType && payload.eventType.title)
                 || payload.type || "";
  const startTime = payload.startTime || "";

  const parts     = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName  = parts.slice(1).join(" ") || "";

  // Resolve slug/title → display name + Spark event type.
  const normalized = rawType.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const program    = PROGRAMS.find((p) => p.match.test(normalized)) || null;
  const programName = program ? program.title : rawType;

  // Human-readable for staff, e.g. "Thu, Aug 13, 2026 at 4:30 PM CDT".
  const requested = toReadableDate(startTime);

  console.log("cal-spark: booking received", {
    firstName, lastName, email, phone, rawType, programName, requested,
  });

  const apiKey = process.env.SPARK_API_KEY || "";
  const userID = SPARK_STAFF_USER_ID;
  if (!apiKey) {
    console.error("cal-spark: SPARK_API_KEY is not set — aborting");
    return { statusCode: 200, body: "Missing API key" };
  }

  try {
    // 1) Create the Prospect.
    // Staff confirm the appointment by phone and set it in Spark themselves, so
    // the time the lead picked in Cal.com goes here for them to read off.
    const contactID = await sparkAddContact({
      userID, apiKey, firstName, lastName, email, phone,
      // Requested time first — it is what staff need on the confirmation call,
      // and it survives anywhere the UI truncates this field.
      about: [
        requested   ? "Requested: " + requested : "",
        programName ? "Program: " + programName : "",
        calNotes    ? "Notes: " + calNotes : "",
        "Booked via Cal.com",
      ].filter(Boolean).join(" | "),
    });
    console.log("cal-spark: prospect created, contactID", contactID);

    // 2) Tag with the program's existing lead tag (tagID is more reliable
    //    than a tag name, which Spark would have to resolve or create).
    if (program) {
      await sparkCall({
        action:     "addTagToContact",
        locationID: SPARK_LOCATION,
        apiKey,
        contactID,
        tags:       String(program.tagID),
      }, "addTagToContact");
    } else {
      console.warn("cal-spark: no program match for", rawType, "— skipping tag");
    }

    // NOTE: no calendar event is created here on purpose. action=addNewCalendarEvent
    // returns Spark's generic "Ooops" HTML page rather than JSON, while addContact
    // and addTagToContact on the same endpoint return clean JSON — so that action
    // name (or its expected params) does not match the integration doc. Staff
    // confirm by phone and set the appointment in Spark manually, so the requested
    // time is written into the contact's About field above instead.

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    // Always 200 so Cal.com doesn't retry a call that will fail identically.
    console.error("cal-spark: FAILED —", err.message);
    return { statusCode: 200, body: "Logged failure" };
  }
};

// ── Spark API calls ────────────────────────────────────────────────────────

async function sparkAddContact({ userID, apiKey, firstName, lastName, email, phone, about }) {
  const res = await sparkCall({
    action:       "addContact",
    locationID:   SPARK_LOCATION,
    userID,
    apiKey,
    firstName,
    lastName,
    contactType:  "P",          // P = Prospect
    emailAddress: email,
    mobilePhone:  phone,
    about,
  }, "addContact");

  const id = res.contactID || res.contactId;
  if (!id) throw new Error("addContact: no contactID — " + JSON.stringify(res));
  return String(id);
}

// Single entry point for every Spark call: form-encodes, POSTs, unwraps the
// array-wrapped response, logs it, and throws on an explicit failure result.
async function sparkCall(params, label) {
  const res = await sparkPost(params);
  console.log("cal-spark: " + label + " response", JSON.stringify(res));

  if (res._raw !== undefined) {
    throw new Error(label + ": non-JSON response — " + String(res._raw).slice(0, 200));
  }
  if (String(res.result || "").toLowerCase() === "fail") {
    throw new Error(label + ": " + (res.message || "failed"));
  }
  return res;
}

// ── HTTP helper ────────────────────────────────────────────────────────────

function sparkPost(params) {
  return new Promise((resolve, reject) => {
    const clean = {};
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== "") clean[k] = params[k];
    });
    const body = new URLSearchParams(clean).toString();

    const req = https.request(
      {
        hostname: SPARK_HOST,
        path:     SPARK_API_PATH,
        method:   "POST",
        headers:  {
          "Content-Type":   "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
          "User-Agent":     "tkduniv-netlify-function/1.0",
          "Accept":         "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            // Spark wraps single results in an array: [{"result":"success",...}]
            resolve(Array.isArray(parsed) ? (parsed[0] || {}) : parsed);
          } catch {
            resolve({ _raw: "HTTP " + res.statusCode + " " + data.slice(0, 200) });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── Utilities ──────────────────────────────────────────────────────────────

function respVal(field) {
  if (!field) return "";
  return typeof field === "string" ? field : (field.value || "");
}

// Cal.com sends UTC ISO ("2026-08-13T21:30:00.000Z"). Render it in the studio's
// timezone for staff to read, e.g. "Thu, Aug 13, 2026 at 4:30 PM CDT".
function toReadableDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  try {
    return d.toLocaleString("en-US", {
      timeZone: STUDIO_TZ,
      weekday: "short", month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}
