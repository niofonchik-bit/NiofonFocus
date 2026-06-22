import { SvgIcon, type SvgIconProps } from '@mui/material';

type PathIconProps = Omit<SvgIconProps, 'children'> & {
    path: string;
};

export default function PathIcon({ path, ...props }: PathIconProps) {
    return (
        <SvgIcon {...props}>
            <path d={path} />
        </SvgIcon>
    );
}
