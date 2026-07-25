// cal-spark.js
// Receives a Cal.com BOOKING_CREATED webhook and creates a Prospect in Spark Membership
// by POSTing to Spark's form endpoint (same destination as the embedded HTML form).
//
// Required Netlify env vars:
//   SPARK_API_KEY        — value of the apiKey hidden field from the Spark HTML form
//   CAL_WEBHOOK_SECRET   — the secret you set when creating the Cal.com webhook
//                          (leave unset to skip signature verification during dev)

const https  = require("https");
const crypto = require("crypto");

const SPARK_HOST      = "app.sparkmembership.com";
const SPARK_PATH      = "/wf/process.aspx";
const SPARK_LOCATION  = "6448";
const SPARK_FORM_ID   = "39248";

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // ── Verify Cal.com HMAC-SHA256 signature ───────────────────────────────────
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (secret) {
    const sig      = event.headers["x-cal-signature-256"] || "";
    const expected = crypto.createHmac("sha256", secret).update(event.body).digest("hex");
    if (sig !== expected) {
      console.error("cal-spark: invalid signature");
      return { statusCode: 401, body: "Unauthorized" };
    }
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  // Cal.com sends triggerEvent at the top level; data lives under payload.
  const triggerEvent = body.triggerEvent || "";
  if (triggerEvent && triggerEvent !== "BOOKING_CREATED") {
    return { statusCode: 200, body: "Ignored: " + triggerEvent };
  }

  const payload   = body.payload || body;
  const responses = payload.responses || {};
  const attendees = payload.attendees || [];

  // ── Extract attendee fields ────────────────────────────────────────────────
  // Prefer responses (booking question answers); fall back to attendees array.
  const fullName = valueOf(responses.name)  || (attendees[0] && attendees[0].name)  || "";
  const email    = valueOf(responses.email) || (attendees[0] && attendees[0].email) || "";
  const phone    = valueOf(responses.attendeePhoneNumber) || "";
  const notes    = valueOf(responses.notes) || "";
  const program  = (payload.eventType && payload.eventType.title) || payload.type || "";

  // Split "First Last" → separate fields Spark requires.
  const parts     = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName  = parts.slice(1).join(" ") || "";

  // ── POST to Spark ──────────────────────────────────────────────────────────
  const params = new URLSearchParams({
    ab_locationID:   SPARK_LOCATION,
    ab_fid:          SPARK_FORM_ID,
    apiKey:          process.env.SPARK_API_KEY || "",
    ab_upID:         "",
    ab_uuid:         "",
    ab_firstName:    firstName,
    ab_lastName:     lastName,
    ab_mobile:       phone,
    ab_emailaddress: email,
  });

  try {
    const sparkStatus = await postForm(params.toString());
    console.log("cal-spark: Spark responded", sparkStatus, { firstName, lastName, email, phone, program });
    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("cal-spark: Spark POST failed", err.message);
    return { statusCode: 502, body: "Upstream error" };
  }
};

// ── Helpers ────────────────────────────────────────────────────────────────
function valueOf(field) {
  if (!field) return "";
  return typeof field === "string" ? field : (field.value || "");
}

function postForm(body) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SPARK_HOST,
        path:     SPARK_PATH,
        method:   "POST",
        headers:  {
          "Content-Type":   "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => { res.resume(); resolve(res.statusCode); }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
