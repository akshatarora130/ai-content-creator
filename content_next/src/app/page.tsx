import ContentForm from "./components/content-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-black">
          AI Content Creator
        </h1>
        <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
          Enter a topic and our AI will quickly generate ultra-concise content
          using Ollama Mistral.
        </p>

        <div className="max-w-3xl mx-auto">
          <ContentForm />
        </div>
      </main>
    </div>
  );
}
