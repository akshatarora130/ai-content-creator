import { NextResponse } from "next/server";

export async function GET() {
  try {
    try {
      const response = await fetch("http://localhost:4000/status");

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.error || "Failed to get status" },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        {
          error:
            "Connection to backend failed. Please ensure the Python backend is running.",
        },
        { status: 504 }
      );
    }
  } catch (error) {
    console.error("Error getting status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
