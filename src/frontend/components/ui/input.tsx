import { Input as InputPrimitive } from '@base-ui/react/input';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <InputPrimitive
            type={type}
            data-slot="input"
            className={cn(
                'w-full bg-highlight border border-input rounded-xl py-4 pl-4 pr-12 focus:ring-2 focus:ring-surface-tint/20 transition-all text-on-surface placeholder:text-outline/50',
                className
            )}
            {...props}
        />
    );
}

export { Input };
