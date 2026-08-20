import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Field,
    FieldContent,
    FieldError,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ErrorResolutionAlert } from '../ui/ErrorResolutionAlert';
import { toast } from '../ui/toast';

const forgotPasswordFormSchema = z.object({
    email: z.email({ message: '有効なメールアドレスを入力してください' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const ForgotPasswordForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordFormSchema),
        mode: 'onChange',
    });

    const { mutate, isPending, error } = useForgotPassword();

    return (
        <Card className="p-8 w-full max-w-2xl mx-auto">
            <CardContent>
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit((values) =>
                        mutate(values, {
                            onSuccess: () =>
                                toast.add({
                                    title: 'パスワード再設定メールを送信しました',
                                    description: `${values.email} にパスワード再設定メールを送信しました。`,
                                    type: 'success',
                                }),
                        })
                    )}
                >
                    {error && <ErrorResolutionAlert errorResolution={error} />}
                    {/* Input Field Group */}
                    <Field className="space-y-2">
                        <FieldLabel htmlFor="email" required>
                            メールアドレス
                        </FieldLabel>
                        <FieldContent className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl group-focus-within:text-primary transition-colors">
                                <Mail className="w-5 h-5" />
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
                            errors={errors.email ? [errors.email] : undefined}
                        />
                    </Field>
                    {/* Primary Action Button */}
                    <Button
                        className="w-full justify-center gap-2"
                        size="xl"
                        type="submit"
                        disabled={!isValid || isPending}
                    >
                        <span>再設定メールを送信</span>
                        {isPending ? <Spinner /> : <Send />}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
