# K6 lab results

## Part 0
- Step 0.1, http_req_duration: 296.02ms
- Step 0.2, requests, rate and p(95), and why the rate stays below 5: 70 requests, 3.35 requests/s, p(95) = 1.28 s. One iteration is not only the request. It is a request of about 0.42 s on average plus sleep(1), so an iteration takes about 1.47 s (iteration_duration avg). One VU therefore completes about 0.68 iterations/s, and 5 VUs give about 5 / 1.47 ≈ 3.4 requests/s, which is below 5.
- Step 0.6, exit code of the normal run and of the run with P95=300: normal run = 0 (all thresholds passed, p(95) = 949.92 ms < 1500). Run with P95=300 = 99 (p(95) = 789.52 ms crossed the threshold p(95)<300).
- Step 0.7, rules that passed, p(95), p(99), exit code after your change: all rules passed: http_req_failed rate<0.01 (0.00%), checks rate>0.99 (100%), p(95)<1000 (p(95) = 486.31 ms), p(99)<1500 (p(99) = 719.7 ms). After changing the p(95) limit from 1000 to 100 (-e P95=100), the p(95) rule failed (p(95) = 507.81 ms) and the exit code was 99.
- Step 0.8, what was wrong, and how the checks showed it: I wrote the exclusions in lowercase ('pepperoni', 'knife'), but the API names start with a capital letter ('Pepperoni', 'Knife'), as explore.js showed. The API did not recognise them and ignored the exclusions, so it returned random pizzas. The checks showed it: "no pepperoni" failed 8 times and "no knife needed" failed 29 times. After I changed them to 'Pepperoni' and 'Knife', all 225 checks passed. One manual request can pass by luck because the pizza is random, but with many requests under load the failures show up clearly.

## Part A results
| Step | Test type    | Users | Req/s | p(95) | Max | Failed | Checks |
| ---- | ------------ | ----- | ----- | ----- | --- | ------ | ------ |
| A1   | Smoke        | 1     |       |       |     |        |        |
| A2   | Average load | 3     |       |       |     |        |        |
| A3   | Stress       | 5     |       |       |     |        |        |
| A4   | Spike        | 5     |       |       |     |        |        |
| A5   | Soak         | 2     |       |       |     |        |        |

## Part B
1.
2.
3.
4.
5.
6.
7.
8.
9.