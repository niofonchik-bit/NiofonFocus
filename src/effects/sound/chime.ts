let context: AudioContext | null = null;

/** мягкий сигнал завершения сессии */
export function playChime(): void {
    try {
        context ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const ac = context;
        [880, 1108.7, 1318.5].forEach((freq, i) => {
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(ac.destination);
            const t = ac.currentTime + i * 0.16;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
            osc.start(t);
            osc.stop(t + 0.42);
        });
    } catch {
        /* аудио недоступно — тихо игнорируем */
    }
}
