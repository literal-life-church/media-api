import { GenericMapper } from "../../../shared/data/mapper/GenericMapper";

export class YouTubeThumbnailMapper implements GenericMapper<string, string> {
    map(videoId: string): string {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
}
