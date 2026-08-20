import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { ErrorResolution } from '@/viewModel/ErrorResolution';
import { AlertCircleIcon } from 'lucide-react';
import { toast } from './toast';

type ErrorResolutionAlertProps = {
    errorResolution: ErrorResolution;
    type?: 'alert' | 'toast';
};

export const ErrorResolutionAlert = ({
    errorResolution,
    type = 'alert',
}: ErrorResolutionAlertProps) => {
    if (type === 'alert') {
        return (
            <Alert variant="destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>{errorResolution.problem}</AlertTitle>
                <AlertDescription>
                    {errorResolution.resolution}
                </AlertDescription>
                {errorResolution.action && (
                    <AlertAction>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={errorResolution.action.execute}
                        >
                            {errorResolution.action.label}
                        </Button>
                    </AlertAction>
                )}
            </Alert>
        );
    }

    if (type === 'toast') {
        const toastId = toast.add({
            title: errorResolution.problem,
            description: errorResolution.resolution,
            type: 'error',
            actionProps: {
                children: errorResolution.action
                    ? errorResolution.action.label
                    : 'OK',
                onClick: () => {
                    if (errorResolution.action) {
                        errorResolution.action.execute();
                    }
                    toast.close(toastId);
                },
            },
        });
    }
    return null;
};
