import React, { useState, useEffect } from "react";

export default function SurveyStepper({ form, setForm, onSubmit, loading }) {
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const steps = [
    {
      type: "group",
      title: "Tell us about you",
      fields: [
        { key: "name", label: "Name", placeholder: "Your name" },
        { key: "company", label: "Company", placeholder: "Your company" },
        { key: "email", label: "Email", placeholder: "Your email" },
        {
          key: "tasks",
          label: "Task",
          placeholder: "What task(s) do we help your company with?"
        }
      ]
    },
    {
      key: "satisfaction",
      label: "How satisfied are you with our service?",
      type: "rating5"
    },
    {
      key: "recommend",
      label: "How likely are you to recommend us?",
      subLabel: "0 = Not likely, 10 = Very likely",
      type: "rating10"
    },
    {
      key: "communication",
      label: "Rate our communication",
      type: "rating5"
    },
    {
      key: "collaboration",
      label: "Rate our collaboration",
      type: "rating5"
    },
    {
      key: "consistency",
      label: "Rate our consistency",
      type: "rating5"
    },
    {
      key: "overall_comments",
      label: "Any additional feedback you'd like to share?",
      type: "textarea"
    }
  ];

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isStepValid = () => {
    if (current.type === "group") {
      return current.fields.every((f) => form[f.key]);
    } else if (current.type === "textarea") {
      return true;
    } else {
      return !!form[current.key];
    }
  };

  const next = () => {
    if (!isStepValid()) return;
    if (step < steps.length - 1) setStep((prev) => prev + 1);
  };

  const back = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-xl px-4">

        {/* PROGRESS */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#003b5c] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">
            {step + 1} / {steps.length}
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">

          {/* TITLE */}
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              {current.title || current.label}
            </h2>

            {current.subLabel && (
              <p className="text-sm text-gray-500 mt-2">
                {current.subLabel}
              </p>
            )}
          </div>

          <div className="mt-8">

            {/* GROUP */}
            {current.type === "group" && (
              <div className="space-y-5">

                {current.fields.map((f) => (
                  <div key={f.key} className="text-left">

                    {/* LABEL */}
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      {f.label}
                    </label>

                    {/* INPUT */}
                    <input
                      value={form[f.key] || ""}
                      onChange={(e) => setValue(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="
                        w-full px-4 py-3 rounded-xl border border-gray-300
                        bg-white text-gray-900
                        placeholder-gray-600
                        focus:outline-none focus:ring-2 focus:ring-[#003b5c]
                      "
                    />
                  </div>
                ))}

              </div>
            )}

            {/* 1–5 RATING */}
            {current.type === "rating5" && (
              <div className="flex justify-center gap-3 mt-4 flex-wrap">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setValue(current.key, n);
                      if (isMobile) setTimeout(next, 250);
                    }}
                    className={`
                      w-12 h-12 rounded-full font-semibold
                      ${form[current.key] === n
                        ? "bg-[#003b5c] text-white"
                        : "bg-gray-100 hover:bg-gray-200"}
                    `}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}

            {/* NPS */}
            {current.type === "rating10" && (
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {[...Array(11).keys()].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setValue(current.key, n);
                      if (isMobile) setTimeout(next, 250);
                    }}
                    className={`
                      w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11
                      rounded-full text-xs sm:text-sm
                      flex items-center justify-center
                      ${
                        form[current.key] === n
                          ? "bg-[#003b5c] text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }
                    `}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}

            {/* TEXTAREA */}
            {current.type === "textarea" && (
              <textarea
                placeholder="Type your feedback here..."
                value={form.overall_comments || ""}
                onChange={(e) => setValue("overall_comments", e.target.value)}
                className="
                  w-full h-32 px-4 py-3 border rounded-xl
                  placeholder-gray-600
                  focus:ring-2 focus:ring-[#003b5c]
                "
              />
            )}

          </div>

          {/* ACTIONS */}
          <div className="mt-10 flex justify-between">

            <button
              onClick={back}
              disabled={step === 0}
              className={`
                px-6 py-2 rounded-xl
                ${step === 0
                  ? "bg-gray-200 text-gray-400"
                  : "bg-gray-400 text-white hover:bg-gray-500"}
              `}
            >
              Back
            </button>

            {step === steps.length - 1 ? (
              <button
                onClick={onSubmit}
                disabled={loading}
                className="px-6 py-2 bg-[#003b5c] text-white rounded-xl"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            ) : (
              <button
                onClick={next}
                disabled={!isStepValid()}
                className={`
                  px-6 py-2 rounded-xl
                  ${isStepValid()
                    ? "bg-[#003b5c] text-white"
                    : "bg-gray-300 text-gray-500"}
                `}
              >
                Next
              </button>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}