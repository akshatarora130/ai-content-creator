"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContentForm() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [stepTimes, setStepTimes] = useState<{
    planning?: number;
    writing?: number;
    editing?: number;
  }>({});
  const [content, setContent] = useState<{
    plan: string;
    draft: string;
    final: string;
  }>({
    plan: "",
    draft: "",
    final: "",
  });
  const [activeTab, setActiveTab] = useState("final");
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    type: "success" | "error" | null;
  } | null>(null);
  const [ollama, setOllama] = useState<{
    status: string;
    model: string;
    error?: string;
  }>({
    status: "checking",
    model: "",
  });

  // Check Ollama status on load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/content/status");
        if (response.ok) {
          const data = await response.json();
          setOllama({
            status: data.ollama_status,
            model: data.current_model,
          });
        } else {
          setOllama({
            status: "error",
            model: "",
            error: "Failed to connect to backend",
          });
        }
      } catch (error) {
        setOllama({
          status: "error",
          model: "",
          error: "Failed to connect to backend",
        });
      }
    };

    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      setToastMessage({
        title: "Error",
        description: "Please enter a content topic",
        type: "error",
      });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsLoading(true);
    setStepTimes({});
    setToastMessage({
      title: "Processing",
      description: "Generating ultra-concise content with mistral:latest...",
      type: "success",
    });

    try {
      // Step 1: Plan content
      setActiveStep("planning");
      const planStartTime = Date.now();

      const planResponse = await fetch("/api/content/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!planResponse.ok) {
        const errorData = await planResponse.json();
        throw new Error(errorData.error || "Failed to plan content");
      }

      const planData = await planResponse.json();
      setContent((prev) => ({ ...prev, plan: planData.content }));
      setStepTimes((prev) => ({
        ...prev,
        planning: (Date.now() - planStartTime) / 1000,
      }));

      // Step 2: Write content
      setActiveStep("writing");
      const writeStartTime = Date.now();

      const writeResponse = await fetch("/api/content/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, plan: planData.content }),
      });

      if (!writeResponse.ok) {
        const errorData = await writeResponse.json();
        throw new Error(errorData.error || "Failed to write content");
      }

      const writeData = await writeResponse.json();
      setContent((prev) => ({ ...prev, draft: writeData.content }));
      setStepTimes((prev) => ({
        ...prev,
        writing: (Date.now() - writeStartTime) / 1000,
      }));

      // Step 3: Edit content
      setActiveStep("editing");
      const editStartTime = Date.now();

      const editResponse = await fetch("/api/content/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: writeData.content }),
      });

      if (!editResponse.ok) {
        const errorData = await editResponse.json();
        throw new Error(errorData.error || "Failed to edit content");
      }

      const editData = await editResponse.json();
      setContent((prev) => ({ ...prev, final: editData.content }));
      setStepTimes((prev) => ({
        ...prev,
        editing: (Date.now() - editStartTime) / 1000,
      }));

      setActiveStep("completed");
      setToastMessage({
        title: "Success",
        description: "Ultra-concise content created successfully!",
        type: "success",
      });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error:", error);
      setToastMessage({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate content",
        type: "error",
      });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepStatus = (step: string) => {
    if (activeStep === step) {
      return (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 animate-spin ml-2" />
          {stepTimes[step as keyof typeof stepTimes] ? (
            <span className="text-xs ml-2">
              {stepTimes[step as keyof typeof stepTimes]?.toFixed(1)}s
            </span>
          ) : null}
        </div>
      );
    } else if (
      (step === "planning" && content.plan) ||
      (step === "writing" && content.draft) ||
      (step === "editing" && content.final) ||
      activeStep === "completed"
    ) {
      return (
        <div className="flex items-center">
          <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />
          {stepTimes[step as keyof typeof stepTimes] ? (
            <span className="text-xs ml-2">
              {stepTimes[step as keyof typeof stepTimes]?.toFixed(1)}s
            </span>
          ) : null}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Ollama Status */}
      <div
        className={`p-3 rounded-md text-sm ${
          ollama.status === "running"
            ? "bg-gray-100 text-black border border-gray-300"
            : "bg-gray-100 text-black border border-gray-300"
        }`}
      >
        <div className="flex items-center">
          {ollama.status === "running" ? (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 mr-2" />
          )}
          <span>
            {ollama.status === "running"
              ? `Ollama is running with model: ${ollama.model}`
              : "Ollama is not running or not available"}
          </span>
        </div>
        {ollama.error && <div className="mt-1">{ollama.error}</div>}
        <div className="mt-1 text-xs">
          Check the terminal for detailed Ollama output during content
          generation.
        </div>
      </div>

      {/* Toast Message */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-md shadow-lg max-w-xs z-50 ${
            toastMessage.type === "success"
              ? "bg-gray-800 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          <div className="font-medium">{toastMessage.title}</div>
          <div className="text-sm">{toastMessage.description}</div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="topic" className="text-sm font-medium text-black">
                Content Topic
              </label>
              <input
                id="topic"
                placeholder="Enter a topic for your content..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-black"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || ollama.status !== "running"}
              className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                isLoading || ollama.status !== "running"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              }`}
            >
              {isLoading
                ? "Generating Content..."
                : "Generate Ultra-Concise Content"}
            </button>
          </form>
        </div>
      </div>

      {/* Content Display */}
      {(content.plan || content.draft || content.final) && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="p-6">
            {/* Progress Steps */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-black">Planning</span>
                {renderStepStatus("planning")}
              </div>
              <span className="text-black">→</span>
              <div className="flex items-center">
                <span className="text-sm font-medium text-black">Writing</span>
                {renderStepStatus("writing")}
              </div>
              <span className="text-black">→</span>
              <div className="flex items-center">
                <span className="text-sm font-medium text-black">Editing</span>
                {renderStepStatus("editing")}
              </div>
            </div>

            {/* Tabs */}
            <div className="w-full">
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setActiveTab("plan")}
                  className={`py-2 px-4 text-center ${
                    activeTab === "plan"
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Content Plan
                </button>
                <button
                  onClick={() => setActiveTab("draft")}
                  className={`py-2 px-4 text-center ${
                    activeTab === "draft"
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Draft
                </button>
                <button
                  onClick={() => setActiveTab("final")}
                  className={`py-2 px-4 text-center ${
                    activeTab === "final"
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Final Content
                </button>
              </div>

              {/* Tab Content */}
              <div className={activeTab === "plan" ? "block" : "hidden"}>
                <textarea
                  readOnly
                  value={content.plan}
                  className="w-full min-h-[300px] px-3 py-2 border border-gray-300 rounded-md font-mono text-sm bg-white text-black"
                  placeholder="The content plan will appear here..."
                />
              </div>
              <div className={activeTab === "draft" ? "block" : "hidden"}>
                <textarea
                  readOnly
                  value={content.draft}
                  className="w-full min-h-[300px] px-3 py-2 border border-gray-300 rounded-md font-mono text-sm bg-white text-black"
                  placeholder="The content draft will appear here..."
                />
              </div>
              <div className={activeTab === "final" ? "block" : "hidden"}>
                <div className="min-h-[300px] border border-gray-300 rounded-md p-4 overflow-auto bg-white">
                  {content.final ? (
                    <div
                      className="whitespace-pre-line text-black"
                      dangerouslySetInnerHTML={{
                        __html: content.final.replace(/\n/g, "<br/>"),
                      }}
                    />
                  ) : (
                    <p className="text-gray-400">
                      The final content will appear here...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
