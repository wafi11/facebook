import { generateReactHelpers } from "@uploadthing/react";

import type { AppFileRoute } from "@/lib/core";

// export const UploadButton = generateUploadButton<AppFileRoute>();
// export const UploadDropzone = generateUploadDropzone<AppFileRoute>();

export const { getRouteConfig, uploadFiles, useUploadThing } =
  generateReactHelpers<AppFileRoute>();
