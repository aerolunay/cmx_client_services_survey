import React from "react";

export default function SurveyForm({ form, setForm, onSubmit, loading }) {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setForm((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
    }));
  };

  const handleCopyChange = (e) => {
    setForm((prev) => ({
      ...prev,
      sendCopy: e.target.checked,
    }));
  };

  // ⭐ MODERN BUTTON RATING
  const Rating = ({ name }) => (
    <div className="flex gap-2 flex-wrap mt-3">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          type="button"
          key={num}
          onClick={() =>
            setForm((prev) => ({ ...prev, [name]: num }))
          }
          className={`
            px-4 py-2 rounded-xl border text-sm font-medium transition
            ${
              form[name] === num
                ? "bg-[#003b5c] text-white border-[#003b5c]"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
            }
          `}
        >
          {num}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex justify-center px-4 sm:px-6 md:px-10 pb-16">
      <form
        onSubmit={onSubmit}
        className="
          w-full max-w-4xl
          bg-white
          rounded-3xl
          shadow-2xl
          border border-gray-200
          overflow-hidden
        "
      >

        {/* HEADER */}
        <div className="px-6 sm:px-10 py-6 border-b bg-white">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Customer Experience Survey
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Takes less than 2 minutes to complete
          </p>
        </div>

        {/* BODY */}
        <div className="p-6 sm:p-10 space-y-8">

          {/* INPUT STYLE */}
          {[
            { label: "Your name", name: "name", required: true },
            { label: "Your company", name: "company", required: true },
            { label: "Your email", name: "email", type: "email", required: true },
          ].map((field) => (
            <div key={field.name}>
              <label className="font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type || "text"}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                className="
                  w-full mt-2 px-4 py-3 rounded-xl border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-[#003b5c]
                  transition
                "
              />
            </div>
          ))}

          {/* TASKS */}
          <div>
            <label className="font-medium text-gray-700">
              What task(s) do we help your company with?
            </label>
            <input
              name="tasks"
              value={form.tasks}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300"
            />
          </div>

          {/* SATISFACTION */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Overall Satisfaction
            </h3>

            <div className="mt-4">
              <label className="font-medium text-gray-700">
                Overall satisfaction *
              </label>
              <Rating name="satisfaction" />
            </div>

            <div className="mt-4">
              <label className="font-medium text-gray-700">
                Likelihood to recommend *
              </label>
              <Rating name="recommend" />
            </div>
          </div>

          {/* ATTRIBUTES */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Key Partnership Attributes
            </h3>

            {[
              { label: "Communication", name: "communication" },
              { label: "Collaboration", name: "collaboration" },
              { label: "Consistency", name: "consistency" },
            ].map((item) => (
              <div key={item.name} className="mt-4">
                <label className="font-medium text-gray-700">
                  {item.label} *
                </label>
                <Rating name={item.name} />
              </div>
            ))}
          </div>

          {/* FILE UPLOAD */}
          <div className="border border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition">
            <p className="text-gray-500 text-sm">
              Upload supporting documents (optional)
            </p>

            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="mt-3 text-sm"
            />

            {form.files.length > 0 && (
              <div className="mt-3 text-xs text-gray-600">
                {form.files.map((file, i) => (
                  <div key={i}>📎 {file.name}</div>
                ))}
              </div>
            )}
          </div>

          {/* SEND COPY */}
          <label className="flex items-center gap-2 text-sm text-gray-600">
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
            className="
              w-full py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-[#003b5c] to-[#005a8c]
              hover:from-[#002c44] hover:to-[#004e78]
              transition shadow-md
            "
          >
            {loading ? "Submitting..." : "Submit Survey"}
          </button>

        </div>
      </form>
    </div>
  );
}