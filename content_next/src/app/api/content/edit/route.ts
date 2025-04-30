import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { draft } = await request.json();

    if (!draft) {
      return NextResponse.json(
        { error: "Draft content is required" },
        { status: 400 }
      );
    }

    try {
      const response = await fetch("http://localhost:4000/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draft }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.error || "Failed to edit content" },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({ content: data.content });
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
    console.error("Error editing content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
