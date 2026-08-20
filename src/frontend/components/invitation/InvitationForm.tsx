import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCreateInvitation } from '@/hooks/useCreateInvitation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader, Send } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ErrorResolutionAlert } from '../ui/ErrorResolutionAlert';
import { toast } from '../ui/toast';

const formSchema = z.object({
    email: z.email({ message: 'メールアドレスが不正です' }),
    role: z.enum(['admin', 'user']),
});

const roles = [
    { value: 'admin', label: '管理者' },
    { value: 'user', label: 'ユーザー' },
];

export const InvitationForm = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
    });

    const {
        mutation: { isPending, mutate, error },
    } = useCreateInvitation();

    return (
        <Card className="p-8 w-full max-w-2xl mx-auto">
            <CardContent>
                {error && <ErrorResolutionAlert errorResolution={error} />}
                <form
                    onSubmit={handleSubmit((data) =>
                        mutate(data, {
                            onSuccess: () =>
                                toast.add({
                                    title: '招待完了',
                                    description: `招待メールを${data.email}に送信しました`,
                                    type: 'success',
                                }),
                        })
                    )}
                    className="flex flex-col gap-md"
                >
                    <Field>
                        <FieldLabel required htmlFor="email">
                            メールアドレス
                        </FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            {...register('email')}
                        />
                        {errors.email && (
                            <FieldError>{errors.email.message}</FieldError>
                        )}
                    </Field>
                    <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel required htmlFor="role">
                                    ロール
                                </FieldLabel>
                                <Select
                                    items={roles}
                                    value={field.value ?? ''}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="w-full" id="role">
                                        <SelectValue placeholder="ロールを選択" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role.value}
                                                    value={role.value}
                                                >
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <FieldError>
                                        {errors.role.message}
                                    </FieldError>
                                )}
                            </Field>
                        )}
                    />
                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        size="xl"
                        disabled={isPending || !isValid}
                    >
                        招待メールを送信
                        {isPending ? (
                            <Loader className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
