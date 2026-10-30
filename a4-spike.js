import { journey } from './journey.js';

export const options = {
    startVUs: 1,
    stages: [
        { duration: '30s', target: 1 }, // 1 user for 30 s
        { duration: '5s', target: 5 },  // jump to 5 users (the spike)
        { duration: '30s', target: 5 }, // hold 5 users
        { duration: '5s', target: 1 },  // drop back to 1
        { duration: '1m', target: 1 },  // recovery period
        { duration: '10s', target: 0 }, // ramp down
    ],
    thresholds: {
        checks: ['rate>0.99'],
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    journey();
}