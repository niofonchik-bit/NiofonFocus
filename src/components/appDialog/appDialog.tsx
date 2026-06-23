import { Dialog, DialogActions, DialogContent, Grow, type DialogActionsProps, type DialogContentProps, type DialogProps } from '@mui/material';
import './appDialog.css';
import React from 'react';
import type { TransitionProps } from '@mui/material/transitions';

type AppDialogProps = DialogProps & {
    busy?: boolean;
};

const AppDialogTransition = React.forwardRef(function AppDialogTransition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>,
) {
    return (
        <Grow
            ref={ref}
            timeout={{ enter: 300, exit: 200 }}
            {...props}
        />
    );
});

/** базовая оболочка диалогового окна */
function AppDialogRoot({ busy = false, className, onClose, children, ...props }: AppDialogProps) {
    return (
        <Dialog
            {...props}
            slots={{ transition: AppDialogTransition }}
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
