// cal-spark.js — Cal.com → Spark Membership REST API integration
// Receives Cal.com BOOKING_CREATED webhook and:
//   1. Logs into Spark with a service account       (action=login)
//   2. Creates a Prospect contact                   (action=addContact)
//   3. Tags the contact with the program name       (action=addTagToContact)
//   4. Creates a calendar event at the booked time  (action=addNewCalendarEvent)
//
// Field names and the form-urlencoded transport below follow the Spark
// mobileApp API doc. NOTE: the API sends params as x-www-form-urlencoded,
// NOT JSON — a JSON body gets a bare 400 "Bad Request" from IIS.
//
// Required Netlify env vars:
//   SPARK_USER          — service account email for Spark login
//   SPARK_PASS          — service account password
//   CAL_WEBHOOK_SECRET  — HMAC secret set on the Cal.com webhook

const https  = require("https");
const crypto = require("crypto");

const SPARK_HOST     = "app.sparkmembership.com";
const SPARK_API_PATH = "/api/mobileApp/api.ashx";
const SPARK_LOCATION = "6448";
const STUDIO_TZ      = "America/Chicago";

// Cal.com sends the event-type SLUG (e.g. "little-warrior"), not the title.
// Match on a normalized form so either a slug or a title works.
const PROGRAMS = [
  { match: /little\s*warrior/, title: "Little Warriors", eventTypeID: 101740 },
  { match: /kid/,              title: "Kids Taekwondo",  eventTypeID: 101741 },
  { match: /teen|adult/,       title: "Teen / Adult",    eventTypeID: 101883 },
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
  const endTime   = payload.endTime   || "";

  const parts     = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName  = parts.slice(1).join(" ") || "";

  // Resolve slug/title → display name + Spark event type.
  const normalized = rawType.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const program    = PROGRAMS.find((p) => p.match.test(normalized)) || null;
  const programName = program ? program.title : rawType;

  const start = toSparkDate(startTime);
  const end   = toSparkDate(endTime) || start;

  console.log("cal-spark: booking received", {
    firstName, lastName, email, phone, rawType, programName, start, end,
  });

  try {
    // 1) Login → session credentials
    const { userID, apiKey } = await sparkLogin();
    console.log("cal-spark: logged in as userID", userID);

    // 2) Create the Prospect
    const contactID = await sparkAddContact({
      userID, apiKey, firstName, lastName, email, phone,
      about: [calNotes, programName ? "Program: " + programName : "", start ? "Appt: " + start : ""]
        .filter(Boolean).join(" | "),
    });
    console.log("cal-spark: prospect created, contactID", contactID);

    // 3) Tag with the program name (Spark accepts an existing tag name here)
    if (programName) {
      await sparkCall({
        action:     "addTagToContact",
        locationID: SPARK_LOCATION,
        apiKey,
        contactID,
        tags:       programName,
      }, "addTagToContact");
    }

    // 4) Calendar event at the booked time
    if (start) {
      await sparkCall({
        action:           "addNewCalendarEvent",
        locationID:       SPARK_LOCATION,
        apiKey,
        userID,
        contactID,
        title:            programName + " — Intro Class (" + fullName + ")",
        allDay:           "false",
        start,
        end,
        eventTypeID:      program ? String(program.eventTypeID) : "",
        userIDCreatedBy:  userID,
        userIDAssignedTo: userID,
        emailAddress:     email,
        mobilePhone:      phone,
        contactName:      fullName,
        notes:            calNotes,
      }, "addNewCalendarEvent");
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    // Always 200 so Cal.com doesn't retry a call that will fail identically.
    console.error("cal-spark: FAILED —", err.message);
    return { statusCode: 200, body: "Logged failure" };
  }
};

// ── Spark API calls ────────────────────────────────────────────────────────

async function sparkLogin() {
  const res = await sparkCall({
    action: "login",
    user:   process.env.SPARK_USER || "",
    pass:   process.env.SPARK_PASS || "",
  }, "login");

  const userID = res.userID || res.userId || res.id;
  const apiKey = res.apiKey || res.apikey;
  if (!userID || !apiKey) {
    throw new Error("login: no userID/apiKey in response — " + JSON.stringify(res));
  }
  return { userID: String(userID), apiKey: String(apiKey) };
}

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

// Cal.com sends UTC ISO ("2026-08-18T21:30:00.000Z"). Spark is a .NET app
// expecting studio-local datetimes, so convert to "YYYY-MM-DD HH:mm:ss" in
// the studio's timezone.
function toSparkDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDIO_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(d).reduce((acc, x) => (acc[x.type] = x.value, acc), {});
  return `${p.year}-${p.month}-${p.day} ${p.hour === "24" ? "00" : p.hour}:${p.minute}:${p.second}`;
}
