import type { Habit } from '@api/habits';
import PathIcon from '@components/pathIcon/pathIcon';
import { mdiDeleteOutline } from '@mdi/js';
import React from 'react';
import './habitDialog.css';

interface HabitDeleteDialogProps {
    habit: Habit;
    deleting?: boolean;
    error?: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

/** подтверждение удаления привычки */
export default function HabitDeleteDialog({ habit, deleting = false, error, onConfirm, onCancel }: HabitDeleteDialogProps) {
    React.useEffect(() => {
        function handleKey(event: KeyboardEvent) {
            if (event.key === 'Escape' && !deleting) {
                onCancel();
            }
        }

        window.addEventListener('keydown', handleKey);

        return () => window.removeEventListener('keydown', handleKey);
    }, [onCancel, deleting]);

    return (
        <div
            className='habit_dialog_overlay'
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !deleting) {
                    onCancel();
                }
            }}
        >
            <div
                className='habit_dialog habit_dialog_small'
                role='alertdialog'
                aria-modal='true'
            >
                <div className='habit_delete_head'>
                    <span className='habit_delete_icon'>
                        <PathIcon path={mdiDeleteOutline} />
                    </span>

                    <div>
                        <h2 className='habit_dialog_heading'>Удалить привычку?</h2>

                        <p className='habit_dialog_sub habit_dialog_sub_tight'>«{habit.title}» и вся история отметок будут удалены.</p>
                    </div>
                </div>

                {error && <p className='habit_dialog_hint'>{error}</p>}

                <div className='habit_dialog_actions'>
                    <button
                        type='button'
                        className='habit_dialog_button habit_dialog_button_ghost'
                        disabled={deleting}
                        onClick={onCancel}
                    >
                        Отмена
                    </button>

                    <button
                        type='button'
                        className='habit_dialog_button habit_dialog_button_danger'
                        disabled={deleting}
                        onClick={onConfirm}
                    >
                        <PathIcon path={mdiDeleteOutline} />
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
}
