import { mdiHeart, mdiStarFourPoints } from '@mdi/js';

/** пресет анимации: наполняет слой эффектов частицами */
export type CelebrationPreset = (layer: HTMLElement) => void;

/** случайное число в диапазоне */
function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/** учитываем системную настройку «уменьшить движение» */
function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** частица, которая сама удаляется после завершения анимации */
function spawnParticle(layer: HTMLElement, className: string, style: string): HTMLSpanElement {
    const particle = document.createElement('span');

    particle.className = className;
    particle.style.cssText = style;
    particle.addEventListener('animationend', () => particle.remove(), { once: true });

    layer.appendChild(particle);

    return particle;
}

/** svg-разметка mdi-иконки для глифов */
function glyphMarkup(path: string): string {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="currentColor" /></svg>`;
}

/** фейерверк: несколько залпов, каждый раскрывается искрами */
function fireworksPreset(layer: HTMLElement): void {
    const launches = 3;

    for (let launch = 0; launch < launches; launch += 1) {
        const originX = random(25, 75);
        const rise = -random(70, 110);

        const rocket = spawnParticle(
            layer,
            'habit_fx_dot habit_fx_rocket',
            `left: ${originX.toFixed(1)}%; bottom: 64px; width: 5px; height: 11px; border-radius: 3px; --rise: ${rise.toFixed(0)}px; animation-delay: ${launch * 120}ms;`,
        );

        rocket.addEventListener(
            'animationend',
            () => {
                const sparks = 16;

                for (let i = 0; i < sparks; i += 1) {
                    const angle = (Math.PI * 2 * i) / sparks;
                    const radius = random(26, 44);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius + 20;

                    spawnParticle(
                        layer,
                        'habit_fx_dot habit_fx_spark',
                        `left: ${originX.toFixed(1)}%; bottom: ${(64 - rise).toFixed(0)}px; width: 5px; height: 5px; border-radius: 3px; --x: ${x.toFixed(0)}px; --y: ${y.toFixed(0)}px;`,
                    );
                }
            },
            { once: true },
        );
    }
}

/** высокий берст: много частиц с большим разбросом вверх */
function highBurstPreset(layer: HTMLElement): void {
    const particles = 22;

    for (let i = 0; i < particles; i += 1) {
        const x = random(-58, 58);
        const y = -random(95, 165);
        const rotation = random(-220, 220);

        spawnParticle(
            layer,
            'habit_fx_dot habit_fx_high',
            `left: 50%; bottom: 56px; width: 6px; height: 11px; border-radius: 2px; --x: ${x.toFixed(0)}px; --y: ${y.toFixed(0)}px; --r: ${rotation.toFixed(0)}deg; animation-duration: ${random(700, 950).toFixed(0)}ms;`,
        );
    }
}

/** конфетти: падает с верхушки карточки по всей ширине и затухает */
function confettiPreset(layer: HTMLElement): void {
    const { height } = layer.getBoundingClientRect();
    const pieces = 26;

    for (let i = 0; i < pieces; i += 1) {
        const left = random(0, 100);
        const drift = random(-30, 30);
        const fall = height + random(20, 70);
        const rotation = random(360, 900);

        spawnParticle(
            layer,
            'habit_fx_dot habit_fx_confetti',
            `left: ${left.toFixed(1)}%; top: -16px; width: 7px; height: 10px; border-radius: 1px; --x: ${drift.toFixed(0)}px; --y: ${fall.toFixed(0)}px; --r: ${rotation.toFixed(0)}deg; animation-duration: ${random(900, 1500).toFixed(0)}ms; animation-delay: ${random(0, 250).toFixed(0)}ms;`,
        );
    }
}

/** искры-звёзды: мягко появляются по одной */
function sparklePreset(layer: HTMLElement): void {
    const sparkles = 12;

    for (let i = 0; i < sparkles; i += 1) {
        const left = random(8, 92);
        const top = random(8, 78);
        const size = random(12, 18);

        const sparkle = spawnParticle(
            layer,
            'habit_fx_glyph habit_fx_sparkle',
            `left: ${left.toFixed(1)}%; top: ${top.toFixed(1)}%; font-size: ${size.toFixed(0)}px; animation-delay: ${i * 70}ms;`,
        );

        sparkle.innerHTML = glyphMarkup(mdiStarFourPoints);
    }
}

/** парящие сердца: много, по всей ширине, всплывают вверх */
function heartsPreset(layer: HTMLElement): void {
    const hearts = 16;

    for (let i = 0; i < hearts; i += 1) {
        const left = random(4, 96);
        const drift = random(-26, 26);
        const rise = -random(90, 150);
        const size = random(13, 21);
        const rotation = random(-16, 16);

        const heart = spawnParticle(
            layer,
            'habit_fx_glyph habit_fx_heart',
            `left: ${left.toFixed(1)}%; bottom: 40px; font-size: ${size.toFixed(0)}px; --x: ${drift.toFixed(0)}px; --y: ${rise.toFixed(0)}px; --rot: ${rotation.toFixed(0)}deg; animation-duration: ${random(950, 1350).toFixed(0)}ms; animation-delay: ${random(0, 220).toFixed(0)}ms;`,
        );

        heart.innerHTML = glyphMarkup(mdiHeart);
    }
}

/** пролетающие звёзды: летят по диагонали, появляются из-за края */
function shootingStarsPreset(layer: HTMLElement): void {
    const { width, height } = layer.getBoundingClientRect();
    const travel = Math.max(width, height) + 160;
    const stars = 9;

    for (let i = 0; i < stars; i += 1) {
        const startTop = random(-15, 75);
        const size = random(11, 17);

        const star = spawnParticle(
            layer,
            'habit_fx_glyph habit_fx_shoot',
            `left: -12%; top: ${startTop.toFixed(1)}%; font-size: ${size.toFixed(0)}px; --tx: ${travel.toFixed(0)}px; --ty: ${travel.toFixed(0)}px; animation-duration: ${random(750, 1050).toFixed(0)}ms; animation-delay: ${i * 90}ms;`,
        );

        star.innerHTML = glyphMarkup(mdiStarFourPoints);
    }
}

/** рисующаяся галочка — общий эффект, проигрывается всегда */
function drawCheck(layer: HTMLElement): void {
    const wrapper = document.createElement('span');

    wrapper.className = 'habit_fx_check';
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.innerHTML =
        '<svg viewBox="0 0 52 52">' +
        '<circle class="habit_fx_check_ring" cx="26" cy="26" r="23" pathLength="1" />' +
        '<path class="habit_fx_check_mark" d="M15 27 L23 35 L38 18" pathLength="1" />' +
        '</svg>';

    // animationend всплывает от дочерних path/circle — удаляем только по своей анимации
    wrapper.addEventListener('animationend', (event) => {
        if (event.target === wrapper) {
            wrapper.remove();
        }
    });

    layer.appendChild(wrapper);
}

/** случайные пресеты выполнения */
export const HABIT_RANDOM_PRESETS: CelebrationPreset[] = [
    fireworksPreset,
    highBurstPreset,
    confettiPreset,
    sparklePreset,
    heartsPreset,
    shootingStarsPreset,
];

/** запуск празднования: всегда галочка + случайный пресет */
export function playHabitCelebration(layer: HTMLElement | null): void {
    if (!layer || prefersReducedMotion()) {
        return;
    }

    drawCheck(layer);

    const preset = HABIT_RANDOM_PRESETS[Math.floor(Math.random() * HABIT_RANDOM_PRESETS.length)];

    preset(layer);
}

/** мгновенная очистка слоя (например, при ошибке сохранения) */
export function clearHabitCelebration(layer: HTMLElement | null): void {
    layer?.replaceChildren();
}
