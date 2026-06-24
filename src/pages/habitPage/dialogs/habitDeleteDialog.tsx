import type { Habit } from '@api/habits';
import AppDialog from '@components/appDialog/appDialog';
import { InlineLoader } from '@components/appLoader/appLoader';
import PathIcon from '@components/pathIcon/pathIcon';
import { mdiDeleteOutline } from '@mdi/js';
import { Button } from '@mui/material';
import React from 'react';
import './habitDialog.css';

interface HabitDeleteDialogProps {
    open?: boolean;
    habit: Habit;
    deleting?: boolean;
    error?: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

/** форма подтверждения удаления привычки */
export default function HabitDeleteDialog({ open, habit, deleting = false, error, onConfirm, onCancel }: HabitDeleteDialogProps) {
    const titleId = React.useId();
    const descriptionId = React.useId();

    return (
        <AppDialog
            open={open}
            busy={deleting}
            role='alertdialog'
            className='habit_delete_dialog'
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onClose={onCancel}
        >
            <AppDialog.Header>
                <div className='habit_delete_dialog_title_row'>
                    <span className='habit_delete_dialog_icon'>
                        <PathIcon path={mdiDeleteOutline} />
                    </span>

                    <h2
                        id={titleId}
                        className='habit_dialog_heading'
                    >
                        Удалить привычку?
                    </h2>
                </div>
            </AppDialog.Header>

            <AppDialog.Content>
                <p
                    id={descriptionId}
                    className='habit_delete_dialog_description'
                >
                    «{habit?.title}» и вся история отметок будут удалены. Это действие нельзя отменить.
                </p>

                {error && (
                    <p
                        className='habit_dialog_hint habit_dialog_hint_global'
                        role='alert'
                    >
                        {error}
                    </p>
                )}
            </AppDialog.Content>

            <AppDialog.Actions>
                <Button
                    type='button'
                    variant='outlined'
                    className='app_dialog_button app_dialog_button_ghost'
                    disabled={deleting}
                    onClick={onCancel}
                >
                    Отмена
                </Button>

                <Button
                    type='button'
                    variant='contained'
                    className='app_dialog_button app_dialog_button_danger'
                    disabled={deleting}
                    startIcon={deleting ? <InlineLoader /> : <PathIcon path={mdiDeleteOutline} />}
                    onClick={onConfirm}
                >
                    Удалить
                </Button>
            </AppDialog.Actions>
        </AppDialog>
    );
}
