export class DomainTranslation<TDomain, TRecord> {
    constructor(
        public readonly name: string,
        private readonly serialize: (domain: TDomain) => TRecord,
        private readonly deserialize: (record: TRecord) => TDomain
    ) {}

    toDomain(record: TRecord): TDomain {
        return this.deserialize(record);
    }

    toDomains(records: TRecord[]): TDomain[] {
        return records.map((record) => this.deserialize(record));
    }

    toRecords(domains: TDomain[]): TRecord[] {
        return domains.map((domain) => this.serialize(domain));
    }

    toRecord(domain: TDomain): TRecord {
        return this.serialize(domain);
    }
}
