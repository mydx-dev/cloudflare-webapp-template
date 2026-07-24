import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { PasswordInput } from '@/components/user/PasswordInput';
import { emailRule, passwordRule } from '@/components/user/rules';
import { useSignupUser } from '@/hooks/useSignupUser';
import { isPublicSignUpEnabled } from '@/lib/signUpConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, CircleAlert, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const signupFormSchema = z
    .object({
        name: z.string().min(1, '名前は必須です'),
        email: emailRule,
        password: passwordRule,
        confirmPassword: z.string(),
    })
    .required()
    .refine((data) => data.password === data.confirmPassword, {
        message: 'パスワードと確認用パスワードが一致しません',
        path: ['confirmPassword'],
    });

type SignupFormValues = z.infer<typeof signupFormSchema>;

const nameInputId = 'signup-name';
const emailInputId = 'signup-email';
const passwordInputId = 'signup-password';
const confirmPasswordInputId = 'signup-confirm-password';
const fallbackErrorMessage = 'ユーザー登録に失敗しました。再度お試しください。';
const disabledMessage =
    '現在、新規ユーザー登録は受け付けていません。管理者から招待されたアカウントでログインしてください。';

const FormErrorMessage = ({ message }: { message: string }) => {
    return (
        <div
            className="mb-6 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4 text-red-600"
            role="alert"
        >
            <CircleAlert />
            <p className="text-xs font-semibold leading-relaxed">{message}</p>
        </div>
    );
};

const DisabledSignUpMessage = () => {
    return (
        <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(0,32,69,0.08)] relative overflow-hidden">
            <FormErrorMessage message={disabledMessage} />
            <NavLink
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                to="/sign-in"
            >
                <ArrowLeft />
                ログイン画面に戻る
            </NavLink>
        </section>
    );
};

const getSignupErrorMessage = (
    submitErrorMessage: string | null,
    error: unknown
) => {
    if (submitErrorMessage) {
        return submitErrorMessage;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallbackErrorMessage;
};

const getCaughtErrorMessage = (error: unknown) => {
    return error instanceof Error ? error.message : fallbackErrorMessage;
};

const SubmitIcon = ({ isPending }: { isPending: boolean }) => {
    if (isPending) {
        return <Spinner />;
    }

    return <ArrowRight className="h-5 w-5" />;
};

export const SignupPage = () => {
    const navigate = useNavigate();
    const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
        null
    );
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupFormSchema),
        mode: 'onChange',
    });
    const { mutateAsync, isPending, isError, error } = useSignupUser();
    const errorMessage = getSignupErrorMessage(submitErrorMessage, error);

    const onSubmit = async ({ name, email, password }: SignupFormValues) => {
        try {
            setSubmitErrorMessage(null);
            await mutateAsync({ name, email, password });
            navigate('/', { replace: true });
        } catch (caughtError) {
            setSubmitErrorMessage(getCaughtErrorMessage(caughtError));
        }
    };

    if (!isPublicSignUpEnabled()) {
        return <DisabledSignUpMessage />;
    }

    return (
        <>
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(0,32,69,0.08)] relative overflow-hidden">
                <header className="mb-8">
                    <h2 className="font-headline font-bold text-xl text-primary mb-3">
                        新規登録
                    </h2>
                    <p className="font-body text-sm text-on-secondary-container leading-relaxed">
                        アカウント情報を入力してください。
                    </p>
                </header>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {isError && <FormErrorMessage message={errorMessage} />}
                    <FieldGroup>
                        <Field className="space-y-2">
                            <FieldLabel
                                htmlFor={nameInputId}
                                className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1"
                                required
                            >
                                名前
                            </FieldLabel>
                            <FieldContent className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors">
                                    <User className="h-5 w-5" />
                                </span>
                                <input
                                    id={nameInputId}
                                    className="w-full bg-highlight border-none rounded-xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-surface-tint/20 transition-all text-on-surface placeholder:text-outline/50"
                                    placeholder="山田 太郎"
                                    type="text"
                                    {...register('name')}
                                />
                            </FieldContent>
                            <FieldError
                                errors={errors.name ? [errors.name] : undefined}
                            />
                        </Field>
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
                                    <Mail className="h-5 w-5" />
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
                        <Field className="space-y-2">
                            <FieldLabel
                                htmlFor={passwordInputId}
                                className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1"
                                required
                            >
                                パスワード
                            </FieldLabel>
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
                        <Field className="space-y-2">
                            <FieldLabel
                                htmlFor={confirmPasswordInputId}
                                className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1"
                                required
                            >
                                パスワードの確認
                            </FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    id={confirmPasswordInputId}
                                    placeholder="••••••••"
                                    {...register('confirmPassword')}
                                />
                            </FieldContent>
                            <FieldError
                                errors={
                                    errors.confirmPassword
                                        ? [errors.confirmPassword]
                                        : undefined
                                }
                            />
                        </Field>
                    </FieldGroup>
                    <button
                        className="w-full bg-primary text-on-primary font-bold py-4 rounded-md shadow-lg enabled:active:scale-[0.98] transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        type="submit"
                        disabled={isPending || !isValid}
                    >
                        <span>新規登録</span>
                        <SubmitIcon isPending={isPending} />
                    </button>
                </form>
            </section>
            <section className="mt-8 text-center px-4">
                <p className="text-on-surface-variant text-sm mb-4">
                    すでにアカウントをお持ちですか？
                </p>
                <NavLink
                    className="block w-full border border-outline-variant text-primary font-bold py-3 rounded-md hover:bg-surface-container transition-colors duration-200"
                    to="/sign-in"
                >
                    ログイン
                </NavLink>
            </section>
        </>
    );
};
