import AnimatedOutlet from '@components/animatedOutlet/animatedOutlet';
import './mainPage.css';
import MainMenu from '@components/mainMenu/mainMenu';

/** основная страница приложения */
export default function MainPage() {
    return (
        <div className='main_page'>
            <MainMenu />

            <main className='main_page_content'>
                <AnimatedOutlet />
            </main>
        </div>
    );
}
