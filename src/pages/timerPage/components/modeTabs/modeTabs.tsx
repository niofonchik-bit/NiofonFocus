import { TIMER_MODE_ORDER, TIMER_MODES, type TimerMode } from '@pages/timerPage/constants/timerModes';
import type React from 'react';
import './modeTabs.css';

interface ModeTabsProps {
    mode: TimerMode;
    onChange: (mode: TimerMode) => void;
}

export default function ModeTabs({ mode, onChange }: ModeTabsProps) {
    const activeIndex = TIMER_MODE_ORDER.indexOf(mode);

    return (
        <div
            className='mode_tabs'
            role='tablist'
            style={{ '--tabs-count': TIMER_MODE_ORDER.length } as React.CSSProperties}
        >
            <span
                className='mode_tabs_indicator'
                style={{
                    transform: `translateX(${activeIndex * 100}%)`,
                }}
                aria-hidden='true'
            />

            {TIMER_MODE_ORDER.map((m) => (
                <button
                    key={m}
                    role='tab'
                    aria-selected={mode === m}
                    className={['mode_tabs_tab', mode === m ? 'mode_tabs_tab_active' : ''].filter(Boolean).join(' ')}
                    onClick={() => onChange(m)}
                >
                    {TIMER_MODES[m].label}
                </button>
            ))}
        </div>
    );
}
