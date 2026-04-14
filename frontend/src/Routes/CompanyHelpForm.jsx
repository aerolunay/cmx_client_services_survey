import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import cmxLogoWhite from "../images/callmax_cover_removebg.png";
import cmxLogo from "../images/cmxlogo-removebg-preview.png";
import { SERVER_URL } from "../lib/constants";
import SurveyStepper from "./components/SurveyStepper";
// import packageJson from "../../package.json";


const REDIRECT_URL = "https://www.callmaxsolutions.com";
const REDIRECT_SECONDS = 10;
const APP_VERSION = "0.1.0"; // replace with packageJson.version if your setup supports it

const INITIAL_FORM = {
  name: "",
  company: "",
  email: "",
  tasks: "",
  satisfaction: "",
  recommend: "",
  communication: "",
  collaboration: "",
  consistency: "",
  overall_comments: "",
};

export default function CompanyHelpForm() {
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  const prefillValues = useMemo(
    () => ({
      email: searchParams.get("email") || "",
      company: searchParams.get("client") || "",
    }),
    [searchParams],
  );

  useEffect(() => {
    if (!prefillValues.email && !prefillValues.company) return;

    setForm((prev) => ({
      ...prev,
      email: prefillValues.email || prev.email,
      company: prefillValues.company || prev.company,
    }));
  }, [prefillValues]);

  useEffect(() => {
    if (!submitted) return;

    setSecondsLeft(REDIRECT_SECONDS);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = REDIRECT_URL;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted]);

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    setSubmitError("");

    try {
      const response = await fetch(`${SERVER_URL}/submit-survey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(
          payload?.message || "Unable to submit your survey at this time.",
        );
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Survey submission failed:", error);
      setSubmitError(
        error?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoNow = () => {
    window.location.href = REDIRECT_URL;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52b9f4] via-[#014968] to-[#02111f] flex flex-col">
      {!submitted ? (
        <>
          <main className="flex-1 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-5xl flex flex-col items-center">
              {/* HERO */}
              <div className="w-full text-center text-white">
                <img
                  src={cmxLogoWhite}
                  alt="Callmax"
                  className="mx-auto w-[180px] sm:w-[220px] mb-6"
                />

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
                  Voice of the Customer
                </h1>

                <p className="mt-4 text-white/80 max-w-2xl mx-auto text-sm sm:text-base">
                  Help us improve our services by sharing your experience.
                </p>
              </div>

              {/* STEPPER */}
              <div className="w-full max-w-4xl mt-10">
                {submitError ? (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                  </div>
                ) : null}

                <SurveyStepper
                  form={form}
                  setForm={setForm}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              </div>
            </div>
          </main>

          <footer className="w-full text-center text-white/60 text-[9px] leading-tight px-4 pb-6 pt-2">
            <p>CMX VOC Survey Form v{APP_VERSION}</p>
            <p>Developed for exclusive use of Callmax Solutions Int&apos;l Inc.</p>
            <p>CMX DREAM-DEVOPS || © 2026</p>
          </footer>
        </>
      ) : (
        <>
          <main className="flex-1 flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 text-center">
              <img
                src={cmxLogo}
                alt="Callmax"
                className="mx-auto w-[160px] sm:w-[200px] mb-8"
              />

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-3xl text-emerald-600">✓</span>
              </div>

              <h1 className="text-xl font-semibold text-gray-800">
                We truly appreciate your feedback. Your insights help us continuously improve and deliver a better experience.
              </h1>

              <p className="mt-4 text-base sm:text-lg text-gray-600">
                Your survey has been submitted successfully.
              </p>

              <p className="mt-2 text-sm sm:text-base text-gray-500">
                You may now close this page.
              </p>

              <div className="mt-4">
                <p className="text-sm text-gray-500">Redirecting you in</p>
                <p className="mt-1 text-3xl font-semibold text-[#003b5c]">
                  {secondsLeft}
                </p>
                <p className="mt-1 text-sm text-gray-500">seconds</p>
              </div>

              <div className="mt-8 flex justify-center">
                <a
                  href="https://www.callmaxsolutions.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 underline font-medium transition transform hover:-translate-y-0.5 hover:text-blue-800"
                >
                  www.callmaxsolutions.com
                </a>
              </div>
            </div>
          </main>

          <footer className="w-full text-center text-white/60 text-[9px] leading-tight px-4 pb-6 pt-2">
            <p>CMX VOC Survey Form v{APP_VERSION}</p>
            <p>Developed for exclusive use of Callmax Solutions Int&apos;l Inc.</p>
            <p>CMX DREAM-DEVOPS || © 2026</p>
          </footer>
        </> 
      )}
    </div>
  );
}