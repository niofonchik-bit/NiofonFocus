import { Dialog, DialogActions, DialogContent, type DialogActionsProps, type DialogContentProps, type DialogProps } from '@mui/material';
import './appDialog.css';

type AppDialogProps = DialogProps & {
    busy?: boolean;
};

/** базовая оболочка диалогового окна */
function AppDialogRoot({ busy = false, className, onClose, children, ...props }: AppDialogProps) {
    return (
        <Dialog
            {...props}
            className={['app_dialog_root', className].filter(Boolean).join(' ')}
            onClose={(event, reason) => {
                if (!busy) {
                    onClose?.(event, reason);
                }
            }}
        >
            {children}
        </Dialog>
    );
}

/** заголовок диалогового окна */
function AppDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            className={['app_dialog_header', className].filter(Boolean).join(' ')}
        />
    );
}

/** содержимое диалогового окна */
function AppDialogContent({ className, ...props }: DialogContentProps) {
    return (
        <DialogContent
            {...props}
            className={['app_dialog_content', className].filter(Boolean).join(' ')}
        />
    );
}

/** область действий диалогового окна */
function AppDialogActions({ className, ...props }: DialogActionsProps) {
    return (
        <DialogActions
            {...props}
            className={['app_dialog_actions', className].filter(Boolean).join(' ')}
        />
    );
}

const AppDialog = Object.assign(AppDialogRoot, {
    Header: AppDialogHeader,
    Content: AppDialogContent,
    Actions: AppDialogActions,
});

export default AppDialog;
