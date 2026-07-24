export const isPublicSignUpEnabled = () => {
    return import.meta.env.VITE_SIGN_UP_ENABLED === 'true';
};
