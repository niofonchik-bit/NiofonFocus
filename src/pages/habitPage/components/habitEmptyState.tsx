import PathIcon from '@components/pathIcon/pathIcon';
import { mdiCheckAll } from '@mdi/js';
import { Button } from '@mui/material';

export default function HabitEmptyState({ onCreate }: { onCreate: () => void }) {
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
