from itertools import permutations
def cryptoarithmetic():
    for perm in permutations(range(10), 8):
        S, E, N, D, M, O, R, Y = perm
        if S == 0 or M == 0:
            continue
        send = 1000 * S + 100 * E + 10 * N + D
        more = 1000 * M + 100 * O + 10 * R + E
        money = 10000 * M + 1000 * O + 100 * N + 10 * E + Y
        if send + more == money:
            print(" ", S, E, N, D)
            print("+", M, O, R, E)
            print("------")
            print(" ", M, O, N, E, Y)
            print("\nS=", S, "E=", E, "N=", N, "D=", D,
                "M=", M, "O=", O, "R=", R, "Y=", Y)
            return
cryptoarithmetic()