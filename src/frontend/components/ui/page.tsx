export const PageDescription = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return <p className="text-sm text-muted-foreground my-2">{children}</p>;
};
export const PageTitle = ({ children }: { children: React.ReactNode }) => {
    return (
        <h2 className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance text-primary">
            {children}
        </h2>
    );
};
export const PageTitleContainer = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-md">
            {children}
        </div>
    );
};
