import type { Habit, NewHabit } from '@api/habits';
import PathIcon from '@components/pathIcon/pathIcon';
import { mdiCalendarBlankOutline, mdiCheck, mdiFire, mdiPlus } from '@mdi/js';
import { DEFAULT_HABIT_COLOR, HABIT_COLORS } from '@root/constants/habitColors';
import { getHabitIconPath, HABIT_ICONS } from '@root/constants/habitIcons';
import { getScheduleLabel, WEEK_DAY_LABELS } from '@root/scripts/utilities';
import React from 'react';
import './habitDialog.css';

interface HabitDialogProps {
    /** привычка для редактирования; null — создание */
    habit?: Habit | null;
    submitting?: boolean;
    error?: string | null;
    onSubmit: (input: NewHabit) => void;
    onClose: () => void;
}

const DEFAULT_ICON = HABIT_ICONS[0].value;
const DEFAULT_WEEK_DAYS = [0, 2, 4];

/** диалог создания и редактирования привычки */
export default function HabitDialog({ habit, submitting = false, error, onSubmit, onClose }: HabitDialogProps) {
    const editing = Boolean(habit);

    const [title, setTitle] = React.useState(habit?.title ?? '');
    const [color, setColor] = React.useState(habit?.color ?? DEFAULT_HABIT_COLOR);
    const [icon, setIcon] = React.useState(habit?.icon ?? DEFAULT_ICON);
    const [freq, setFreq] = React.useState<'daily' | 'weekly'>(habit?.schedule.type === 'weekly' ? 'weekly' : 'daily');
    const [days, setDays] = React.useState<number[]>(
        habit?.schedule.type === 'weekly' && habit.schedule.days.length ? habit.schedule.days : DEFAULT_WEEK_DAYS,
    );
    const [touched, setTouched] = React.useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);

    // закрытие по Escape + автофокус
    React.useEffect(() => {
        inputRef.current?.focus();

        function handleKey(event: KeyboardEvent) {
            if (event.key === 'Escape' && !submitting) {
                onClose();
            }
        }

        window.addEventListener('keydown', handleKey);

        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, submitting]);

    const schedule = freq === 'weekly' ? { type: 'weekly' as const, days } : { type: 'daily' as const, days: [] };

    const daysError = touched && freq === 'weekly' && days.length === 0;

    /** переключение дня недели */
    function toggleDay(day: number) {
        setDays((previous) => (previous.includes(day) ? previous.filter((value) => value !== day) : [...previous, day].sort((a, b) => a - b)));
    }

    /** отправка формы */
    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setTouched(true);

        if (!title.trim()) {
            inputRef.current?.focus();
            return;
        }

        if (freq === 'weekly' && days.length === 0) {
            return;
        }

        onSubmit({
            title: title.trim(),
            color,
            icon,
            schedule,
        });
    }

    return (
        <div
            className='habit_dialog_overlay'
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !submitting) {
                    onClose();
                }
            }}
        >
            <div
                className='habit_dialog'
                role='dialog'
                aria-modal='true'
                aria-label={editing ? 'Редактировать привычку' : 'Новая привычка'}
            >
                <form onSubmit={handleSubmit}>
                    <h2 className='habit_dialog_heading'>{editing ? 'Редактировать привычку' : 'Новая привычка'}</h2>

                    <p className='habit_dialog_sub'>{editing ? 'Обновите детали привычки.' : 'Маленький ежедневный шаг к большой цели.'}</p>

                    {/* живое превью */}
                    <div className='habit_dialog_preview'>
                        <div
                            className='habit_dialog_preview_icon'
                            style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color } as React.CSSProperties}
                        >
                            <PathIcon path={getHabitIconPath(icon)} />
                        </div>

                        <div className='habit_dialog_preview_text'>
                            <div className='habit_dialog_preview_title'>{title || 'Название привычки'}</div>

                            <div className='habit_dialog_preview_schedule'>{getScheduleLabel(schedule)}</div>
                        </div>
                    </div>

                    <div className='habit_dialog_field'>
                        <label htmlFor='habit_dialog_title'>Название</label>

                        <input
                            id='habit_dialog_title'
                            ref={inputRef}
                            className='habit_dialog_input'
                            value={title}
                            maxLength={40}
                            placeholder='Например, Чтение 20 минут'
                            disabled={submitting}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </div>

                    <div className='habit_dialog_field'>
                        <label>Цвет</label>

                        <div className='habit_dialog_swatches'>
                            {HABIT_COLORS.map((value) => (
                                <button
                                    key={value}
                                    type='button'
                                    className={['habit_dialog_swatch', value === color ? 'habit_dialog_swatch_selected' : '']
                                        .filter(Boolean)
                                        .join(' ')}
                                    style={{ background: value, color: value }}
                                    aria-label={value}
                                    aria-pressed={value === color}
                                    onClick={() => setColor(value)}
                                >
                                    {value === color && <PathIcon path={mdiCheck} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='habit_dialog_field'>
                        <label>Иконка</label>

                        <div className='habit_dialog_icons'>
                            {HABIT_ICONS.map((option) => (
                                <button
                                    key={option.value}
                                    type='button'
                                    title={option.label}
                                    aria-label={option.label}
                                    aria-pressed={option.value === icon}
                                    className={['habit_dialog_icon', option.value === icon ? 'habit_dialog_icon_selected' : '']
                                        .filter(Boolean)
                                        .join(' ')}
                                    onClick={() => setIcon(option.value)}
                                >
                                    <PathIcon path={option.path} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='habit_dialog_field'>
                        <label>Расписание</label>

                        <div className='habit_dialog_freq'>
                            <button
                                type='button'
                                className={freq === 'daily' ? 'habit_dialog_freq_on' : ''}
                                onClick={() => setFreq('daily')}
                            >
                                <PathIcon path={mdiFire} />
                                Каждый день
                            </button>

                            <button
                                type='button'
                                className={freq === 'weekly' ? 'habit_dialog_freq_on' : ''}
                                onClick={() => setFreq('weekly')}
                            >
                                <PathIcon path={mdiCalendarBlankOutline} />
                                По дням недели
                            </button>
                        </div>

                        {freq === 'weekly' && (
                            <div className='habit_dialog_days'>
                                {WEEK_DAY_LABELS.map((label, index) => (
                                    <button
                                        key={label}
                                        type='button'
                                        aria-pressed={days.includes(index)}
                                        className={['habit_dialog_day', days.includes(index) ? 'habit_dialog_day_on' : ''].filter(Boolean).join(' ')}
                                        onClick={() => toggleDay(index)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {daysError && <p className='habit_dialog_hint'>Выберите хотя бы один день</p>}
                    </div>

                    {error && <p className='habit_dialog_hint'>{error}</p>}

                    <div className='habit_dialog_actions'>
                        <button
                            type='button'
                            className='habit_dialog_button habit_dialog_button_ghost'
                            disabled={submitting}
                            onClick={onClose}
                        >
                            Отмена
                        </button>

                        <button
                            type='submit'
                            className='habit_dialog_button habit_dialog_button_primary'
                            disabled={submitting}
                        >
                            <PathIcon path={editing ? mdiCheck : mdiPlus} />
                            {editing ? 'Сохранить' : 'Создать привычку'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
