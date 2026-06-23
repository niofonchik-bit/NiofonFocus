import type { Habit } from '@api/habits';
import HabitCard from './habitCard';

interface HabitListProps {
    habits: Habit[];
    onEdit?: (habit: Habit) => void;
    onDelete?: (habit: Habit) => void;
}

/** список привычек */
export default function HabitList({ habits, onEdit, onDelete }: HabitListProps) {
    return (
        <div className='habit_page_grid'>
            {habits.map((habit) => (
                <HabitCard
                    key={habit.id}
                    habit={habit}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
