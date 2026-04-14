def water_jug_dfs(m, n, d, goal):
    solutions = []
    def dfs(jug1, jug2, path, visited):
        if (jug1, jug2) in visited:
            return
        visited.add((jug1, jug2))
        path.append((jug1, jug2))
        if (jug1, jug2) == goal:
            solutions.append(path.copy())
            path.pop()
            return
        actions = [
            (m, jug2),  
            (jug1, n),  
            (0, jug2),  
            (jug1, 0),  
            (max(0, jug1 - (n - jug2)), min(n, jug1 + jug2)),  
            (min(m, jug1 + jug2), max(0, jug2 - (m - jug1)))  
        ]
        for state in actions:
            dfs(state[0], state[1], path, visited.copy())
        path.pop()
    dfs(0, 0, [], set())
    return solutions
m = int(input("Enter capacity of Jug 1 (m): "))
n = int(input("Enter capacity of Jug 2 (n): "))
d = int(input("Enter desired amount (d): "))
goal_input = input("Enter goal state in format <x,y>: ")
goal = tuple(map(int, goal_input.strip("<>").split(",")))
if goal[0] < 0 or goal[1] < 0 or goal[0] > m or goal[1] > n:
    print("\n Invalid goal state")
elif goal[0] != d and goal[1] != d:
    print("\n Invalid goal state (d not present)")
else:
    solutions = water_jug_dfs(m, n, d, goal)
    if not solutions:
        print("\n No solution found")
    else:
        best_solution = min(solutions, key=len)
        print("\n\nBEST SOLUTION (Minimum Steps):")
        print(best_solution)
        print(f"Total steps: {len(best_solution)-1}")