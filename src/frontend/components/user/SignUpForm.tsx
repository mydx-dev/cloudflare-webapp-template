import { routes } from '@/../shared/routes';
import { useSignupUser } from '@/hooks/useSignupUser';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader, LockKeyhole, Mail, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ErrorResolutionAlert } from '../ui/ErrorResolutionAlert';
import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '../ui/field';
import { Input } from '../ui/input';
import { PasswordInput } from './PasswordInput';
import { passwordRule } from './rules';

const signupFormSchema = z
    .object({
        name: z.string().min(1, '名前は必須です'),
        email: z.email({ message: '正しいメールアドレスを入力してください' }),
        password: passwordRule,
        confirmPassword: z.string(),
    })
    .required()
    .refine((data) => data.password === data.confirmPassword, {
        message: 'パスワードと確認用パスワードが一致しません',
        path: ['confirmPassword'],
    });

type SignupFormValues = z.infer<typeof signupFormSchema>;

export const SignUpForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupFormSchema),
        mode: 'onChange',
    });
    const {
        mutation: { mutate, isPending, error },
    } = useSignupUser();
    const navigate = useNavigate();

    return (
        <Card>
            <CardContent className="p-8 w-full max-w-2xl mx-auto">
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit((data) =>
                        mutate(data, {
                            onSuccess: () => navigate(routes.home),
                        })
                    )}
                >
                    {error && <ErrorResolutionAlert errorResolution={error} />}
                    <FieldGroup>
                        <Field>
                            <FieldLabel
                                htmlFor="name"
                                className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1"
                                required
                            >
                                名前
                            </FieldLabel>
                            <FieldContent className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors">
                                    <User className="h-5 w-5" />
                                </span>
                                <Input
                                    id="name"
                                    className="pl-12"
                                    placeholder="山田 太郎"
                                    type="text"
                                    {...register('name')}
                                />
                            </FieldContent>
                            <FieldError
                                errors={errors.name ? [errors.name] : undefined}
                            />
                        </Field>
                        <Field>
                            <FieldLabel
                                htmlFor="email"
                                className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1"
                                required
                            >
                                メールアドレス
                            </FieldLabel>
                            <FieldContent className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors">
                                    <Mail className="h-5 w-5" />
                                </span>
                                <Input
                                    id="email"
                                    className="pl-12"
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
                        <Field>
                            <FieldLabel
                                htmlFor="password"
                                className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1"
                                required
                            >
                                パスワード
                            </FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    id="password"
                                    placeholder="••••••••"
                                    {...register('password')}
                                    leftIcon={
                                        <LockKeyhole className="h-5 w-5" />
                                    }
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
                        <Field>
                            <FieldLabel htmlFor="confirmPassword" required>
                                パスワードの確認
                            </FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    {...register('confirmPassword')}
                                    leftIcon={
                                        <LockKeyhole className="h-5 w-5" />
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
                    </FieldGroup>
                    <Button
                        size="xl"
                        className="w-full flex items-center justify-center gap-2"
                        type="submit"
                        disabled={isPending || !isValid}
                    >
                        <span>新規登録</span>
                        {isPending && (
                            <Loader className="ml-2 h-4 w-4 animate-spin" />
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
