import {
    createHabit as createHabitRequest,
    deleteHabit as deleteHabitRequest,
    getHabits,
    toggleCompletion as toggleCompletionRequest,
    updateHabit as updateHabitRequest,
    type Habit,
    type HabitPatch,
    type NewHabit,
} from '@api/habits';
import { useAuth } from '@providers/authProvider/authProvider';
import { getHabitStatistics, type HabitStatistics } from '@root/scripts/utilities';
import React from 'react';

interface HabitsProviderProps {
    children: React.ReactNode;
}

/** состояние коллекции привычек */
interface HabitsCollectionState {
    habits: Habit[];
    loading: boolean;
    error: Error | null;
    reload: () => void;
}

/** действия с привычками */
interface HabitsActions {
    toggleCompletion: (habitId: string, date: string) => Promise<boolean>;
    createHabit: (input: NewHabit) => Promise<Habit>;
    updateHabit: (habitId: string, patch: HabitPatch) => Promise<Habit>;
    removeHabit: (habitId: string) => Promise<void>;
}

const EMPTY_STATISTICS: HabitStatistics = {
    totalCount: 0,
    completedTodayCount: 0,
    longestStreak: 0,
};

const HabitsCollectionContext = React.createContext<HabitsCollectionState | null>(null);
const HabitsStatisticsContext = React.createContext<HabitStatistics | null>(null);
const HabitsActionsContext = React.createContext<HabitsActions | null>(null);

/** установка отметки привычки на дату (без мутации) */
function setHabitCompletion(habit: Habit, date: string, completed: boolean): Habit {
    const has = habit.completions.includes(date);

    if (has === completed) {
        return habit;
    }

    return {
        ...habit,
        completions: completed ? [...habit.completions, date] : habit.completions.filter((value) => value !== date),
    };
}

/** провайдер привычек */
export default function HabitsProvider({ children }: HabitsProviderProps) {
    const { session } = useAuth();
    const userId = session?.user.id;

    const [habits, setHabits] = React.useState<Habit[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);
    const [reloadVersion, setReloadVersion] = React.useState(0);

    /** актуальный список для чтения внутри действий без гонок */
    const habitsRef = React.useRef<Habit[]>([]);

    React.useEffect(() => {
        habitsRef.current = habits;
    }, [habits]);

    // загрузка привычек пользователя
    React.useEffect(() => {
        let active = true;

        if (!userId) {
            setHabits([]);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        void getHabits(userId)
            .then((loaded) => {
                if (active) {
                    setHabits(loaded);
                }
            })
            .catch((requestError: unknown) => {
                if (!active) return;

                setHabits([]);
                setError(requestError instanceof Error ? requestError : new Error('Не удалось загрузить привычки'));
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [userId, reloadVersion]);

    const reload = React.useCallback(() => {
        setReloadVersion((version) => version + 1);
    }, []);

    const collection = React.useMemo<HabitsCollectionState>(() => ({ habits, loading, error, reload }), [habits, loading, error, reload]);

    const statistics = React.useMemo(() => (habits.length ? getHabitStatistics(habits) : EMPTY_STATISTICS), [habits]);

    const actions = React.useMemo<HabitsActions>(
        () => ({
            toggleCompletion: async (habitId, date) => {
                const current = habitsRef.current.find((habit) => habit.id === habitId);

                if (!current) {
                    return false;
                }

                const nextCompleted = !current.completions.includes(date);

                // оптимистичное изменение
                setHabits((previous) => previous.map((habit) => (habit.id === habitId ? setHabitCompletion(habit, date, nextCompleted) : habit)));

                try {
                    const saved = await toggleCompletionRequest(habitId, date);

                    // приведение к серверной правде, если разошлось
                    if (saved !== nextCompleted) {
                        setHabits((previous) => previous.map((habit) => (habit.id === habitId ? setHabitCompletion(habit, date, saved) : habit)));
                    }

                    return saved;
                } catch (requestError) {
                    // откат оптимистичного изменения
                    setHabits((previous) =>
                        previous.map((habit) => (habit.id === habitId ? setHabitCompletion(habit, date, !nextCompleted) : habit)),
                    );

                    throw requestError;
                }
            },

            createHabit: async (input) => {
                if (!userId) {
                    throw new Error('Пользователь не авторизован');
                }

                const created = await createHabitRequest(userId, input);

                setHabits((previous) => [created, ...previous]);

                return created;
            },

            updateHabit: async (habitId, patch) => {
                const updated = await updateHabitRequest(habitId, patch);

                setHabits((previous) => previous.map((habit) => (habit.id === habitId ? updated : habit)));

                return updated;
            },

            removeHabit: async (habitId) => {
                await deleteHabitRequest(habitId);

                setHabits((previous) => previous.filter((habit) => habit.id !== habitId));
            },
        }),
        [userId],
    );

    return (
        <HabitsActionsContext.Provider value={actions}>
            <HabitsStatisticsContext.Provider value={statistics}>
                <HabitsCollectionContext.Provider value={collection}>{children}</HabitsCollectionContext.Provider>
            </HabitsStatisticsContext.Provider>
        </HabitsActionsContext.Provider>
    );
}

/** доступ к коллекции привычек */
export function useHabitsCollection() {
    const context = React.useContext(HabitsCollectionContext);

    if (!context) {
        throw new Error('useHabitsCollection должен использоваться внутри HabitsProvider');
    }

    return context;
}

/** доступ к статистике привычек */
export function useHabitStatistics() {
    const statistics = React.useContext(HabitsStatisticsContext);

    if (!statistics) {
        throw new Error('useHabitStatistics должен использоваться внутри HabitsProvider');
    }

    return statistics;
}

/** доступ к действиям привычек */
export function useHabitActions() {
    const actions = React.useContext(HabitsActionsContext);

    if (!actions) {
        throw new Error('useHabitActions должен использоваться внутри HabitsProvider');
    }

    return actions;
}
