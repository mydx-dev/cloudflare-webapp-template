import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
    leftIcon?: ReactNode;
};

export const PasswordInput = ({
    className = '',
    leftIcon,
    ...props
}: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative group">
            {/* 左アイコン */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors">
                {leftIcon ?? ''}
            </span>

            {/* input */}
            <Input
                {...props}
                className={cn(leftIcon ? 'pl-12' : '', className)}
                type={showPassword ? 'text' : 'password'}
            />

            {/* 右アイコン */}
            <button
                type="button"
                aria-label={
                    showPassword ? 'パスワードを隠す' : 'パスワードを表示'
                }
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors hover:cursor-pointer"
            >
                {showPassword ? <EyeOff /> : <Eye />}
            </button>
        </div>
    );
};
