import './dashboardHeader.css';

/** шапка дашборда */
export default function DashboardHeader() {
    return (
        <header className='dashboard_header'>
            <p className='dashboard_header_eyebrow'>Обзор</p>

            <h1 className='dashboard_header_title'>Дашборд</h1>

            <p className='dashboard_header_subtitle'>Ваш прогресс с высоты птичьего полёта</p>
        </header>
    );
}
