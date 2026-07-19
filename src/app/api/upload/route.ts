import { db } from "@/db";
import { fileUpload } from "@/db/schema";
import { auth } from "@/lib/auth";
import uploadFile from "@/s3/upload";
import { desc, eq } from "drizzle-orm";
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
    const result = await db
      .insert(fileUpload)
      .values({
        userId: session.user.id,
        fileName: alias || file.name,
        fileType: file.type,
        filePath: url,
        integrationName: alias || null,
      })
      .returning();

    console.log("Uploaded", result);
    return NextResponse.json({
      success: true,
      url,
      alias,
      file: result[0] || null,
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

export async function GET() {
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

    const files = await db
      .select({
        id: fileUpload.id,
        fileName: fileUpload.fileName,
        fileType: fileUpload.fileType,
        filePath: fileUpload.filePath,
        alias: fileUpload.integrationName,
        createdAt: fileUpload.createdAt,
      })
      .from(fileUpload)
      .where(eq(fileUpload.userId, session.user.id))
      .orderBy(desc(fileUpload.createdAt));

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("Error while fetching uploaded files.", error);
    return NextResponse.json(
      {
        success: false,
        message: error,
      },
      { status: 500 },
    );
  }
}
