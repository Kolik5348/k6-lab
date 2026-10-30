# K6 lab results

## Part 0
- Step 0.1, http_req_duration: 296.02ms
- Step 0.2, requests, rate and p(95), and why the rate stays below 5: 70 requests, 3.35 requests/s, p(95) = 1.28 s. One iteration is not only the request. It is a request of about 0.42 s on average plus sleep(1), so an iteration takes about 1.47 s (iteration_duration avg). One VU therefore completes about 0.68 iterations/s, and 5 VUs give about 5 / 1.47 ≈ 3.4 requests/s, which is below 5.
- Step 0.6, exit code of the normal run and of the run with P95=300: normal run = 0 (all thresholds passed, p(95) = 949.92 ms < 1500). Run with P95=300 = 99 (p(95) = 789.52 ms crossed the threshold p(95)<300).
- Step 0.7, rules that passed, p(95), p(99), exit code after your change: all rules passed: http_req_failed rate<0.01 (0.00%), checks rate>0.99 (100%), p(95)<1000 (p(95) = 486.31 ms), p(99)<1500 (p(99) = 719.7 ms). After changing the p(95) limit from 1000 to 100 (-e P95=100), the p(95) rule failed (p(95) = 507.81 ms) and the exit code was 99.
- Step 0.8, what was wrong, and how the checks showed it: I wrote the exclusions in lowercase ('pepperoni', 'knife'), but the API names start with a capital letter ('Pepperoni', 'Knife'), as explore.js showed. The API did not recognise them and ignored the exclusions, so it returned random pizzas. The checks showed it: "no pepperoni" failed 8 times and "no knife needed" failed 29 times. After I changed them to 'Pepperoni' and 'Knife', all 225 checks passed. One manual request can pass by luck because the pizza is random, but with many requests under load the failures show up clearly.

## Part A results
| Step | Test type    | Users | Req/s | p(95)    | Max      | Failed | Checks            |
| ---- | ------------ | ----- | ----- | -------- | -------- | ------ | ----------------- |
| A1   | Smoke        | 1     | 0.50  | 351.32ms | 364.69ms | 0.00%  | 100.00% (24/24)   |
| A2   | Average load | 3     | 1.30  | 419.21ms | 1.01s    | 0.00%  | 100.00% (316/316) |
| A3   | Stress       | 5     | 2.07  | 630.7ms  | 1.96s    | 0.00%  | 100.00% (512/512) |
| A4   | Spike        | 5     | 1.03  | 443.42ms | 867.36ms | 0.00%  | 100.00% (196/196) |
| A5   | Soak         | 2     | 0.96  | 534.01ms | 3.71s    | 0.00%  | 100.00% (848/848) |

## Part B
1. See the results table in Part A above.

2. In Step 0.2 the rate was 3.35 requests/s, not 5. One iteration is not only a request. It is a request of about 0.42 s plus sleep(1), so an iteration takes about 1.47 s. One VU makes about 0.68 requests/s, and 5 VUs make about 3.4 requests/s.

3. Yes, the response time grew. p(95) went from 419 ms (A2, 3 users) to 631 ms (A3, 5 users), and max went from 1.01 s to 1.96 s. It is still far below the thresholds (1000 ms for home, 1500 ms for recommendation), and there were 0.00% failures and 100% checks. So 5 users is still inside the operational envelope. The system slows down a little as load grows, but it does not fail. We cannot see where the edge of the envelope is, because we are limited to 5 users on a public site.

4. The spike was small. p(95) for the whole run was 443 ms, and max was 867 ms, compared with about 260-330 ms normally. In the report, the response time rose at the jump to 5 users and was back to its earlier level soon after the drop to 1 user, within about 10 seconds. There were no failed requests.

5. Neither got clearly worse. The error rate stayed at 0.00% and checks stayed at 100% (848/848). The overall p(95) was 534 ms, similar to the other tests. The max of 3.71 s was a single slow request, not a steady upward trend. A soak test of several hours could reveal a memory leak, or running out of database connections or disk space.

6. The average hides the slowest users. In the soak test the average was 351 ms but the max was 3.71 s. p(95) shows what the slow 5% of requests experience, and a requirement such as "95% of requests within 1 second" is closer to what users feel.

7. First, the network: over the internet the latency changes with distance, routing and time of day, while a lab network is close and stable. Second, other load: the public site is shared with many other people running tests at the same time, while in a lab only our test uses the system, and the hardware can also be different.

8. Hundreds of users sent to a site we do not own can slow it down or take it down for its real users. It looks like a denial-of-service attack, it may cost the owner money, and without written permission it can be illegal.

9. Vague requirement: "The food delivery app should open the restaurant list quickly."
   Testable requirement: with 50 users at the same time for 5 minutes, the restaurant list API answers 95% of requests within 800 ms and 99% within 2 seconds, and fewer than 1% of requests fail.
   ```js
   export const options = {
     vus: 50,
     duration: '5m',
     thresholds: {
       http_req_duration: ['p(95)<800', 'p(99)<2000'],
       http_req_failed: ['rate<0.01'],
     },
   };
   ```