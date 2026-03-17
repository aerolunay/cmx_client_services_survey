import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import logo from "../images/cmxlogo-removebg-preview.png";
import cmxLogoWhite from "../images/callmax_cover_removebg.png";
import cmsSurvey from "../images/cms-survey.png";
import bgHeader from "../images/bg-header.png";
import { SERVER_URL } from "../lib/constants";

export default function CompanyHelpForm() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    tasks: "",
    satisfaction: "",
    recommend: "",
    communication: "",
    collaboration: "",
    consistency: "",
    files: [],
    sendCopy: false,
  });

  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  useEffect(() => {
    const email = searchParams.get("email");
    const company = searchParams.get("client");

    if (email) {
      setForm((prev) => ({
        ...prev,
        email: email,
        company: company || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    setForm((prev) => ({
      ...prev,
      files: [...prev.files, ...selectedFiles],
    }));
  };

  const handleCopyChange = (e) => {
    setForm((prev) => ({
      ...prev,
      sendCopy: e.target.checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate required fields
    if (
      !form.name ||
      !form.company ||
      !form.email ||
      !form.satisfaction ||
      !form.recommend ||
      !form.communication ||
      !form.collaboration ||
      !form.consistency
    ) {
      alert(
        "Please complete all required fields before submitting the survey.",
      );
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();

      // append text fields
      formData.append("name", form.name);
      formData.append("company", form.company);
      formData.append("email", form.email);
      formData.append("tasks", form.tasks);
      formData.append("satisfaction", form.satisfaction);
      formData.append("recommend", form.recommend);
      formData.append("communication", form.communication);
      formData.append("collaboration", form.collaboration);
      formData.append("consistency", form.consistency);
      formData.append("sendCopy", form.sendCopy);

      // append files
      form.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`${SERVER_URL}/submit-survey`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setSubmitMessage(
          data.message ||
            "Survey submitted successfully. Thank you for your feedback.",
        );
        setForm({
          name: "",
          company: "",
          email: "",
          tasks: "",
          satisfaction: "",
          recommend: "",
          communication: "",
          collaboration: "",
          consistency: "",
          files: [],
          sendCopy: false,
        });
      } else {
        setSubmitStatus("error");
        setSubmitMessage(data.message || "Failed to submit survey.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
      setSubmitMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleResultAction = () => {
    setSubmitStatus("idle");
  };

  const Rating = ({ name }) => (
    <div className="flex gap-6 mt-2 mb-4">
      {[5, 4, 3, 2, 1].map((num) => (
        <label key={num} className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={num}
            required
            checked={form[name] === num}
            onChange={handleRadioChange}
            className="accent-blue-700 cursor-pointer"
          />
          {num}
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-r from-slate-100 to-blue-100">
      {/* LEFT SIDE */}
      <div className="flex items-center justify-center lg:justify-start px-6 lg:px-20 bg-[#003b5c] text-white">
        <div className="w-full max-w-xl py-10 lg:h-screen flex flex-col justify-start text-left">
          {/* LOGO */}
          <img
            src={cmxLogoWhite}
            alt="cmxLogoWhite"
            className="h-14 w-auto object-contain mb-4  mx-auto lg:mx-0 lg:-ml-7 max-w-[280px]"
          />

          {/* TITLE */}
          <h1 className="text-5xl font-light leading-tight tracking-tight">
            Voice of the <br />
            Customer Survey
          </h1>

          {/* DESCRIPTION */}
          <p className="text-white/80 mt-6 text-lg">
            Help us improve our services by sharing your experience with
            Callmax.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex justify-center items-center p-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-400 shadow-lg w-full max-w-xl lg:max-w-3xl xl:max-w-4xl overflow-hidden"
        >
          {/* HEADER */}
          <div className="bg-[#003b5c] text-white text-3xl p-6 rounded-t-2xl">
            VOICE OF THE CUSTOMER SURVEY
          </div>

          <div className="p-8 space-y-6">
            {/* NAME */}
            <div>
              <label className="font-semibold text-gray-700">
                Your name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            {/* COMPANY */}
            <div>
              <label className="font-semibold text-gray-700">
                Your company <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                name="company"
                value={form.company}
                onChange={handleChange}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="font-semibold text-gray-700">
                Your email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            {/* TASKS */}
            <div>
              <label className="font-semibold text-gray-700">
                What task(s) do we help your company with?
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1"
                name="tasks"
                value={form.tasks}
                onChange={handleChange}
              />
            </div>

            {/* OVERALL SATISFACTION */}
            <h2 className="text-2xl font-semibold text-gray-900 pt-6 border-t">
              OVERALL SATISFACTION
            </h2>

            <p className="text-sm text-gray-600">
              5 is the highest, 1 is the lowest
            </p>

            <div>
              <label className="font-semibold text-gray-800 block">
                Overall, how satisfied are you with the services provided by
                Callmax?
                <span className="text-red-500"> *</span>
              </label>

              <div className="mt-2">
                <Rating name="satisfaction" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-800 block">
                How likely are you to recommend Callmax services to friends and
                colleagues?
                <span className="text-red-500"> *</span>
              </label>

              <div className="mt-2">
                <Rating name="recommend" />
              </div>
            </div>

            {/* KEY PARTNERSHIP ATTRIBUTES */}
            <h2 className="text-2xl font-semibold text-gray-900 pt-8">
              KEY PARTNERSHIP ATTRIBUTES
            </h2>

            <p className="text-sm text-gray-600">
              5 is the highest, 1 is the lowest
            </p>

            {/* COMMUNICATION */}
            <div className="mt-4">
              <label className="font-semibold text-gray-800 block">
                COMMUNICATION <span className="text-red-500">*</span>
              </label>

              <p className="text-sm text-gray-500 mt-1">
                Please rate your level of satisfaction with the{" "}
                <b>Communication</b> between Callmax and you or your team(s) to
                ensure clarity, awareness and alignment.
              </p>

              <div className="mt-2">
                <Rating name="communication" />
              </div>
            </div>

            {/* COLLABORATION */}
            <div className="mt-4">
              <label className="font-semibold text-gray-800 block">
                COLLABORATION <span className="text-red-500">*</span>
              </label>

              <p className="text-sm text-gray-500 mt-1">
                Please rate your level of satisfaction with the{" "}
                <b>Collaboration</b> between CallMax and you or your team(s) to
                meet or exceed your expectations.
              </p>

              <div className="mt-2">
                <Rating name="collaboration" />
              </div>
            </div>

            {/* CONSISTENCY */}
            <div className="mt-4">
              <label className="font-semibold text-gray-800 block">
                CONSISTENCY <span className="text-red-500">*</span>
              </label>

              <p className="text-sm text-gray-500 mt-1">
                Please rate your level of satisfaction with the{" "}
                <b>Consistency</b> of the results CallMax is delivering for your
                company.
              </p>

              <div className="mt-2">
                <Rating name="consistency" />
              </div>
            </div>

            {/* SUPPORTING DOCUMENTS */}
            <h2 className="text-xl font-semibold text-gray-800 pt-6 border-t">
              SUPPORTING DOCUMENTS
            </h2>

            <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-8 text-center bg-white">
              <div className="text-4xl mb-3">📄</div>

              <p className="text-gray-500">Upload supporting documents</p>

              {/* centered input */}
              <div className="flex justify-center mt-4">
                <input
                  type="file"
                  multiple
                  name="files"
                  onChange={handleFileChange}
                  className="text-center"
                />
              </div>

              {form.files.length > 0 && (
                <div className="mt-4 text-sm text-gray-700 text-center">
                  {form.files.map((file, index) => (
                    <p key={index}>📎 {file.name}</p>
                  ))}
                </div>
              )}
            </div>

            <hr className="my-6 border-gray-200" />

            {/* SEND COPY */}
            <label className="flex gap-2 text-gray-600 text-sm">
              <input
                type="checkbox"
                checked={form.sendCopy}
                onChange={handleCopyChange}
              />
              Send me a copy of my responses
            </label>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#003b5c] to-[#005a8c] hover:from-[#002c44] hover:to-[#004e78] shadow-md hover:shadow-lg"
                }
              `}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
      {/* Result Modal */}
      {submitStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  submitStatus === "success" ? "bg-emerald-100" : "bg-red-100"
                }`}
              >
                {submitStatus === "success" ? (
                  <span className="text-lg text-emerald-700 animate-bounce">
                    ✔
                  </span>
                ) : (
                  <span className="text-lg text-red-700 animate-[shake_0.3s_ease-in-out_2]">
                    !
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {submitStatus === "success"
                    ? "Survey Submitted"
                    : "Submission Failed"}
                </h3>

                <p className="text-[11px] text-gray-600 mt-0.5">
                  {submitMessage}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleResultAction}
                className={`h-8 px-4 rounded-lg text-[11px] font-medium ${
                  submitStatus === "success"
                    ? "bg-[#003b5c] text-white hover:bg-[#002a40]"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {submitStatus === "success" ? "Close" : "Back"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
