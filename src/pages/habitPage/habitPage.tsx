import { type Habit, type NewHabit } from '@api/habits';
import AppLoader from '@components/appLoader/appLoader';
import PathIcon from '@components/pathIcon/pathIcon';
import { mdiCheckAll, mdiRefresh } from '@mdi/js';
import { Alert, Button } from '@mui/material';
import { useHabitActions, useHabitsCollection } from '@providers/habitsProvider/habitsProvider';
import HabitDeleteDialog from '@root/dialogs/habitDialog/habitDeleteDialog';
import HabitDialog from '@root/dialogs/habitDialog/habitDialog';
import React from 'react';
import { useLocation } from 'react-router-dom';
import HabitList from './components/habitList';
import HabitPageHeader from './components/habitPageHeader';
import './habitPage.css';

type DialogState = { mode: 'create' } | { mode: 'edit'; habit: Habit } | null;

function HabitEmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className='habit_page_empty'>
            <span className='habit_page_empty_icon'>
                <PathIcon path={mdiCheckAll} />
            </span>

            <h2>Пока ни одной привычки</h2>

            <p>Начните с малого — добавьте первую привычку и отмечайте её каждый день, не разрывая цепочку.</p>

            <Button
                variant='contained'
                disableElevation
                onClick={onCreate}
            >
                Создать первую привычку
            </Button>
        </div>
    );
}

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
                    {loading && (
                        <AppLoader
                            variant='section'
                            label='Загрузка привычек...'
                        />
                    )}

                    {!loading && error && (
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

                    {!loading && !error && habits.length > 0 && (
                        <HabitList
                            habits={habits}
                            onEdit={openEdit}
                            onDelete={setDeleteTarget}
                        />
                    )}
                </div>
            </div>

            {dialog && (
                <HabitDialog
                    habit={dialog.mode === 'edit' ? dialog.habit : null}
                    submitting={submitting}
                    error={dialogError}
                    onSubmit={handleSubmit}
                    onClose={() => setDialog(null)}
                />
            )}

            {deleteTarget && (
                <HabitDeleteDialog
                    habit={deleteTarget}
                    deleting={deleting}
                    error={deleteError}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </section>
    );
}
