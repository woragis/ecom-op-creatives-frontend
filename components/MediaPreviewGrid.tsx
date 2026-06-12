import { mediaUrl } from "@/lib/media";
import type { SceneImage, VideoClip } from "@/lib/run-parsers";

type Props = {
  images: SceneImage[];
  clips: VideoClip[];
  narrationUrl?: string;
  imageProvider: string;
  videoProvider: string;
};

export function MediaPreviewGrid({
  images,
  clips,
  narrationUrl,
  imageProvider,
  videoProvider,
}: Props) {
  const audioSrc = mediaUrl(narrationUrl);

  return (
    <div className="media-sections">
      {audioSrc ? (
        <section className="card">
          <h3>Narration</h3>
          <audio src={audioSrc} controls style={{ width: "100%" }} />
        </section>
      ) : null}

      {images.length > 0 ? (
        <section>
          <h3>Scene images · {imageProvider}</h3>
          <div className="media-grid">
            {images.map((img) => (
              <div key={`${img.sceneId}-${img.role}`} className="media-card">
                <img src={mediaUrl(img.publicUrl) ?? ""} alt={`${img.sceneId} ${img.role}`} />
                <div className="media-card-footer">
                  <span>
                    {img.sceneId} · {img.role}
                  </span>
                  <span className="muted">{img.source}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {clips.length > 0 ? (
        <section>
          <h3>AI clips · {videoProvider}</h3>
          <div className="media-grid">
            {clips.map((clip) => (
              <div key={clip.sceneId} className="media-card">
                <video src={mediaUrl(clip.publicUrl) ?? ""} controls playsInline />
                <div className="media-card-footer">
                  <span>{clip.sceneId}</span>
                  {clip.mode ? <span className="muted">{clip.mode}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
