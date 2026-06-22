import { supabase } from '@root/lib/supabase';
import type { Tables, TablesUpdate } from '@app_types/database.types';

export interface HabitSchedule {
    type: 'daily' | 'weekly';
    days: number[];
}

export interface Habit {
    id: string;
    title: string;
    color: string;
    icon: string;
    schedule: HabitSchedule;
    createdAt: string;
    completions: string[];
}

export interface NewHabit {
    title: string;
    color: string;
    icon: string;
    schedule: HabitSchedule;
}

export interface HabitPatch {
    title?: string;
    color?: string;
    icon?: string;
    schedule?: HabitSchedule;
}

const SELECT = 'id, title, color, icon, schedule_type, schedule_days, created_at, habit_completions(completed_on)';

type HabitRow = Pick<Tables<'habits'>, 'id' | 'title' | 'color' | 'icon' | 'schedule_type' | 'schedule_days' | 'created_at'> & {
    habit_completions: Pick<Tables<'habit_completions'>, 'completed_on'>[];
};

function toHabit(row: HabitRow): Habit {
    return {
        id: row.id,
        title: row.title,
        color: row.color,
        icon: row.icon,
        schedule: {
            type: row.schedule_type === 'weekly' ? 'weekly' : 'daily',
            days: row.schedule_days ?? [],
        },
        createdAt: row.created_at.slice(0, 10),
        completions: (row.habit_completions ?? []).map((c) => c.completed_on),
    };
}

function scheduleToColumns(schedule: HabitSchedule) {
    return {
        schedule_type: schedule.type,
        schedule_days: schedule.type === 'weekly' ? schedule.days : [],
    };
}

export async function getHabits(userId: string): Promise<Habit[]> {
    const { data, error } = await supabase.from('habits').select(SELECT).eq('user_id', userId).order('created_at', { ascending: false });

    if (error) throw error;
    return (data as HabitRow[]).map(toHabit);
}

export async function createHabit(userId: string, input: NewHabit): Promise<Habit> {
    const { data, error } = await supabase
        .from('habits')
        .insert({
            user_id: userId,
            title: input.title,
            color: input.color,
            icon: input.icon,
            ...scheduleToColumns(input.schedule),
        })
        .select(SELECT)
        .single();

    if (error) throw error;
    return toHabit(data as HabitRow);
}

export async function updateHabit(habitId: string, patch: HabitPatch): Promise<Habit> {
    const changes: TablesUpdate<'habits'> = {};
    if (patch.title !== undefined) changes.title = patch.title;
    if (patch.color !== undefined) changes.color = patch.color;
    if (patch.icon !== undefined) changes.icon = patch.icon;
    if (patch.schedule !== undefined) Object.assign(changes, scheduleToColumns(patch.schedule));

    const { data, error } = await supabase.from('habits').update(changes).eq('id', habitId).select(SELECT).single();

    if (error) throw error;
    return toHabit(data as HabitRow);
}

export async function deleteHabit(habitId: string): Promise<void> {
    const { error } = await supabase.from('habits').delete().eq('id', habitId);
    if (error) throw error;
}

export async function toggleCompletion(habitId: string, date: string): Promise<boolean> {
    const { data: existing, error: selectError } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('habit_id', habitId)
        .eq('completed_on', date)
        .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
        const { error } = await supabase.from('habit_completions').delete().eq('habit_id', habitId).eq('completed_on', date);
        if (error) throw error;
        return false;
    }

    const { error } = await supabase.from('habit_completions').insert({ habit_id: habitId, completed_on: date });
    if (error) throw error;
    return true;
}