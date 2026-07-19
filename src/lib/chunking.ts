import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

type ChunkDocumentOptions = {
  chunkSize?: number;
  chunkOverlap?: number;
  sourceName?: string;
};

type ChunkDocumentInput =
  | ({ text: string } & ChunkDocumentOptions)
  | ({ file: File } & ChunkDocumentOptions)
  | ({ sourceUrl: string } & ChunkDocumentOptions);

export type DocumentChunk = {
  content: string;
  metadata: {
    source: string;
    index: number;
    chunkSize: number;
  };
};

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

async function extractTextFromFile(file: File) {
  try {
    return await file.text();
  } catch {
    const buffer = Buffer.from(await file.arrayBuffer());
    return buffer.toString("utf-8");
  }
}

async function downloadTextFromUrl(sourceUrl: string) {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch document from ${sourceUrl}: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const buffer = Buffer.from(await response.arrayBuffer());

  if (contentType.includes("text/") || contentType.includes("application/json")) {
    return buffer.toString("utf-8");
  }

  return buffer.toString("utf-8");
}

export async function chunkDocument(input: ChunkDocumentInput): Promise<DocumentChunk[]> {
  let text = "";
  let sourceName = "document";

  if ("text" in input) {
    text = input.text;
    sourceName = input.sourceName || "document";
  } else if ("file" in input) {
    text = await extractTextFromFile(input.file);
    sourceName = input.sourceName || input.file.name;
  } else {
    text = await downloadTextFromUrl(input.sourceUrl);
    sourceName = input.sourceName || input.sourceUrl;
  }

  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return [];
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: input.chunkSize ?? 1000,
    chunkOverlap: input.chunkOverlap ?? 200,
  });

  const documents = await splitter.splitText(normalizedText);

  return documents.map((chunk, index) => ({
    content: chunk.trim(),
    metadata: {
      source: sourceName,
      index,
      chunkSize: input.chunkSize ?? 1000,
    },
  }));
}

export async function chunkDocumentFromS3Url(sourceUrl: string, options?: ChunkDocumentOptions) {
  return chunkDocument({ sourceUrl, ...options });
}
