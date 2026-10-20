import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { SignJWT, jwtVerify } from "jose";

const STORAGE_SECRET = new TextEncoder().encode(
  process.env.AUTH_COOKIE_SECRET || "development_storage_signing_secret_key_12345"
);
const LOCAL_STORAGE_ROOT = path.join(process.cwd(), "local-evidence");
const SIGNED_URL_TTL_SECONDS = parseInt(process.env.SIGNED_URL_TTL_SECONDS || "300", 10);

export interface UploadIntentResult {
  uploadUrl: string;
  objectKey: string;
  expiresAt: Date;
}

export interface DownloadUrlResult {
  downloadUrl: string;
  expiresAt: Date;
}

export const PrivateStorage = {
  /**
   * Generates a strict server-controlled object key.
   * Client cannot control path or tenant prefix.
   */
  generateObjectKey(tenantId: string, caseId: string, originalFileName: string): string {
    const ext = path.extname(originalFileName).toLowerCase().replace(/[^a-z0-9.]/g, "");
    const uuid = crypto.randomUUID();
    return `tenants/${tenantId}/cases/${caseId}/${uuid}${ext}`;
  },

  /**
   * Issues a signed, short-lived upload capability for the specific object key.
   */
  async createSignedUploadUrl(
    tenantId: string,
    caseId: string,
    objectKey: string
  ): Promise<UploadIntentResult> {
    const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000);
    const token = await new SignJWT({
      tenantId,
      caseId,
      objectKey,
      operation: "UPLOAD",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(STORAGE_SECRET);

    const origin = process.env.APP_ORIGIN || "http://localhost:3000";
    const uploadUrl = `${origin}/api/v1/storage/transfer?token=${token}`;

    return {
      uploadUrl,
      objectKey,
      expiresAt,
    };
  },

  /**
   * Issues a signed, short-lived download capability for authorized evidence.
   */
  async createSignedDownloadUrl(
    tenantId: string,
    objectKey: string
  ): Promise<DownloadUrlResult> {
    const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000);
    const token = await new SignJWT({
      tenantId,
      objectKey,
      operation: "DOWNLOAD",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(STORAGE_SECRET);

    const origin = process.env.APP_ORIGIN || "http://localhost:3000";
    const downloadUrl = `${origin}/api/v1/storage/transfer?token=${token}`;

    return {
      downloadUrl,
      expiresAt,
    };
  },

  /**
   * Verifies the storage transfer token.
   */
  async verifyTransferToken(token: string) {
    const { payload } = await jwtVerify(token, STORAGE_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as {
      tenantId: string;
      caseId?: string;
      objectKey: string;
      operation: "UPLOAD" | "DOWNLOAD";
    };
  },

  /**
   * Resolves safe path and prevents directory traversal attacks.
   */
  resolveSafePath(objectKey: string): string {
    const root = path.resolve(LOCAL_STORAGE_ROOT);
    const resolved = path.resolve(root, objectKey);
    if (!resolved.startsWith(root)) {
      throw new Error("Path traversal forbidden");
    }
    return resolved;
  },

  /**
   * Saves uploaded bytes to private storage.
   */
  async writeBytes(objectKey: string, buffer: Buffer): Promise<void> {
    const targetPath = this.resolveSafePath(objectKey);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, buffer);
  },

  /**
   * Reads bytes from private storage.
   */
  async readBytes(objectKey: string): Promise<Buffer> {
    const targetPath = this.resolveSafePath(objectKey);
    return await fs.readFile(targetPath);
  },

  /**
   * Checks if an object exists and retrieves size and SHA-256 checksum.
   */
  async inspectObject(objectKey: string): Promise<{ size: number; checksumSha256: string } | null> {
    try {
      const buffer = await this.readBytes(objectKey);
      const hash = crypto.createHash("sha256").update(buffer).digest("hex");
      return {
        size: buffer.length,
        checksumSha256: hash,
      };
    } catch {
      return null;
    }
  },
};
