export class JapaneseDate {
    constructor(private readonly date: Date) {}

    public yyyyMMdd(): string {
        const year = this.date.getFullYear();
        const month = this.date.getMonth() + 1;
        const day = this.date.getDate();

        return `${year}年${month}月${day}日`;
    }

    public yyyyMMddHHmm(): string {
        const year = this.date.getFullYear();
        const month = this.date.getMonth() + 1;
        const day = this.date.getDate();
        const hours = this.date.getHours();
        const minutes = this.date.getMinutes();

        return `${year}年${month}月${day}日 ${hours}時${minutes}分`;
    }
}
