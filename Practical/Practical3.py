graph = {
    'S': [('A', 1), ('D', 13)],
    'A': [('B', 2), ('C', 5)],
    'B': [('C', 2)],
    'C': [('D', 3)],
    'D': []
}
h = {'S': 7, 'A': 6, 'B': 2, 'C': 1, 'D': 0}
def astar(start, goal):
    open_list = [start]
    cost = {start: 0}
    parent = {start: None}

    while open_list:
        current = open_list[0]

        for n in open_list:
            if cost[n] + h[n] < cost[current] + h[current]:
                current = n

        open_list.remove(current)

        if current == goal:
            path = []
            while current:
                path.append(current)
                current = parent[current]
            return path[::-1], cost[goal]

        for next_node, w in graph[current]:
            cost[next_node] = cost[current] + w
            parent[next_node] = current
            open_list.append(next_node)

def bfs(start, goal):
    queue = [start]
    parent = {start: None}
    cost = {start: 0}

    while queue:
        current = queue.pop(0)

        if current == goal:
            path = []
            while current:
                path.append(current)
                current = parent[current]
            return path[::-1], cost[goal]

        for next_node, w in graph[current]:
            if next_node not in parent:
                parent[next_node] = current
                cost[next_node] = cost[current] + w
                queue.append(next_node)


start = input("Start node: ")
goal = input("Goal node: ")

a_path, a_cost = astar(start, goal)
b_path, b_cost = bfs(start, goal)

print("\nA* Path:", a_path)
print("A* Cost:", a_cost)

print("\nBFS Path:", b_path)
print("BFS Cost:", b_cost)