// Image upload client.
//
// The dashboard POSTs the raw file to OUR backend's auth-protected
// POST /api/upload (multipart). The backend adds the file-service token,
// gets a pre-signed S3 URL, and PUTs the bytes to S3 itself, then returns the
// public URL. So the token never reaches the browser, and there is no
// browser→S3 request (no S3-bucket CORS needed).

import { API_URL, getAuth } from "./api";

/**
 * Upload an image and return its public URL.
 * @param file   the File selected by the admin
 * @param folder logical folder within the bucket (e.g. "remedies", "banners")
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const token = getAuth();
  if (!token) {
    throw new Error("You are not logged in — cannot upload images.");
  }

  const form = new FormData();
  form.append("folder", folder);
  form.append("file", file, file.name);

  // NOTE: do NOT set Content-Type — the browser sets the multipart boundary.
  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Basic ${token}` },
    body: form,
  });

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) detail = body.error;
    } catch {
      /* keep the status-based detail */
    }
    throw new Error(`Image upload failed: ${detail}`);
  }

  const { publicUrl } = (await res.json()) as { publicUrl?: string };
  if (!publicUrl) {
    throw new Error("Backend did not return a public URL.");
  }
  return publicUrl;
}
