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
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { NavLink } from 'react-router-dom';
import { z } from 'zod';
import { emailRule, passwordRule } from '../components/user/rules';

const loginFormSchema = z.object({
    email: emailRule,
    password: passwordRule,
});

export const LoginPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        getValues,
    } = useForm({
        resolver: zodResolver(loginFormSchema),
        mode: 'onChange',
    });

    const { mutate, isPending, isError, error } = useLoginUser(
        getValues('email'),
        getValues('password')
    );

    return (
        <>
            <section className="rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(0,32,69,0.08)] relative overflow-hidden">
                {/* Decorative Subtle Accent */}

                <div className="relative z-10">
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(() => mutate())}
                    >
                        {isError && (
                            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600">
                                <span className="material-symbols-outlined text-xl flex-shrink-0 mt-0.5">
                                    error
                                </span>
                                <p className="text-xs font-semibold leading-relaxed">
                                    {error instanceof Error
                                        ? error.message
                                        : 'ログインに失敗しました。再度お試しください。'}
                                </p>
                            </div>
                        )}

                        {/* Email Field */}
                        <Field className="space-y-2">
                            <FieldLabel
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
                                    className={`w-full bg-highlight border-none rounded-xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-surface-tint/20 transition-all text-on-surface placeholder:text-outline/50`}
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
            <section className="mt-8 text-center px-4">
                <p className="text-on-surface-variant text-sm mb-4">
                    アカウントをお持ちでないですか？
                </p>
                <NavLink
                    className="block w-full border border-primary text-primary font-bold py-3 rounded-md hover:bg-primary hover:text-on-primary transition-colors duration-200 text-center"
                    to="/users/new"
                >
                    新規登録
                </NavLink>
            </section>
        </>
    );
};
