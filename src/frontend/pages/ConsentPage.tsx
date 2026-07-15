import { useState } from 'react';
import { authClient } from '../lib/authClient';

export const ConsentPage = () => {
    const [error, setError] = useState<string | null>(null);

    const handleConsent = async (accept: boolean) => {
        setError(null);

        const result = await authClient.oauth2.consent({
            accept,
        });

        if (result.error) {
            setError(result.error.message ?? '認可処理に失敗しました');
            return;
        }

        window.location.href = result.data.url;
    };

    return (
        <main>
            <h1>アクセスの許可</h1>

            <p>
                このアプリケーションにタスク管理機能へのアクセスを許可しますか？
            </p>

            <button type="button" onClick={() => handleConsent(true)}>
                許可する
            </button>

            <button type="button" onClick={() => handleConsent(false)}>
                拒否する
            </button>

            {error && <p>{error}</p>}
        </main>
    );
};
