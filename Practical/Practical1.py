def generate_magic_square(n):
    magic_square = [[0] * n for _ in range(n)]
    row = 0
    col = n//2

    for num in range(1,n**2+1):
        magic_square[row][col] = num

        new_row = (row-1) % n 
        new_col = (col+1) % n

        if magic_square[new_row][new_col]!=0:
            row = (row + 1)%n
        else:
            row,col = new_row,new_col

    return magic_square

n = 3
magic_constant = n*(n**2+1)//2
print("Magic Constant is: ",magic_constant)
square = generate_magic_square(n)
for r in square:
    print(r)