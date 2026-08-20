export const routes = {
    invitation: {
        accept: '/invitations/accept',
        list: '/invitations',
        create: '/invitations/new',
    },
    user: {
        list: '/users',
        detail: {
            path: '/users/:userId',
            build: (userId: string) => `/users/${userId}`,
        },
        signup: '/sign-up',
        signin: '/sign-in',
        forgotPassword: '/forgot-password',
        resetPassword: '/reset-password',
    },
    home: '/',
};
