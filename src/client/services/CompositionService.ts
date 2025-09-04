import type { Clip, Track } from '@shared/types/primitives';

export class CompositionService {
  calculateCompositionAtTime(
    time: number,
    clips: Clip[],
    tracks: Track[]
  ): CompositionFrame {
    const activeClips = clips.filter(
      clip => clip.startTime <= time && clip.endTime > time
    );

    const layers: Layer[] = [];

    for (const track of tracks.sort((a, b) => a.order - b.order)) {
      if (!track.visible) continue;

      const trackClips = activeClips.filter(clip => clip.trackId === track.id);
      
      for (const clip of trackClips) {
        const clipTime = time - clip.startTime + clip.inPoint;
        
        layers.push({
          clipId: clip.id,
          trackId: track.id,
          type: clip.type,
          clipTime,
          opacity: 1,
          transform: { x: 0, y: 0, scale: 1, rotation: 0 },
        });
      }
    }

    return {
      time,
      layers,
    };
  }

  detectCollisions(
    clips: Clip[],
    tracks: Track[]
  ): Collision[] {
    const collisions: Collision[] = [];

    for (const track of tracks) {
      const trackClips = clips
        .filter(clip => clip.trackId === track.id)
        .sort((a, b) => a.startTime - b.startTime);

      for (let i = 0; i < trackClips.length - 1; i++) {
        if (trackClips[i].endTime > trackClips[i + 1].startTime) {
          collisions.push({
            clip1: trackClips[i].id,
            clip2: trackClips[i + 1].id,
            trackId: track.id,
            overlapStart: trackClips[i + 1].startTime,
            overlapEnd: Math.min(trackClips[i].endTime, trackClips[i + 1].endTime),
          });
        }
      }
    }

    return collisions;
  }

  calculateProjectDuration(clips: Clip[]): number {
    if (clips.length === 0) return 0;
    return Math.max(...clips.map(clip => clip.endTime));
  }
}

interface CompositionFrame {
  time: number;
  layers: Layer[];
}

interface Layer {
  clipId: string;
  trackId: string;
  type: 'video' | 'audio' | 'text' | 'image';
  clipTime: number;
  opacity: number;
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
}

interface Collision {
  clip1: string;
  clip2: string;
  trackId: string;
  overlapStart: number;
  overlapEnd: number;
}