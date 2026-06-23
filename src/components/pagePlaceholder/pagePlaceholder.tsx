import PathIcon from '@components/pathIcon/pathIcon';
import './pagePlaceholder.css';

interface PagePlaceholderProps {
    title: string;
    description: string;
    iconPath: string;
    action?: React.ReactNode;
}

/** заглушка раздела приложения */
export default function PagePlaceholder({ title, description, iconPath, action }: PagePlaceholderProps) {
    return (
        <section className='page_placeholder'>
            <div className='page_placeholder_content'>
                <div className='page_placeholder_card'>
                    <span
                        className='page_placeholder_decoration page_placeholder_decoration_one'
                        aria-hidden='true'
                    />

                    <span
                        className='page_placeholder_decoration page_placeholder_decoration_two'
                        aria-hidden='true'
                    />

                    <div className='page_placeholder_status'>
                        <span aria-hidden='true' />В разработке
                    </div>

                    <div className='page_placeholder_icon'>
                        <span className='page_placeholder_icon_ring' />

                        <PathIcon path={iconPath} />
                    </div>

                    <h1>{title}</h1>

                    <p>{description}</p>

                    {action && <div className='page_placeholder_action'>{action}</div>}
                </div>
            </div>
        </section>
    );
}
