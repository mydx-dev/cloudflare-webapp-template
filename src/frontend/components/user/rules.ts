import { z } from 'zod';

export const emailRule = z.email('有効なメールアドレスを入力してください');

export const passwordRule = z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .max(128, 'パスワードは128文字以下で入力してください');
