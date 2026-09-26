/**
 * YoungFire Startup Audio Manager
 * Celestial chime noise removed per ministry directive.
 * Activates official worship track "Not Lucky, I'm Loved" by Jonathan McReynolds on sanctuary entrance.
 */

class StartupAudioManager {
  private static instance: StartupAudioManager;
  private played = false;

  private constructor() {}

  public static getInstance(): StartupAudioManager {
    if (!StartupAudioManager.instance) {
      StartupAudioManager.instance = new StartupAudioManager();
    }
    return StartupAudioManager.instance;
  }

  public playSanctuaryEntranceSong() {
    if (this.played) return;
    this.played = true;

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "yf_recommended_startup_song",
          "Jonathan McReynolds — Not Lucky, I'm Loved"
        );
        window.dispatchEvent(
          new CustomEvent("yf_play_entrance_song", {
            detail: {
              title: "Not Lucky, I'm Loved",
              artist: "Jonathan McReynolds",
            },
          })
        );
      }
    } catch {}
  }

  // Chime noise completely disabled
  public triggerChime() {
    // Chime noise removed per directive.
    return;
  }
}

export const startupAudio = StartupAudioManager.getInstance();
