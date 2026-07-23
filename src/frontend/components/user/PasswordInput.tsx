import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
    leftIcon?: ReactNode;
};

export const PasswordInput = ({
    className = '',
    ...props
}: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative group">
            {/* 左アイコン */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors">
                {<LockKeyhole />}
            </span>

            {/* input */}
            <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full bg-highlight border-none rounded-xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-surface-tint/20 transition-all text-on-surface placeholder:text-outline/50 ${className}`}
                {...props}
            />

            {/* 右アイコン */}
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors hover:cursor-pointer"
            >
                {showPassword ? <EyeOff /> : <Eye />}
            </button>
        </div>
    );
};
