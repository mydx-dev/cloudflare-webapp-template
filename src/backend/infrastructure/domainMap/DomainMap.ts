import { invitationMap } from './invitationMap';
import { userMap } from './userMap';

export const domainMap = {
    user: userMap,
    invitation: invitationMap,
};

export type DomainMap = typeof domainMap;
