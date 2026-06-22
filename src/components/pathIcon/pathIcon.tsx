import { SvgIcon, type SvgIconProps } from '@mui/material';

/** свойства иконки пути */
type PathIconProps = Omit<SvgIconProps, 'children'> & {
    path: string;
};

/** иконка из svg-пути */
export default function PathIcon({ path, ...props }: PathIconProps) {
    return (
        <SvgIcon {...props}>
            <path d={path} />
        </SvgIcon>
    );
}
