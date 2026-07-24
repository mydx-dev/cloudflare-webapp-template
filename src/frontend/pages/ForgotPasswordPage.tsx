import {
    Field,
    FieldContent,
    FieldError,
    FieldLabel,
} from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { emailRule } from '@/components/user/rules';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CircleAlert, CircleCheck, Mail, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { NavLink } from 'react-router-dom';
import { z } from 'zod';

const forgotPasswordFormSchema = z.object({
    email: emailRule,
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

const emailInputId = 'forgot-password-email';
const successMessage =
    '登録されている場合、パスワード再設定メールを送信しました。';
const fallbackErrorMessage =
    'パスワード再設定のリクエストに失敗しました。再度お試しください。';

const ResultMessage = ({
    message,
    type,
}: {
    message: string;
    type: 'error' | 'success';
}) => {
    const isError = type === 'error';

    return (
        <div
            className={`mb-6 flex items-start gap-3 rounded-lg border p-4 ${
                isError
                    ? 'border-red-100 bg-red-50 text-red-600'
                    : 'border-green-100 bg-green-50 text-green-700'
            }`}
            role={isError ? 'alert' : 'status'}
        >
            {isError ? <CircleAlert /> : <CircleCheck />}
            <p className="text-xs font-semibold leading-relaxed">{message}</p>
        </div>
    );
};

export const ForgotPasswordPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordFormSchema),
        mode: 'onChange',
    });

    const { mutate, isPending, isError, isSuccess, error } =
        useForgotPassword();
    const errorMessage =
        error instanceof Error ? error.message : fallbackErrorMessage;

    return (
        <>
            {/* Reset Password Card */}
            <section className="w-full bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-4px_rgba(0,32,69,0.08)] p-8 relative overflow-hidden">
                {/* Subtle accent top line */}
                <header className="mb-8">
                    <h2 className="font-headline font-bold text-xl text-primary mb-3">
                        パスワードの再設定
                    </h2>
                    <p className="font-body text-sm text-on-secondary-container leading-relaxed">
                        登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
                    </p>
                </header>
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit((values) => mutate(values))}
                >
                    {isSuccess && (
                        <ResultMessage
                            message={successMessage}
                            type="success"
                        />
                    )}
                    {isError && (
                        <ResultMessage message={errorMessage} type="error" />
                    )}
                    {/* Input Field Group */}
                    <Field className="space-y-2">
                        <FieldLabel
                            htmlFor={emailInputId}
                            className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1"
                            required
                        >
                            メールアドレス
                        </FieldLabel>
                        <FieldContent className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors">
                                <Mail className="w-5 h-5" />
                            </span>
                            <input
                                id={emailInputId}
                                className="w-full bg-highlight border-none rounded-xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-surface-tint/20 transition-all text-on-surface placeholder:text-outline/50"
                                placeholder="user@example.com"
                                type="email"
                                {...register('email')}
                            />
                        </FieldContent>
                        <FieldError
                            errors={errors.email ? [errors.email] : undefined}
                        />
                    </Field>
                    {/* Primary Action Button */}
                    <button
                        className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:cursor-pointer hover:bg-primary/80 enabled:active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={!isValid || isPending}
                    >
                        <span>再設定メールを送信</span>
                        {isPending ? <Spinner /> : <Send />}
                    </button>
                </form>
                {/* Navigation Links */}
                <footer className="mt-8 pt-6 border-t border-highlight text-center">
                    <NavLink
                        className="inline-flex items-center text-sm font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors group"
                        to="/sign-in"
                    >
                        <ArrowLeft />
                        <span>ログイン画面に戻る</span>
                    </NavLink>
                </footer>
            </section>
        </>
    );
};
