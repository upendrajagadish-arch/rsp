"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Circle, Instagram, Linkedin, Twitter } from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4";

const SERVICES = [
  "Website",
  "Mobile App",
  "Web App",
  "E-Commerce",
  "Visual Identity",
  "3D & Motion",
  "Digital Marketing",
  "Growth & Consulting",
  "Other",
] as const;

const NAV_LINKS = ["Our story", "Expertise", "Our work", "Journal"] as const;

const inputClass =
  "flex-1 min-w-0 text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-transparent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition";

function SocialBtn({
  className,
  children,
  label,
}: {
  className: string;
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-xl transition-opacity hover:opacity-80 ${className}`}
    >
      {children}
    </button>
  );
}

function LogoMark() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 256 256"
      fill="black"
      aria-hidden
    >
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
    </svg>
  );
}

export function FormaContactLanding() {
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function toggleService(service: string) {
    setSelected((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  }

  return (
    <div className="forma-landing min-h-screen bg-white p-3 sm:p-4 md:p-6">
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] lg:h-[calc(100vh-48px)]"
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="relative z-10 flex min-h-[calc(100vh-24px)] flex-col gap-6 p-4 sm:min-h-[calc(100vh-32px)] sm:p-6 md:min-h-[calc(100vh-48px)] md:p-8 lg:h-full">
          <nav className="flex w-full items-center gap-3 rounded-2xl bg-white/60 py-2 pr-2 pl-3 shadow-sm backdrop-blur-md sm:w-auto sm:gap-6 sm:pl-4">
            <LogoMark />
            <div className="hidden items-center gap-5 sm:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="whitespace-nowrap text-sm font-medium text-gray-800 transition-opacity hover:opacity-60"
                >
                  {link}
                </a>
              ))}
            </div>
            <button
              type="button"
              className="ml-auto rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 sm:ml-0 sm:px-5"
            >
              Start a project
            </button>
          </nav>

          <div className="min-h-[2rem] flex-1" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <p className="shrink-0 text-3xl font-medium leading-tight text-white drop-shadow-lg sm:text-4xl lg:max-w-lg xl:max-w-2xl xl:text-5xl">
              We craft bold ideas
              <br />
              and ship them as{" "}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                products
              </span>
            </p>

            <div className="w-full shrink-0 lg:w-[min(480px,45%)]">
              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
                <div className="flex flex-col gap-4 p-4 sm:p-6">
                  <h2 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
                    Say hello! 👋
                  </h2>

                  <div className="flex flex-row items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Drop us a line</p>
                      <a
                        href="mailto:hello@forma.co"
                        className="truncate font-semibold text-blue-600 hover:underline"
                      >
                        hello@forma.co
                      </a>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <SocialBtn
                        label="Twitter"
                        className="bg-gray-100 text-gray-800"
                      >
                        <Twitter size={13} />
                      </SocialBtn>
                      <SocialBtn
                        label="Circle"
                        className="bg-pink-100 text-pink-500"
                      >
                        <Circle size={13} />
                      </SocialBtn>
                      <SocialBtn
                        label="Instagram"
                        className="bg-orange-100 text-orange-400"
                      >
                        <Instagram size={13} />
                      </SocialBtn>
                      <SocialBtn
                        label="LinkedIn"
                        className="bg-blue-100 text-blue-600"
                      >
                        <Linkedin size={13} />
                      </SocialBtn>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-sm font-medium text-gray-400">OR</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  {sent ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl text-green-600">
                        ✓
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        You&apos;re all set!
                      </h3>
                      <p className="text-sm text-gray-500">
                        Expect a reply within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                      <label className="text-sm font-medium text-black">
                        Tell us about your vision
                      </label>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          required
                          placeholder="Full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={inputClass}
                        />
                        <input
                          type="email"
                          required
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <textarea
                        required
                        rows={4}
                        placeholder="What are you looking to build or improve..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`${inputClass} resize-none`}
                      />

                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-black">
                          I need help with...
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {SERVICES.map((service) => {
                            const active = selected.includes(service);
                            return (
                              <button
                                key={service}
                                type="button"
                                onClick={() => toggleService(service)}
                                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                                  active
                                    ? "border-black bg-gray-100 text-black"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                                }`}
                              >
                                {service}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
                      >
                        {sending ? "Sending..." : "Send my message"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
