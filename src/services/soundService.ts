// =====================================================
// Sound Effects Suggestion Service
// =====================================================
import { callAI } from './aiService';

const SFX_LIBRARY = `Animals: Lion roar, Dog bark, Cat meow, Wolf howl, Elephant trumpet, Bird chirp, Monkey scream, Horse neigh, Snake hiss, Bear growl
Bass: 808 bass, Sub bass drop, Distorted bass, Slap bass, Deep sine bass, FM bass, Reece bass, Growl bass, Bass wobble, Electric bass
Booms: Explosion boom, Cinematic boom, Low-end hit, Impact boom, Bass cannon, Thunder boom, Sub hit, Explosion blast, Deep rumble, Trailer boom
Braams: Inception braam, Brass braam, Synth braam, Hybrid braam, Low braam, Epic braam, Distorted braam, Trailer braam, Layered braam, Horror braam
Brass: Trumpet hit, Trombone slide, French horn stab, Brass ensemble, Staccato brass, Epic brass, Orchestral swell, Brass fall, Muted trumpet, Brass chord
Cymbals: Crash cymbal, Ride cymbal, Hi-hat closed, Hi-hat open, Splash cymbal, China cymbal, Reverse cymbal, Cymbal swell, Cymbal hit, Cymbal choke
Devices: Phone click, Camera shutter, Keyboard typing, Mouse click, Notification ping, Alarm beep, Dial tone, Scanner beep, Button click, Touch tap
Drones: Ambient drone, Dark drone, Low drone, Sci-fi drone, Horror drone, Synth drone, Industrial drone, Space drone, Texture drone, Pad drone
Fantasy: Magic sparkle, Spell cast, Fairy chime, Mystic whoosh, Enchanted hit, Magic explosion, Potion bubble, Rune activation, Wand swish, Portal open
Foley: Footsteps, Cloth movement, Door creak, Glass clink, Paper rustle, Object drop, Chair move, Hand grab, Water splash, Metal handling
Horror: Jump scare, Dark hit, Creepy whisper, Dissonant sting, Reverse scream, Tension rise, Metal scrape, Horror drone, Heartbeat, Evil laugh
Impacts: Metal hit, Wood hit, Glass break, Punch hit, Body fall, Hard slam, Soft thud, Debris hit, Collision, Impact hit
Nature: Rain, Wind, Thunder, River flow, Leaves rustle, Fire crackle, Water drop, Birds ambience, Forest ambience, Insect buzz
Ocean: Wave crash, Ocean ambience, Water splash, Bubble, Underwater hum, Seagull, Shore wash, Deep sea drone, Water movement, Tide
Risers: Noise riser, Pitch riser, Reverse riser, Tension build, Synth riser, Whoosh riser, Impact riser, FX riser, Sweep up, Energy riser
Sci-Fi: Laser shot, Plasma blast, Robot beep, Space whoosh, Alien sound, Force field, Futuristic UI, Energy charge, Teleport, Sci-fi drone
UI Elements: Click, Pop, Swipe, Notification, Success chime, Error buzz, Toggle, Tap, Hover, Select
Whooshes: Fast whoosh, Slow whoosh, Reverse whoosh, Air swipe, Transition whoosh, Impact whoosh, Soft whoosh, Hard whoosh, Motion whoosh, Pass-by
Strings: Violin note, Cello note, String ensemble, Pizzicato, Tremolo, Legato strings, Staccato strings, String swell, Orchestral strings, Viola
Synth: Lead synth, Pad synth, Arp synth, Pluck synth, Bass synth, Analog synth, Digital synth, FM synth, Saw wave, Square wave`;

export async function suggestSoundEffects(
  imageBase64: string,
  mimeType: string,
  context?: string,
  modelId?: string
): Promise<string> {
  try {
    const response = await callAI({
      modelId: modelId || 'gemini-2.5-flash',
      systemInstruction:
        'You are a Sound Designer and Creative Director. Your goal is to suggest sound effects that perfectly match the visual mood, action, and transitions in an image or scene. Be creative and specific. Format suggestions as a clean numbered list with brief explanation for each.',
      parts: [
        { inlineData: { data: imageBase64, mimeType } },
        {
          text: `Analyze this image and suggest the most suitable sound effects from the following library. You can also suggest other sound effects if they fit better. Provide a list of 5-10 suggestions with a brief explanation for each (1-2 sentences explaining why it fits).${context ? `\n\nAdditional context: ${context}` : ''}\n\nLibrary:\n${SFX_LIBRARY}`,
        },
      ],
      temperature: 0.7,
    });
    return response.text || 'No sound effects suggested.';
  } catch (err) {
    console.error('Error suggesting sound effects:', err);
    return 'Failed to analyze image for sound effects.';
  }
}

export async function suggestCinematicStyles(
  imageBase64: string,
  mimeType: string,
  brief: string,
  availableStyles: { id: string; label: string; description: string }[],
  modelId?: string
): Promise<string[]> {
  try {
    const stylesList = availableStyles
      .map((s) => `${s.label}: ${s.description}`)
      .join('\n');

    const response = await callAI({
      modelId: modelId || 'gemini-2.5-flash',
      systemInstruction:
        'You are a Creative Director. Your goal is to select the most effective visual styles for a product ad based on visual analysis and brand brief. Output ONLY the labels.',
      parts: [
        { inlineData: { data: imageBase64, mimeType } },
        {
          text: `Analyze this product image and the following creative brief: "${brief}"\n\nBased on this, select the 3-5 most suitable cinematic styles from the list below that would create the most compelling ad storyboard. Output ONLY the style labels as a comma-separated list.\n\nAvailable Styles:\n${stylesList}`,
        },
      ],
      temperature: 0.6,
    });

    const text = response.text || '';
    const selectedLabels = text.split(',').map((s) => s.trim());
    return availableStyles
      .filter((s) =>
        selectedLabels.some(
          (label) =>
            label.toLowerCase().includes(s.label.toLowerCase()) ||
            s.label.toLowerCase().includes(label.toLowerCase())
        )
      )
      .map((s) => s.id);
  } catch (err) {
    console.error('Error suggesting styles:', err);
    return [];
  }
}
