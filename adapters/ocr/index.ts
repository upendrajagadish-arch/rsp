import { extractText, getDocumentProxy } from "unpdf";

export type ExtractionResult = {
  rawText: string;
  structured: {
    title?: string;
    issuing_organization?: string;
    recipient_name?: string;
    issue_date?: string;
    expiration_date?: string;
    credential_number?: string;
    credential_url?: string;
    skills?: string[];
  };
  provider: string;
  confidence: number | null;
  unavailableReason?: string;
};

export interface OcrAdapter {
  name: string;
  extract(buffer: Buffer, mimeType: string): Promise<ExtractionResult>;
}

function parseStructuredFromText(text: string): ExtractionResult["structured"] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const joined = text.toLowerCase();
  const title = lines.find((l) => /certificate|certification|credential|diploma/i.test(l)) ?? lines[0];
  const issuerLine = lines.find((l) => /issued by|issuer|organization|authority/i.test(l));
  const numberMatch = text.match(/(?:credential|certificate|license)\s*(?:id|no\.?|number)?\s*[:#]?\s*([A-Z0-9-]{6,})/i);
  const urlMatch = text.match(/https?:\/\/[^\s)]+/i);
  const skills: string[] = [];
  for (const skill of ["Python", "AWS", "JavaScript", "React", "SQL", "Machine Learning", "Cybersecurity"]) {
    if (joined.includes(skill.toLowerCase())) skills.push(skill);
  }
  return {
    title: title?.slice(0, 200),
    issuing_organization: issuerLine?.replace(/^(issued by|issuer|organization)\s*:?\s*/i, "").slice(0, 200),
    credential_number: numberMatch?.[1],
    credential_url: urlMatch?.[0],
    skills,
  };
}

export class PdfTextAdapter implements OcrAdapter {
  name = "pdf-text";

  async extract(buffer: Buffer, mimeType: string): Promise<ExtractionResult> {
    if (mimeType !== "application/pdf") {
      return {
        rawText: "",
        structured: {},
        provider: this.name,
        confidence: null,
        unavailableReason:
          "Image OCR provider is not configured. PDF text extraction only supports application/pdf.",
      };
    }
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    const rawText = Array.isArray(text) ? text.join("\n") : String(text ?? "");
    if (!rawText.trim()) {
      return {
        rawText: "",
        structured: {},
        provider: this.name,
        confidence: null,
        unavailableReason:
          "No extractable text found. Scanned certificates require an OCR provider (OCR_API_KEY).",
      };
    }
    return {
      rawText,
      structured: parseStructuredFromText(rawText),
      provider: this.name,
      confidence: 0.55,
    };
  }
}

export class UnavailableOcrAdapter implements OcrAdapter {
  name = "unavailable";

  async extract(): Promise<ExtractionResult> {
    return {
      rawText: "",
      structured: {},
      provider: this.name,
      confidence: null,
      unavailableReason:
        "OCR provider is not configured. Set OCR_API_KEY or upload a text-based PDF.",
    };
  }
}

export function getOcrAdapter(mimeType: string): OcrAdapter {
  if (mimeType === "application/pdf") return new PdfTextAdapter();
  if (process.env.OCR_API_KEY) {
    // Optional paid OCR would plug in here. Without a concrete integration, stay unavailable.
    return new UnavailableOcrAdapter();
  }
  return new UnavailableOcrAdapter();
}
