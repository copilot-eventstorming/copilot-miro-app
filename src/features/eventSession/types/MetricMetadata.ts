export class MetricMetadata {
    constructor(
        public metricName: string,
        public metricOptions: MetricOption[]
    ) {
    }
}

export class MetricOption {
    constructor(
        public title: string,
        public value: number
    ) {
    }
}