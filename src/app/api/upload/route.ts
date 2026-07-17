import { auth } from "@/lib/auth";
import uploadFile from "@/s3/upload";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }
    const formData = await req.formData();
    const file = formData.get("file");
    const alias = formData.get("alias")?.toString().trim() || "";

    console.log("Uploaded File : ", file);
    console.log("Uploaded Alias : ", alias);
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" });
    }
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file uploaded" },
        { status: 400 },
      );
    }

    const url = await uploadFile(file);
    
    return NextResponse.json({
      success: true,
      url,
      alias,
    });
  } catch (error) {
    console.error("Error while uploading file.", error);
    return NextResponse.json(
      {
        success: false,
        message: error,
      },
      { status: 504 },
    );
  }
}
