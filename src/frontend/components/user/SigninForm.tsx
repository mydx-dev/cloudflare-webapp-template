import { Button } from '@/components/ui/button';
import {
    Field,
    FieldContent,
    FieldError,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/user/PasswordInput';
import { useLoginUser } from '@/hooks/useLoginUser';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader, LockKeyhole, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { routes } from '../../../shared/routes';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent } from '../ui/card';

const loginFormSchema = z.object({
    email: z.email({ message: '正しいメールアドレスを入力してください' }),
    password: z.string().min(1, 'パスワードを入力してください'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const SigninForm = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        mode: 'onChange',
    });

    const { mutate, isPending, error } = useLoginUser();

    return (
        <Card className="p-8">
            <CardContent>
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit((data) => {
                        mutate(data, {
                            onSuccess: () => {
                                navigate(routes.home);
                            },
                        });
                    })}
                >
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>エラー</AlertTitle>
                            <AlertDescription>{error.message}</AlertDescription>
                        </Alert>
                    )}

                    <Field>
                        <FieldLabel
                            htmlFor="email"
                            className="font-label text-xs font-bold px-1"
                            required
                        >
                            メールアドレス
                        </FieldLabel>
                        <FieldContent className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors">
                                <Mail className="w-5 h-5" />
                            </span>
                            <Input
                                id="email"
                                placeholder="user@example.com"
                                className="pl-12"
                                type="email"
                                {...register('email')}
                            />
                        </FieldContent>
                        <FieldError
                            errors={errors.email ? [errors.email] : undefined}
                        />
                    </Field>

                    <Field className="space-y-2">
                        <div className="flex justify-between items-end px-1">
                            <FieldLabel
                                htmlFor="password"
                                className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                                required
                            >
                                パスワード
                            </FieldLabel>
                            <NavLink
                                className="text-xs font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors"
                                to={routes.user.forgotPassword}
                            >
                                パスワードを忘れた場合
                            </NavLink>
                        </div>
                        <FieldContent>
                            <PasswordInput
                                id="password"
                                placeholder="••••••••"
                                leftIcon={<LockKeyhole className="w-5 h-5" />}
                                {...register('password')}
                            />
                        </FieldContent>
                        <FieldError
                            errors={
                                errors.password ? [errors.password] : undefined
                            }
                        />
                    </Field>
                    {/* Login Button */}
                    <Button
                        type="submit"
                        disabled={!isValid || isPending}
                        className="w-full"
                        size="xl"
                    >
                        ログイン
                        {isPending && (
                            <Loader className="w-5 h-5 animate-spin text-primary" />
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
