import { routes } from '@/../shared/routes';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { useResetPassword } from '@/hooks/useResetPassword';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Card, CardContent } from '../ui/card';
import { ErrorResolutionAlert } from '../ui/ErrorResolutionAlert';
import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '../ui/field';
import { PasswordInput } from './PasswordInput';
import { passwordRule } from './rules';

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

export const ResetPasswordForm = ({ token }: { token: string }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordFormSchema),
        mode: 'onChange',
    });

    const {
        mutation: { mutate, isPending, error },
    } = useResetPassword();
    const navigate = useNavigate();

    return (
        <Card>
            <CardContent>
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit(async (data) => {
                        mutate(
                            { token, newPassword: data.newPassword },
                            {
                                onSuccess: () => {
                                    const toastId = toast.add({
                                        title: 'パスワードリセット完了',
                                        description:
                                            'パスワードのリセットが完了しました。ログインしてください。',
                                        type: 'success',
                                        actionProps: {
                                            children: 'ログイン画面へ',
                                            onClick: () => {
                                                toast.close(toastId);
                                                navigate(routes.user.signin);
                                            },
                                        },
                                    });
                                },
                            }
                        );
                    })}
                >
                    {error && <ErrorResolutionAlert errorResolution={error} />}
                    <FieldGroup>
                        {/* Password Field 1 */}
                        <Field className="space-y-2">
                            <FieldLabel
                                htmlFor="newPassword"
                                className="block font-label font-semibold text-xs uppercase tracking-wider text-on-surface-variant px-1"
                                required
                            >
                                新しいパスワード
                            </FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    id="newPassword"
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
                                htmlFor="confirmPassword"
                                className="block font-label font-semibold text-xs uppercase tracking-wider text-on-surface-variant px-1"
                                required
                            >
                                パスワードの確認
                            </FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    id="confirmPassword"
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
                    {/* Action Button (Premium Gradient) */}
                    <Button
                        size="xl"
                        className="w-full justify-center gap-2"
                        type="submit"
                        disabled={!isValid || isPending}
                    >
                        <span>パスワードをリセット</span>
                        {isPending && (
                            <Loader
                                className="ml-2 h-4 w-4 animate-spin"
                                role="status"
                                aria-label="送信中"
                            />
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
