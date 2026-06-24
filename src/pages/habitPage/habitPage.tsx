import { type Habit, type NewHabit } from '@api/habits';
import AppLoader from '@components/appLoader/appLoader';
import PathIcon from '@components/pathIcon/pathIcon';
import { mdiRefresh } from '@mdi/js';
import { Alert, Button } from '@mui/material';
import { useHabitActions, useHabitsCollection } from '@providers/habitsProvider/habitsProvider';
import HabitDeleteDialog from '@pages/habitPage/dialogs/habitDeleteDialog';
import HabitDialog from '@pages/habitPage/dialogs/habitDialog';
import React from 'react';
import { useLocation } from 'react-router-dom';
import HabitList from './components/habitList';
import HabitPageHeader from './components/habitPageHeader';
import './habitPage.css';
import HabitEmptyState from './components/habitEmptyState';

type DialogState = { mode: 'create' } | { mode: 'edit'; habit: Habit } | null;

export default function HabitPage() {
    const { habits, loading, error, reload } = useHabitsCollection();
    const { createHabit, updateHabit, removeHabit } = useHabitActions();

    const location = useLocation();

    const [dialog, setDialog] = React.useState<DialogState>(null);
    const [deleteTarget, setDeleteTarget] = React.useState<Habit | null>(null);
    const [submitting, setSubmitting] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [dialogError, setDialogError] = React.useState<string | null>(null);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);

    // обновление данных при каждом открытии страницы
    React.useEffect(() => {
        if (location.pathname !== '/habits') {
            return;
        }

        reload();
    }, [location.key, location.pathname, reload]);

    function openCreate() {
        setDialogError(null);
        setDialog({ mode: 'create' });
    }

    function openEdit(habit: Habit) {
        setDialogError(null);
        setDialog({ mode: 'edit', habit });
    }

    async function handleSubmit(input: NewHabit) {
        if (!dialog) {
            return;
        }

        setSubmitting(true);
        setDialogError(null);

        try {
            if (dialog.mode === 'edit') {
                await updateHabit(dialog.habit.id, input);
            } else {
                await createHabit(input);
            }

            setDialog(null);
        } catch {
            setDialogError('Не удалось сохранить привычку');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) {
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        try {
            await removeHabit(deleteTarget.id);

            setDeleteTarget(null);
        } catch {
            setDeleteError('Не удалось удалить привычку');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <section className='habit_page'>
            <div className='habit_page_content'>
                <HabitPageHeader onCreate={openCreate} />

                <div className='habit_page_body'>
                    {loading && habits.length === 0 && (
                        <AppLoader
                            variant='section'
                            label='Загрузка привычек...'
                        />
                    )}

                    {!loading && error && habits.length === 0 && (
                        <Alert
                            className='habit_page_alert'
                            severity='error'
                            action={
                                <Button
                                    color='inherit'
                                    size='small'
                                    startIcon={<PathIcon path={mdiRefresh} />}
                                    onClick={reload}
                                >
                                    Повторить
                                </Button>
                            }
                        >
                            Не удалось загрузить привычки
                        </Alert>
                    )}

                    {!loading && !error && habits.length === 0 && <HabitEmptyState onCreate={openCreate} />}

                    {habits.length > 0 && (
                        <HabitList
                            habits={habits}
                            onEdit={openEdit}
                            onDelete={setDeleteTarget}
                        />
                    )}
                </div>
            </div>

            <HabitDialog
                open={dialog !== null}
                habit={dialog?.mode === 'edit' ? dialog.habit : null}
                submitting={submitting}
                error={dialogError}
                onSubmit={handleSubmit}
                onClose={() => setDialog(null)}
            />

            <HabitDeleteDialog
                open={deleteTarget !== null}
                habit={deleteTarget}
                deleting={deleting}
                error={deleteError}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </section>
    );
}
