export interface MetricList {
    data: MetricListDetails;
}

export interface MetricListDetails {
    cpu: {
        usage: number;
    };
    db: {
        totalAttlogs: string;
        totalClocks: string;
        totalCustomers: string;
    };
    memory: {
        free: number;
        used: number;
    };
    uptime: number;
    queryFromClocks: number;
    queryToDatabase: number;
}
