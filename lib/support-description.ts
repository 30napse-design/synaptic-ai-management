export const maxSupportDescriptionWords = 1000;

export function supportDescriptionWordCount(description: string): number {
 return description.match(/\S+/gu)?.length ?? 0;
}
