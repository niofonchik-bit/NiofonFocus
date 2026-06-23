import { toggleCompletion, type Habit } from '@api/habits';
import PathIcon from '@components/pathIcon/pathIcon';
import { mdiCalendarMonthOutline, mdiCheck, mdiDeleteOutline, mdiDotsVertical, mdiFire, mdiPencilOutline } from '@mdi/js';
import { Button, CircularProgress, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { getHabitIconPath } from '@root/constants/habitIcons';
import { getCurrentStreak, getDateKey, getHabitWeek, getScheduleLabel, getStreakLabel, isHabitScheduled } from '@root/scripts/utilities';
import React from 'react';
import { useHabitActions } from '@providers/habitsProvider/habitsProvider';

interface HabitCardProps {
    habit: Habit;
    onEdit?: (habit: Habit) => void;
    onDelete?: (habit: Habit) => void;
}

/** частицы анимации выполнения */
const BURST_PARTICLES = [
    { x: -22, y: -26 },
    { x: 22, y: -26 },
    { x: -30, y: -2 },
    { x: 30, y: -2 },
    { x: -14, y: -36 },
    { x: 14, y: -36 },
];

/** карточка привычки */
export default function HabitCard({ habit, onEdit, onDelete }: HabitCardProps) {
    const { updateCompletion } = useHabitActions();

    const [currentHabit, setCurrentHabit] = React.useState(habit);
    const [pending, setPending] = React.useState(false);
    const [requestFailed, setRequestFailed] = React.useState(false);
    const [completionAnimation, setCompletionAnimation] = React.useState(false);
    const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);

    const animationTimerRef = React.useRef<number | null>(null);

    const currentDate = new Date();
    const todayKey = getDateKey(currentDate);
    const completedToday = currentHabit.completions.includes(todayKey);
    const scheduledToday = isHabitScheduled(currentHabit, currentDate);
    const streak = getCurrentStreak(currentHabit);
    const week = getHabitWeek(currentHabit, currentDate);

    React.useEffect(() => {
        setCurrentHabit(habit);
    }, [habit]);

    React.useEffect(() => {
        return () => {
            if (animationTimerRef.current !== null) {
                window.clearTimeout(animationTimerRef.current);
            }
        };
    }, []);

    /** изменение локальной отметки за сегодня */
    function setTodayCompletion(completed: boolean) {
        setCurrentHabit((previousHabit) => {
            const currentlyCompleted = previousHabit.completions.includes(todayKey);

            if (currentlyCompleted === completed) {
                return previousHabit;
            }

            return {
                ...previousHabit,
                completions: completed
                    ? [...previousHabit.completions, todayKey]
                    : previousHabit.completions.filter((completionDate) => completionDate !== todayKey),
            };
        });
    }

    /** запуск анимации выполнения */
    function startCompletionAnimation() {
        if (animationTimerRef.current !== null) {
            window.clearTimeout(animationTimerRef.current);
        }

        setCompletionAnimation(true);

        animationTimerRef.current = window.setTimeout(() => {
            setCompletionAnimation(false);
            animationTimerRef.current = null;
        }, 600);
    }

    /** переключение отметки привычки */
    async function handleToggle() {
        if (pending) {
            return;
        }

        const nextCompleted = !completedToday;

        setPending(true);
        setRequestFailed(false);

        setTodayCompletion(nextCompleted);

        updateCompletion(currentHabit.id, todayKey, nextCompleted);

        if (nextCompleted) {
            startCompletionAnimation();
        } else {
            setCompletionAnimation(false);
        }

        try {
            const savedCompleted = await toggleCompletion(currentHabit.id, todayKey);

            if (savedCompleted !== nextCompleted) {
                setTodayCompletion(savedCompleted);

                updateCompletion(currentHabit.id, todayKey, savedCompleted);

                if (!savedCompleted) {
                    setCompletionAnimation(false);
                }
            }
        } catch {
            setTodayCompletion(completedToday);

            updateCompletion(currentHabit.id, todayKey, completedToday);

            setCompletionAnimation(false);
            setRequestFailed(true);
        } finally {
            setPending(false);
        }
    }

    /** открытие меню действий */
    function handleOpenMenu(event: React.MouseEvent<HTMLButtonElement>) {
        setMenuAnchor(event.currentTarget);
    }

    /** закрытие меню действий */
    function handleCloseMenu() {
        setMenuAnchor(null);
    }

    /** редактирование привычки */
    function handleEdit() {
        handleCloseMenu();
        onEdit?.(currentHabit);
    }

    /** удаление привычки */
    function handleDelete() {
        handleCloseMenu();
        onDelete?.(currentHabit);
    }

    return (
        <article
            className='habit_card'
            style={
                {
                    '--habit-color': currentHabit.color,
                } as React.CSSProperties
            }
        >
            <div className='habit_card_header'>
                <span className='habit_card_icon'>
                    <PathIcon path={getHabitIconPath(currentHabit.icon)} />
                </span>

                <div className='habit_card_information'>
                    <h2 className='habit_card_title'>{currentHabit.title}</h2>

                    <div className='habit_card_streak'>
                        <PathIcon path={mdiFire} />

                        <span>{getStreakLabel(streak)}</span>
                    </div>

                    {currentHabit.schedule.type === 'weekly' && (
                        <div className='habit_card_schedule'>
                            <PathIcon path={mdiCalendarMonthOutline} />

                            <span>{getScheduleLabel(currentHabit.schedule)}</span>
                        </div>
                    )}
                </div>

                <IconButton
                    className={['habit_card_menu_button', menuAnchor ? 'habit_card_menu_button_open' : ''].filter(Boolean).join(' ')}
                    aria-label={`Действия привычки ${currentHabit.title}`}
                    aria-controls={menuAnchor ? `habit_card_menu_${currentHabit.id}` : undefined}
                    aria-haspopup='menu'
                    aria-expanded={menuAnchor ? 'true' : undefined}
                    onClick={handleOpenMenu}
                >
                    <PathIcon path={mdiDotsVertical} />
                </IconButton>
            </div>

            <Menu
                id={`habit_card_menu_${currentHabit.id}`}
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleCloseMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                disableScrollLock
                slotProps={{
                    paper: {
                        className: 'habit_card_menu',
                    },
                    list: {
                        className: 'habit_card_menu_list',
                        'aria-label': `Действия привычки ${currentHabit.title}`,
                    },
                }}
            >
                <MenuItem
                    className='habit_card_menu_item'
                    onClick={handleEdit}
                >
                    <ListItemIcon>
                        <PathIcon path={mdiPencilOutline} />
                    </ListItemIcon>
                    Редактировать
                </MenuItem>

                <MenuItem
                    className='habit_card_menu_item habit_card_menu_item_delete'
                    onClick={handleDelete}
                >
                    <ListItemIcon>
                        <PathIcon path={mdiDeleteOutline} />
                    </ListItemIcon>
                    Удалить
                </MenuItem>
            </Menu>

            <div
                className='habit_card_week'
                aria-label='Выполнение за текущую неделю'
            >
                {week.map((day) => {
                    const dotClassName = [
                        'habit_card_week_dot',
                        day.completed ? 'habit_card_week_dot_completed' : '',
                        day.today ? 'habit_card_week_dot_today' : '',
                        !day.scheduled ? 'habit_card_week_dot_off' : '',
                        day.future ? 'habit_card_week_dot_future' : '',
                    ]
                        .filter(Boolean)
                        .join(' ');

                    return (
                        <div
                            key={day.key}
                            className='habit_card_week_day'
                            title={day.fullLabel}
                        >
                            <span className={dotClassName}>{day.completed && <PathIcon path={mdiCheck} />}</span>

                            <small>{day.label}</small>
                        </div>
                    );
                })}
            </div>

            <div className='habit_card_check_wrapper'>
                {completionAnimation && (
                    <span
                        className='habit_card_burst'
                        aria-hidden='true'
                    >
                        {BURST_PARTICLES.map((particle) => (
                            <span
                                key={`${particle.x}_${particle.y}`}
                                style={
                                    {
                                        '--burst-x': `${particle.x}px`,
                                        '--burst-y': `${particle.y}px`,
                                    } as React.CSSProperties
                                }
                            />
                        ))}
                    </span>
                )}

                <Button
                    className={[
                        'habit_card_check_button',
                        completedToday ? 'habit_card_check_button_completed' : '',
                        completionAnimation ? 'habit_card_check_button_pop' : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    fullWidth
                    disableElevation
                    disabled={pending}
                    aria-pressed={completedToday}
                    startIcon={
                        pending ? (
                            <CircularProgress
                                size={18}
                                thickness={5}
                                color='inherit'
                            />
                        ) : (
                            <PathIcon path={mdiCheck} />
                        )
                    }
                    onClick={handleToggle}
                >
                    {completedToday ? 'Выполнено сегодня' : scheduledToday ? 'Отметить сегодня' : 'Отметить вне расписания'}
                </Button>
            </div>

            {requestFailed && (
                <span
                    className='habit_card_error'
                    role='alert'
                >
                    Не удалось сохранить отметку
                </span>
            )}
        </article>
    );
}
