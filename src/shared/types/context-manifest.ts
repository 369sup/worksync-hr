export interface ContextManifest {
  name: string;
  kind: "core" | "supporting" | "generic";
  description: string;
}
