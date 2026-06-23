import {
    mdiBedOutline,
    mdiBike,
    mdiBookOpenPageVariantOutline,
    mdiBrain,
    mdiBullseye,
    mdiCalendarBlankOutline,
    mdiCameraOutline,
    mdiCodeTags,
    mdiCoffeeOutline,
    mdiDumbbell,
    mdiFire,
    mdiFoodAppleOutline,
    mdiFountainPenTip,
    mdiHeartOutline,
    mdiLeafCircleOutline,
    mdiLightningBoltOutline,
    mdiMusicNote,
    mdiPaletteOutline,
    mdiPill,
    mdiRun,
    mdiSproutOutline,
    mdiStarOutline,
    mdiWalk,
    mdiWalletOutline,
    mdiWaterOutline,
    mdiWeatherNight,
    mdiWeb,
    mdiWhiteBalanceSunny,
} from '@mdi/js';

/** вариант иконки привычки */
export interface HabitIconOption {
    value: string;
    label: string;
    path: string;
}

/** доступные иконки привычек */
export const HABIT_ICONS: HabitIconOption[] = [
    {
        value: 'target',
        label: 'Цель',
        path: mdiBullseye,
    },
    {
        value: 'book',
        label: 'Чтение',
        path: mdiBookOpenPageVariantOutline,
    },
    {
        value: 'water',
        label: 'Вода',
        path: mdiWaterOutline,
    },
    {
        value: 'run',
        label: 'Бег',
        path: mdiRun,
    },
    {
        value: 'dumbbell',
        label: 'Тренировка',
        path: mdiDumbbell,
    },
    {
        value: 'leaf',
        label: 'Здоровье',
        path: mdiLeafCircleOutline,
    },
    {
        value: 'pen',
        label: 'Дневник',
        path: mdiFountainPenTip,
    },
    {
        value: 'music',
        label: 'Музыка',
        path: mdiMusicNote,
    },
    {
        value: 'coffee',
        label: 'Кофе',
        path: mdiCoffeeOutline,
    },
    {
        value: 'heart',
        label: 'Сердце',
        path: mdiHeartOutline,
    },
    {
        value: 'meditation',
        label: 'Медитация',
        path: mdiBrain,
    },
    {
        value: 'apple',
        label: 'Питание',
        path: mdiFoodAppleOutline,
    },
    {
        value: 'zap',
        label: 'Энергия',
        path: mdiLightningBoltOutline,
    },
    {
        value: 'flame',
        label: 'Огонь',
        path: mdiFire,
    },
    {
        value: 'walk',
        label: 'Ходьба',
        path: mdiWalk,
    },
    {
        value: 'bike',
        label: 'Велосипед',
        path: mdiBike,
    },
    {
        value: 'bed',
        label: 'Сон',
        path: mdiBedOutline,
    },
    {
        value: 'code',
        label: 'Программирование',
        path: mdiCodeTags,
    },
    {
        value: 'wallet',
        label: 'Финансы',
        path: mdiWalletOutline,
    },
    {
        value: 'star',
        label: 'Звезда',
        path: mdiStarOutline,
    },
    {
        value: 'photo',
        label: 'Фото',
        path: mdiCameraOutline,
    },
    {
        value: 'sprout',
        label: 'Развитие',
        path: mdiSproutOutline,
    },
    {
        value: 'palette',
        label: 'Творчество',
        path: mdiPaletteOutline,
    },
    {
        value: 'translate',
        label: 'Языки',
        path: mdiWeb,
    },
    {
        value: 'pill',
        label: 'Лекарства',
        path: mdiPill,
    },
    {
        value: 'sun',
        label: 'Утро',
        path: mdiWhiteBalanceSunny,
    },
    {
        value: 'moon',
        label: 'Вечер',
        path: mdiWeatherNight,
    },
    {
        value: 'calendar',
        label: 'Планирование',
        path: mdiCalendarBlankOutline,
    },
];

/** получение пути иконки привычки */
export function getHabitIconPath(icon: string): string {
    return HABIT_ICONS.find(({ value }) => value === icon)?.path ?? HABIT_ICONS[0].path;
}
