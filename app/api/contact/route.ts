import { NextResponse } from "next/server";
import { EMAIL } from "../../site";

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  action?: string;
  hostname?: string;
};

export async function POST(request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Captcha is not configured." },
      { status: 500 },
    );
  }

  let body: {
    name?: string;
    email?: string;
    phone?: string;
    project?: string;
    services?: string[];
    budget?: string | null;
    turnstileToken?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const project = body.project?.trim() ?? "";
  const token = body.turnstileToken?.trim() ?? "";

  if (
    !name ||
    !email ||
    !project ||
    name.length > 200 ||
    email.length > 320 ||
    project.length > 5000 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Please complete the captcha." },
      { status: 400 },
    );
  }

  const verifyBody = new URLSearchParams({
    secret,
    response: token,
  });

  const forwarded = request.headers.get("cf-connecting-ip");
  const realIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const remoteip = forwarded || realIp;
  if (remoteip) verifyBody.set("remoteip", remoteip);

  let verifyJson: TurnstileVerifyResponse;
  try {
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: verifyBody,
        headers: { "content-type": "application/x-www-form-urlencoded" },
      },
    );
    verifyJson = (await verifyRes.json()) as TurnstileVerifyResponse;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Captcha verification failed. Please try again." },
      { status: 502 },
    );
  }

  // Real keys echo the widget's action; Cloudflare's test keys return none.
  if (!verifyJson.success || (verifyJson.action && verifyJson.action !== "contact")) {
    return NextResponse.json(
      { ok: false, error: "Captcha verification failed. Please try again." },
      { status: 400 },
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      { ok: false, error: "Email is not configured." },
      { status: 500 },
    );
  }

  const phone = body.phone?.trim().slice(0, 50) || "Not given";
  const services = Array.isArray(body.services)
    ? body.services.filter((s) => typeof s === "string").slice(0, 20).join(", ")
    : "";
  const budget = typeof body.budget === "string" ? body.budget.slice(0, 50) : "";

  // Plain text only, so visitor input is never rendered as HTML.
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Services: ${services || "None selected"}`,
    `Budget: ${budget || "Not selected"}`,
    "",
    "Project:",
    project,
  ].join("\n");

  try {
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${resendKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.CONTACT_FROM_EMAIL ??
          "Piermont Website <website@piermontstudios.com>",
        to: [EMAIL],
        reply_to: email,
        subject: `New project enquiry from ${name.replace(/[\r\n]+/g, " ")}`,
        text,
      }),
    });
    if (!sendRes.ok) throw new Error(`Resend ${sendRes.status}`);
  } catch (error) {
    console.error("Contact email failed", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't send your message. Please email us directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
