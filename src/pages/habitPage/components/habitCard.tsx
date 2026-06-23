import { type Habit } from '@api/habits';
import PathIcon from '@components/pathIcon/pathIcon';
import { getHabitIconPath } from '@constants/habitIcons';
import { clearCelebration, playCelebration } from '@effects/celebration/celebration';
import '@effects/celebration/celebration.css';
import { mdiCheck, mdiDeleteOutline, mdiDotsVertical, mdiFire, mdiPencilOutline } from '@mdi/js';
import { Button, CircularProgress, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useHabitActions } from '@providers/habitsProvider/habitsProvider';
import { getCurrentStreak, getDateKey, getHabitWeek, getStreakLabel, isHabitScheduled } from '@scripts/utilities';
import React from 'react';

interface HabitCardProps {
    habit: Habit;
    onEdit?: (habit: Habit) => void;
    onDelete?: (habit: Habit) => void;
}

const POP_ANIMATION_MS = 1000;

/** карточка привычки */
export default function HabitCard({ habit, onEdit, onDelete }: HabitCardProps) {
    const { toggleCompletion } = useHabitActions();

    const [pending, setPending] = React.useState(false);
    const [requestFailed, setRequestFailed] = React.useState(false);
    const [completionAnimation, setCompletionAnimation] = React.useState(false);
    const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);

    const animationTimerRef = React.useRef<number | null>(null);
    const effectsLayerRef = React.useRef<HTMLSpanElement | null>(null);

    const currentDate = new Date();
    const todayKey = getDateKey(currentDate);
    const completedToday = habit.completions.includes(todayKey);
    const scheduledToday = isHabitScheduled(habit, currentDate);
    const streak = getCurrentStreak(habit);
    const week = getHabitWeek(habit, currentDate);

    React.useEffect(() => {
        return () => {
            if (animationTimerRef.current !== null) {
                window.clearTimeout(animationTimerRef.current);
            }
        };
    }, []);

    /** запуск анимации выполнения */
    function startCompletionAnimation() {
        if (animationTimerRef.current !== null) {
            window.clearTimeout(animationTimerRef.current);
        }

        setCompletionAnimation(true);
        playCelebration(effectsLayerRef.current);

        animationTimerRef.current = window.setTimeout(() => {
            setCompletionAnimation(false);
            animationTimerRef.current = null;
        }, POP_ANIMATION_MS);
    }

    /** переключение отметки привычки */
    async function handleToggle() {
        if (pending) {
            return;
        }

        const nextCompleted = !completedToday;

        setPending(true);
        setRequestFailed(false);

        if (nextCompleted) {
            startCompletionAnimation();
        } else {
            setCompletionAnimation(false);
        }

        try {
            const saved = await toggleCompletion(habit.id, todayKey);

            // сервер не подтвердил выполнение — снимаем анимацию
            if (!saved) {
                setCompletionAnimation(false);
                clearCelebration(effectsLayerRef.current);
            }
        } catch {
            setCompletionAnimation(false);
            clearCelebration(effectsLayerRef.current);
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
        onEdit?.(habit);
    }

    /** удаление привычки */
    function handleDelete() {
        handleCloseMenu();
        onDelete?.(habit);
    }

    return (
        <article
            className='habit_card'
            style={{ '--habit-color': habit.color, '--celebration-color': habit.color } as React.CSSProperties}
        >
            <span
                ref={effectsLayerRef}
                className='habit_card_effects'
                aria-hidden='true'
            />

            <div className='habit_card_header'>
                <span className='habit_card_icon'>
                    <PathIcon path={getHabitIconPath(habit.icon)} />
                </span>

                <div className='habit_card_information'>
                    <h2 className='habit_card_title'>{habit.title}</h2>

                    <div className='habit_card_streak'>
                        <PathIcon path={mdiFire} />

                        <span>{getStreakLabel(streak)}</span>
                    </div>
                </div>

                <IconButton
                    className={['habit_card_menu_button', menuAnchor ? 'habit_card_menu_button_open' : ''].filter(Boolean).join(' ')}
                    aria-label={`Действия привычки ${habit.title}`}
                    aria-controls={menuAnchor ? `habit_card_menu_${habit.id}` : undefined}
                    aria-haspopup='menu'
                    aria-expanded={menuAnchor ? 'true' : undefined}
                    onClick={handleOpenMenu}
                >
                    <PathIcon path={mdiDotsVertical} />
                </IconButton>
            </div>

            <Menu
                id={`habit_card_menu_${habit.id}`}
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
                        'aria-label': `Действия привычки ${habit.title}`,
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
