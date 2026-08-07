import type { Auth } from '../../lib/auth/auth';

export class ListUserUseCase {
    constructor(private readonly auth: Auth) {}

    async execute(input: {
        headers: Headers;
        limit?: number;
        offset?: number;
        page?: number;
        searchField?: 'email' | 'name';
        searchValue?: string;
        status?: 'active' | 'banned';
    }) {
        const limit = input.limit ?? 10;
        const offset =
            input.offset ?? (input.page ? (input.page - 1) * limit : 0);

        return this.auth.api.listUsers({
            headers: input.headers,
            query: {
                limit,
                offset,
                sortBy: 'createdAt',
                sortDirection: 'desc',
                ...(input.searchValue
                    ? {
                          searchValue: input.searchValue,
                          searchField: input.searchField ?? 'email',
                          searchOperator: 'contains' as const,
                      }
                    : {}),
                ...(input.status === 'active'
                    ? {
                          filterField: 'banned',
                          filterValue: false,
                          filterOperator: 'eq' as const,
                      }
                    : {}),
                ...(input.status === 'banned'
                    ? {
                          filterField: 'banned',
                          filterValue: true,
                          filterOperator: 'eq' as const,
                      }
                    : {}),
            },
        });
    }
}
