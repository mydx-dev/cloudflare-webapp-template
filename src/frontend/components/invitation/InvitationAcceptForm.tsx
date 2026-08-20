import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/user/PasswordInput';
import { useAcceptInvitation } from '@/hooks/useAcceptInvitation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { ErrorResolutionAlert } from '../ui/ErrorResolutionAlert';
import { toast } from '../ui/toast';
import { passwordRule } from '../user/rules';

const invitationAcceptSchema = z
    .object({
        name: z.string().min(1, '名前は必須です'),
        password: passwordRule,
        passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        message: 'パスワードと確認用パスワードが一致しません',
        path: ['passwordConfirmation'],
    });

type InvitationAcceptFormData = z.infer<typeof invitationAcceptSchema>;

export const InvitationAcceptForm = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const {
        mutation: { mutate, error, isPending },
    } = useAcceptInvitation();
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<InvitationAcceptFormData>({
        resolver: zodResolver(invitationAcceptSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            password: '',
            passwordConfirmation: '',
        },
    });

    return (
        <Card className="p-8 w-full max-w-2xl mx-auto">
            <CardContent>
                {error && <ErrorResolutionAlert errorResolution={error} />}
                <form
                    onSubmit={handleSubmit((data) => {
                        if (!token) {
                            return;
                        }
                        mutate(
                            { token, name: data.name, password: data.password },
                            {
                                onSuccess: () => {
                                    // Handle success (e.g., navigate to login page)
                                    toast.add({
                                        title: '新規アカウントを登録できました',
                                        description:
                                            'ログインページにリダイレクトします',
                                    });
                                },
                            }
                        );
                    })}
                    className="space-y-4"
                >
                    <Field>
                        <FieldLabel htmlFor="name" required>
                            名前
                        </FieldLabel>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="名前を入力してください"
                        />
                        {errors.name && (
                            <FieldError>{errors.name.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password" required>
                            パスワード
                        </FieldLabel>
                        <PasswordInput
                            id="password"
                            type="password"
                            {...register('password')}
                            placeholder="パスワードを入力してください"
                        />
                        {errors.password && (
                            <FieldError>{errors.password.message}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="passwordConfirmation" required>
                            確認用パスワード
                        </FieldLabel>
                        <PasswordInput
                            id="passwordConfirmation"
                            type="password"
                            {...register('passwordConfirmation')}
                            placeholder="パスワードを再入力してください"
                        />
                        {errors.passwordConfirmation && (
                            <FieldError>
                                {errors.passwordConfirmation.message}
                            </FieldError>
                        )}
                    </Field>
                    <Button
                        type="submit"
                        size="xl"
                        className="w-full"
                        disabled={!isValid || isPending}
                    >
                        登録する
                        {isPending && (
                            <Loader className="ml-2 h-4 w-4 animate-spin" />
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
