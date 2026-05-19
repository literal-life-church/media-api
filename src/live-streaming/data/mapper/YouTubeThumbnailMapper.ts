export class YouTubeThumbnailMapper {
    map(videoId: string): string {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
}
