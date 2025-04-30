import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    try {
      const response = await fetch("http://localhost:4000/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.error || "Failed to plan content" },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({ content: data.plan });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        {
          error:
            "Connection to Ollama failed. Please ensure Ollama is running and try again.",
        },
        { status: 504 }
      );
    }
  } catch (error) {
    console.error("Error planning content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
