import { Spinner } from '@/components/ui/spinner';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, CircleAlert, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '../components/ui/field';
import { PasswordInput } from '../components/user/PasswordInput';
import { passwordRule } from '../components/user/rules';
import { useResetPassword } from '../hooks/useResetPassword';

const resetPasswordFormSchema = z
    .object({
        newPassword: passwordRule,
        confirmPassword: z.string(),
    })
    .required()
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'パスワードと確認用パスワードが一致しません',
        path: ['confirmPassword'],
    });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

const newPasswordInputId = 'reset-password-new-password';
const confirmPasswordInputId = 'reset-password-confirm-password';
const invalidTokenMessage =
    'パスワード再設定リンクが無効、または期限切れです。再度パスワード再設定をお試しください。';
const fallbackErrorMessage =
    'パスワードの再設定に失敗しました。再度お試しください。';

const InvalidTokenMessage = () => {
    return (
        <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(0,32,69,0.08)] relative overflow-hidden">
            <div
                className="mb-6 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4 text-red-600"
                role="alert"
            >
                <CircleAlert />
                <p className="text-xs font-semibold leading-relaxed">
                    {invalidTokenMessage}
                </p>
            </div>
            <NavLink
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                to="/forgot-password"
            >
                <ArrowLeft />
                再設定メールを再送する
            </NavLink>
        </section>
    );
};

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

export const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token') || '';
    const tokenError = queryParams.get('error');

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordFormSchema),
        mode: 'onChange',
    });

    const { mutateAsync, isPending, isError, error } = useResetPassword();
    const errorMessage =
        error instanceof Error ? error.message : fallbackErrorMessage;

    if (!token || tokenError === 'INVALID_TOKEN') {
        return <InvalidTokenMessage />;
    }

    return (
        <>
            {/* Form Card (The Digital Curator Style) */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(0,32,69,0.08)] relative overflow-hidden">
                <div className="mb-8">
                    <h2 className="font-headline font-bold text-2xl text-primary leading-tight">
                        新しいパスワードの設定
                    </h2>
                    <p className="text-on-surface-variant mt-2 text-sm">
                        新しいパスワードを入力してください。
                    </p>
                </div>
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit(async (data) => {
                        try {
                            await mutateAsync({
                                token,
                                newPassword: data.newPassword,
                            });
                            navigate('/sign-in', { replace: true });
                        } catch {
                            return;
                        }
                    })}
                >
                    {isError && <FormErrorMessage message={errorMessage} />}
                    <FieldGroup>
                        {/* Password Field 1 */}
                        <Field className="space-y-2">
                            <FieldLabel
                                htmlFor={newPasswordInputId}
                                className="block font-label font-semibold text-xs uppercase tracking-wider text-on-surface-variant px-1"
                                required
                            >
                                新しいパスワード
                            </FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    id={newPasswordInputId}
                                    placeholder="••••••••"
                                    {...register('newPassword')}
                                />
                            </FieldContent>
                            <FieldError
                                errors={
                                    errors.newPassword
                                        ? [errors.newPassword]
                                        : undefined
                                }
                            />
                        </Field>
                        {/* Password Field 2 */}
                        <Field className="space-y-2">
                            <FieldLabel
                                htmlFor={confirmPasswordInputId}
                                className="block font-label font-semibold text-xs uppercase tracking-wider text-on-surface-variant px-1"
                                required
                            >
                                パスワードの確認
                            </FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    id={confirmPasswordInputId}
                                    placeholder="••••••••"
                                    {...register('confirmPassword')}
                                    leftIcon={
                                        <span className="material-symbols-outlined">
                                            verified_user
                                        </span>
                                    }
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
                        {/* Password Requirements Hint (Asymmetric metadata) */}
                        <div className="bg-highlight rounded-xl p-4 flex items-center gap-3">
                            <Info />
                            <ul className="text-[11px] leading-relaxed text-on-surface-variant space-y-1">
                                <li className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-tertiary-fixed"></span>
                                    8文字以上且つ、1文字以上の大文字を含める必要があります
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-tertiary-fixed"></span>
                                    数字を含めてください
                                </li>
                            </ul>
                        </div>
                    </FieldGroup>
                    {/* Action Button (Premium Gradient) */}
                    <button
                        className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-xl shadow-lg enabled:active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={!isValid || isPending}
                    >
                        <span>パスワードを保存</span>
                        {isPending ? <Spinner /> : <ArrowRight />}
                    </button>
                </form>
                {/* Back to Login (Subtle Tonal Link) */}
                <div className="mt-8 pt-6 border-t border-highlight text-center">
                    <NavLink
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                        to="/sign-in"
                    >
                        <ArrowLeft />
                        ログインに戻る
                    </NavLink>
                </div>
            </section>
        </>
    );
};
