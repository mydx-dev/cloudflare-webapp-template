import {
    Field,
    FieldContent,
    FieldError,
    FieldLabel,
} from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { PasswordInput } from '@/components/user/PasswordInput';
import { useLoginUser } from '@/hooks/useLoginUser';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { emailRule } from '../components/user/rules';
import { authClient } from '../lib/authClient';

const loginFormSchema = z.object({
    email: emailRule,
    password: z.string().min(1, 'パスワードを入力してください'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const isSignUpEnabled = import.meta.env.VITE_SIGN_UP_ENABLED === 'true';
const emailInputId = 'login-email';
const passwordInputId = 'login-password';
const fallbackLoginErrorMessage =
    'ログインに失敗しました。再度お試しください。';
const sessionRefreshFailedMessage =
    'ログイン状態を確認できませんでした。再度ログインしてください。';

const getFormErrorMessage = (
    submitErrorMessage: string | null,
    isError: boolean,
    error: unknown
) => {
    if (submitErrorMessage) {
        return submitErrorMessage;
    }

    if (!isError) {
        return null;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallbackLoginErrorMessage;
};

const refetchAndGetSession = async (refetch: () => Promise<void>) => {
    await refetch();
    const refreshedSession = await authClient.getSession();

    if (
        refreshedSession.error ||
        !refreshedSession.data?.session ||
        !refreshedSession.data?.user
    ) {
        throw new Error(sessionRefreshFailedMessage);
    }
};

const FormErrorMessage = ({ message }: { message: string }) => {
    return (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600">
            <CircleAlert />
            <p className="text-center text-xs font-semibold leading-relaxed">
                {message}
            </p>
        </div>
    );
};

const SignUpLink = () => {
    if (!isSignUpEnabled) {
        return null;
    }

    return (
        <section className="mt-8 text-center px-4">
            <p className="text-on-surface-variant text-sm mb-4">
                アカウントをお持ちでないですか？
            </p>
            <NavLink
                className="block w-full border border-primary text-primary font-bold py-3 rounded-md hover:bg-primary hover:text-on-primary transition-colors duration-200 text-center"
                to="/sign-up"
            >
                新規登録
            </NavLink>
        </section>
    );
};

export const LoginPage = () => {
    const navigate = useNavigate();
    const session = authClient.useSession();
    const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
        null
    );
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        mode: 'onChange',
    });

    const { mutateAsync, isPending, isError, error } = useLoginUser();

    const onSubmit = async (values: LoginFormValues) => {
        try {
            setSubmitErrorMessage(null);
            await mutateAsync(values);
            await refetchAndGetSession(session.refetch);
            navigate('/', { replace: true });
        } catch (caughtError) {
            setSubmitErrorMessage(
                caughtError instanceof Error
                    ? caughtError.message
                    : fallbackLoginErrorMessage
            );
        }
    };

    const formErrorMessage = getFormErrorMessage(
        submitErrorMessage,
        isError,
        error
    );

    if (session.isPending) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (session.data) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <section className="rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(0,32,69,0.08)] relative overflow-hidden">
                {/* Decorative Subtle Accent */}

                <div className="relative z-10">
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        {formErrorMessage && (
                            <FormErrorMessage message={formErrorMessage} />
                        )}

                        {/* Email Field */}
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
                                errors={
                                    errors.email ? [errors.email] : undefined
                                }
                            />
                        </Field>
                        {/* Password Field */}
                        <Field className="space-y-2">
                            <div className="flex justify-between items-end px-1">
                                <FieldLabel
                                    htmlFor={passwordInputId}
                                    className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                                    required
                                >
                                    パスワード
                                </FieldLabel>
                                <NavLink
                                    className="text-xs font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors"
                                    to="/forgot-password"
                                >
                                    パスワードを忘れた場合
                                </NavLink>
                            </div>
                            <FieldContent>
                                <PasswordInput
                                    id={passwordInputId}
                                    placeholder="••••••••"
                                    {...register('password')}
                                />
                            </FieldContent>
                            <FieldError
                                errors={
                                    errors.password
                                        ? [errors.password]
                                        : undefined
                                }
                            />
                        </Field>
                        {/* Login Button */}
                        <button
                            className="w-full bg-primary text-on-primary font-bold py-4 rounded-md shadow-lg active:scale-[0.98] transition-transform duration-150 disabled:opacity-50 disabled:pointer-events-none hover:bg-primary/90 hover:cursor-pointer flex items-center justify-center gap-2"
                            type="submit"
                            disabled={!isValid || isPending}
                        >
                            ログイン
                            {isPending && <Spinner />}
                        </button>
                    </form>
                </div>
            </section>
            {/* Secondary CTA */}
            <SignUpLink />
        </>
    );
};
