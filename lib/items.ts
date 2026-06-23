import "server-only";

import { unstable_cache } from "next/cache";
import { apiFetchPublic, getAuthToken } from "./apiClient";
import { sqliteToMs } from "./format";
import { tagColorKey } from "./kinds";
import { parseTitle } from "./version";
import type { DriveFile, Folder, Kind, Tag } from "./types";

interface ApiTag {
  id: number;
  name: string;
  color: string;
}

interface ApiFolder {
  id: number;
  name: string;
  parentId: number | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface ApiItemSummary {
  id: number;
  slug: string;
  title: string;
  kind: Kind;
  totalParts: number;
  totalSize: number;
  isFavorite: boolean;
  dateAdded: string;
  updatedAt: string;
  deletedAt: string | null;
  folderId: number | null;
  tags: number[];
  hasThumb: boolean;
  firstPartId: number | null;
  firstPartFileName: string | null;
}

interface ApiDrive {
  files: ApiItemSummary[];
  tags: ApiTag[];
  folders: ApiFolder[];
}

// Fetch and shape all drive data from the .NET API (Dapper-backed).
// The shaped result keeps the old UI model intact while moving metadata reads behind JWT REST.
export async function getDriveData(
  space: "main" | "private" = "main",
): Promise<{ files: DriveFile[]; tags: Tag[]; folders: Folder[] }> {
  const token = await getAuthToken();
  return unstable_cache(
    (tok: string) => fetchDriveData(space, tok),
    ["drive-data", space],
    { revalidate: 15, tags: [`drive-${space}`] },
  )(token ?? "");
}

async function fetchDriveData(
  space: "main" | "private",
  token: string,
): Promise<{ files: DriveFile[]; tags: Tag[]; folders: Folder[] }> {
  const data = await apiFetchPublic<ApiDrive>(`/drive?space=${space}`, {}, token);

  const tags: Tag[] = data.tags.map((t) => {
    const stored = String(t.color ?? "").trim();
    return {
      id: Number(t.id),
      name: String(t.name),
      color: stored || tagColorKey(String(t.name)),
    };
  });

  const files: DriveFile[] = data.files.map((item) => {
    const id = Number(item.id);
    const name = String(item.title);
    const kind = String(item.kind) as Kind;
    const deletedAt = item.deletedAt
      ? sqliteToMs(String(item.deletedAt))
      : null;
    const tp =
      kind === "archive"
        ? parseTitle(name)
        : { family: name, familyKey: String(item.slug), version: null };

    return {
      id,
      slug: String(item.slug),
      name,
      kind,
      size: Number(item.totalSize),
      parts: Number(item.totalParts),
      modified: sqliteToMs(String(item.updatedAt)),
      added: sqliteToMs(String(item.dateAdded)),
      tags: (item.tags ?? []).map(Number),
      starred: Boolean(item.isFavorite),
      trashed: deletedAt != null,
      deletedAt,
      thumb: item.hasThumb ? `/api/thumb/${id}` : null,
      firstPartId: item.firstPartId == null ? null : Number(item.firstPartId),
      fileName: item.firstPartFileName ?? null,
      family: tp.family,
      familyKey: tp.familyKey,
      version: tp.version,
      folderId: item.folderId == null ? null : Number(item.folderId),
    };
  });

  const folders: Folder[] = data.folders.map((f) => ({
    id: Number(f.id),
    name: String(f.name),
    parentId: f.parentId == null ? null : Number(f.parentId),
    createdAt: sqliteToMs(String(f.createdAt)),
    updatedAt: sqliteToMs(String(f.updatedAt)),
    trashed: f.deletedAt != null,
  }));

  return { files, tags, folders };
}
