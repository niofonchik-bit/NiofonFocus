import type { Habit, NewHabit } from '@api/habits';
import AppDialog from '@components/appDialog/appDialog';
import { InlineLoader } from '@components/appLoader/appLoader';
import PathIcon from '@components/pathIcon/pathIcon';
import { mdiCalendarBlankOutline, mdiCheck, mdiFire, mdiPlus } from '@mdi/js';
import { Button } from '@mui/material';
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

/** форма создания и редактирования привычки */
export default function HabitDialog({ habit, submitting = false, error, onSubmit, onClose }: HabitDialogProps) {
    const editing = Boolean(habit);

    const formId = React.useId();
    const titleId = React.useId();
    const descriptionId = React.useId();

    const [title, setTitle] = React.useState(habit?.title ?? '');
    const [color, setColor] = React.useState(habit?.color ?? DEFAULT_HABIT_COLOR);
    const [icon, setIcon] = React.useState(habit?.icon ?? DEFAULT_ICON);

    const [freq, setFreq] = React.useState<'daily' | 'weekly'>(habit?.schedule.type === 'weekly' ? 'weekly' : 'daily');

    const [days, setDays] = React.useState<number[]>(
        habit?.schedule.type === 'weekly' && habit.schedule.days.length ? habit.schedule.days : DEFAULT_WEEK_DAYS,
    );

    const [touched, setTouched] = React.useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const schedule =
        freq === 'weekly'
            ? {
                  type: 'weekly' as const,
                  days,
              }
            : {
                  type: 'daily' as const,
                  days: [],
              };

    const titleError = touched && !title.trim();
    const daysError = touched && freq === 'weekly' && days.length === 0;

    /** переключение дня недели */
    function toggleDay(day: number) {
        setDays((previous) => (previous.includes(day) ? previous.filter((value) => value !== day) : [...previous, day].sort((a, b) => a - b)));
    }

    /** отправка формы */
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
        <AppDialog
            open
            busy={submitting}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onClose={onClose}
        >
            <AppDialog.Header>
                <h2
                    id={titleId}
                    className='habit_dialog_heading'
                >
                    {editing ? 'Редактировать привычку' : 'Новая привычка'}
                </h2>

                <p
                    id={descriptionId}
                    className='habit_dialog_subtitle'
                >
                    {editing ? 'Обновите детали привычки.' : 'Маленький ежедневный шаг к большой цели.'}
                </p>
            </AppDialog.Header>

            <AppDialog.Content>
                <form
                    id={formId}
                    onSubmit={handleSubmit}
                >
                    {/* живое превью */}
                    <div className='habit_dialog_preview'>
                        <div
                            className='habit_dialog_preview_icon'
                            style={
                                {
                                    background: `color-mix(in srgb, ${color} 16%, transparent)`,
                                    color,
                                } as React.CSSProperties
                            }
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
                            aria-invalid={titleError}
                            onChange={(event) => setTitle(event.target.value)}
                        />

                        {titleError && <p className='habit_dialog_hint'>Введите название привычки</p>}
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
                                    style={{
                                        background: value,
                                        color: value,
                                    }}
                                    aria-label={value}
                                    aria-pressed={value === color}
                                    disabled={submitting}
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
                                    disabled={submitting}
                                    onClick={() => setIcon(option.value)}
                                >
                                    <PathIcon path={option.path} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='habit_dialog_field habit_dialog_field_last'>
                        <label>Расписание</label>

                        <div className='habit_dialog_freq'>
                            <button
                                type='button'
                                className={freq === 'daily' ? 'habit_dialog_freq_on' : ''}
                                disabled={submitting}
                                onClick={() => setFreq('daily')}
                            >
                                <PathIcon path={mdiFire} />
                                Каждый день
                            </button>

                            <button
                                type='button'
                                className={freq === 'weekly' ? 'habit_dialog_freq_on' : ''}
                                disabled={submitting}
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
                                        disabled={submitting}
                                        onClick={() => toggleDay(index)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {daysError && <p className='habit_dialog_hint'>Выберите хотя бы один день</p>}
                    </div>

                    {error && (
                        <p
                            className='habit_dialog_hint habit_dialog_hint_global'
                            role='alert'
                        >
                            {error}
                        </p>
                    )}
                </form>
            </AppDialog.Content>

            <AppDialog.Actions>
                <Button
                    type='button'
                    variant='outlined'
                    className='app_dialog_button app_dialog_button_ghost'
                    disabled={submitting}
                    onClick={onClose}
                >
                    Отмена
                </Button>

                <Button
                    type='submit'
                    form={formId}
                    variant='contained'
                    className='app_dialog_button app_dialog_button_primary'
                    disabled={submitting}
                    startIcon={submitting ? <InlineLoader /> : <PathIcon path={editing ? mdiCheck : mdiPlus} />}
                >
                    {editing ? 'Сохранить' : 'Создать привычку'}
                </Button>
            </AppDialog.Actions>
        </AppDialog>
    );
}
