import { getHabits, type Habit } from '@api/habits';
import { useAuth } from '@providers/authProvider/authProvider';
import { getHabitStatistics, type HabitStatistics } from '@root/scripts/utilities';
import React from 'react';

interface HabitsProviderProps {
    children: React.ReactNode;
}

/** состояние коллекции привычек */
interface HabitsCollectionState {
    loading: boolean;
    error: Error | null;
    revision: number;
}

/** действия с привычками */
interface HabitsActions {
    getHabits: () => Habit[];
    updateCompletion: (habitId: string, date: string, completed: boolean) => void;
    reload: () => void;
}

/** пустая статистика привычек */
const EMPTY_STATISTICS: HabitStatistics = {
    totalCount: 0,
    completedTodayCount: 0,
    longestStreak: 0,
};

const HabitsCollectionContext = React.createContext<HabitsCollectionState | null>(null);

const HabitsStatisticsContext = React.createContext<HabitStatistics | null>(null);

const HabitsActionsContext = React.createContext<HabitsActions | null>(null);

/** провайдер привычек */
export default function HabitsProvider({ children }: HabitsProviderProps) {
    const { session } = useAuth();

    /** актуальный список без подписки карточек на его изменение */
    const habitsRef = React.useRef<Habit[]>([]);

    /** состояние активного запроса без зависимости от рендера */
    const loadingRef = React.useRef(true);

    const [collectionState, setCollectionState] = React.useState<HabitsCollectionState>({
        loading: true,
        error: null,
        revision: 0,
    });

    const [statistics, setStatistics] = React.useState<HabitStatistics>(EMPTY_STATISTICS);

    const [reloadVersion, setReloadVersion] = React.useState(0);

    const userId = session?.user.id;

    /**
     * объект действий создаётся один раз.
     * карточки подписываются только на него, а не на статистику
     */
    const [actions] = React.useState<HabitsActions>(() => ({
        getHabits: () => habitsRef.current,

        updateCompletion: (habitId, date, completed) => {
            const habit = habitsRef.current.find((currentHabit) => currentHabit.id === habitId);

            if (!habit) {
                return;
            }

            const currentlyCompleted = habit.completions.includes(date);

            if (currentlyCompleted === completed) {
                return;
            }

            habitsRef.current = habitsRef.current.map((currentHabit) => {
                if (currentHabit.id !== habitId) {
                    return currentHabit;
                }

                return {
                    ...currentHabit,
                    completions: completed
                        ? [...currentHabit.completions, date]
                        : currentHabit.completions.filter((completionDate) => completionDate !== date),
                };
            });

            setStatistics(getHabitStatistics(habitsRef.current));
        },

        reload: () => {
            if (loadingRef.current) {
                return;
            }

            loadingRef.current = true;

            setCollectionState((currentState) => ({
                ...currentState,
                loading: true,
                error: null,
            }));

            setReloadVersion((currentVersion) => currentVersion + 1);
        },
    }));

    // загрузка привычек пользователя
    React.useEffect(() => {
        let active = true;

        if (!userId) {
            habitsRef.current = [];
            loadingRef.current = false;

            setStatistics(EMPTY_STATISTICS);

            setCollectionState((currentState) => ({
                loading: false,
                error: null,
                revision: currentState.revision + 1,
            }));

            return;
        }

        loadingRef.current = true;

        setCollectionState((currentState) => ({
            ...currentState,
            loading: true,
            error: null,
        }));

        void getHabits(userId)
            .then((loadedHabits) => {
                if (!active) {
                    return;
                }

                habitsRef.current = loadedHabits;

                setStatistics(getHabitStatistics(loadedHabits));

                setCollectionState((currentState) => ({
                    loading: false,
                    error: null,
                    revision: currentState.revision + 1,
                }));
            })
            .catch((requestError: unknown) => {
                if (!active) {
                    return;
                }

                habitsRef.current = [];
                setStatistics(EMPTY_STATISTICS);

                setCollectionState((currentState) => ({
                    loading: false,
                    error: requestError instanceof Error ? requestError : new Error('Не удалось загрузить привычки'),
                    revision: currentState.revision + 1,
                }));
            })
            .finally(() => {
                if (!active) {
                    return;
                }

                loadingRef.current = false;
            });

        return () => {
            active = false;
        };
    }, [userId, reloadVersion]);

    return (
        <HabitsActionsContext.Provider value={actions}>
            <HabitsStatisticsContext.Provider value={statistics}>
                <HabitsCollectionContext.Provider value={collectionState}>{children}</HabitsCollectionContext.Provider>
            </HabitsStatisticsContext.Provider>
        </HabitsActionsContext.Provider>
    );
}

/** доступ к коллекции привычек */
export function useHabitsCollection() {
    const collectionState = React.useContext(HabitsCollectionContext);

    const actions = React.useContext(HabitsActionsContext);

    if (!collectionState || !actions) {
        throw new Error('useHabitsCollection должен использоваться внутри HabitsProvider');
    }

    return {
        habits: actions.getHabits(),
        loading: collectionState.loading,
        error: collectionState.error,
        revision: collectionState.revision,
        reload: actions.reload,
    };
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
