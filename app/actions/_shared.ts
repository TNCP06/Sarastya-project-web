import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

// Internal helpers shared across the server-action modules. NOT a "use server"
// module, so these are plain server-side functions (not exposed as actions).

export function refresh() {
  revalidatePath("/");
  revalidatePath("/trash");
  revalidatePath("/private");
  revalidatePath("/upload");
  revalidateTag("drive-main");
  revalidateTag("drive-private");
}
