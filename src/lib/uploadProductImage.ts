import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a single file asset to the Supabase storage bucket and returns its public CDN URL.
 * Cleans filenames automatically to prevent execution failures on special character keys.
 */
export async function uploadProductImage(file: File): Promise<string> {
  // Sanitize the filename to strip special characters/spaces that break layout paths on buckets
  const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const fileName = `${Date.now()}-${cleanName}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, {
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    console.error("Supabase storage transmission failure:", error.message);
    throw error;
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * NEW IMPROVEMENT OPTIMIZATION: Parallel batch file uploader utility handler.
 * Seamlessly resolves multiple images simultaneously when submitted from the Admin Panel tabs.
 */
export async function uploadMultipleProductImages(files: File[]): Promise<string[]> {
  try {
    const uploadPromises = files.map((file) => uploadProductImage(file));
    const publicUrls = await Promise.all(uploadPromises);
    return publicUrls;
  } catch (error) {
    console.error("Batch bucket streaming execution trace error:", error);
    throw error;
  }
}