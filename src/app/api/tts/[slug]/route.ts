import { resolveIssue } from "@/lib/issues";
import { narrate } from "@/lib/narrate";

/**
 * GET /api/tts/[slug] - the "read it to me" audio.
 *
 * When ELEVENLABS_API_KEY is set, returns a genuinely human-sounding narration
 * (ElevenLabs, the best AI voice). The audio is CDN-cached per issue so it's
 * generated once, then served free. Without the key it returns {fallback:true}
 * and the Listen button uses the browser's built-in voice (free, instant, but
 * robotic) so the feature still works.
 */
const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const issue = await resolveIssue(slug);
  if (!issue) return new Response("not found", { status: 404 });

  if (!KEY) {
    return Response.json({ fallback: true });
  }

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: narrate(issue),
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.15 },
        }),
        // generated once, cached at the CDN below
        next: { revalidate: 86400 },
      } as RequestInit
    );
    if (!r.ok) return Response.json({ fallback: true });
    const audio = await r.arrayBuffer();
    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, s-maxage=604800, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json({ fallback: true });
  }
}
