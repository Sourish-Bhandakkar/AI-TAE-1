def print_board(board):
    print()
    print(f" {board[0]} | {board[1]} | {board[2]} ")
    print("-----------")
    print(f" {board[3]} | {board[4]} | {board[5]} ")
    print("-----------")
    print(f" {board[6]} | {board[7]} | {board[8]} ")
    print()
def check_winner(board):
    win_conditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]            
    ]
    for condition in win_conditions:
        if board[condition[0]] == board[condition[1]] == board[condition[2]] != " ":
            return board[condition[0]]
    return None
def main():
    board = [" "] * 9
    current_player = "X"
    print("Welcome to Tic-Tac-Toe!")
    print("Positions are 0-8 starting from the top left.")
    for turn in range(9):
        print_board(board)
        while True:
            try:
                move = int(input(f"Player {current_player}, enter position (0-8): "))
                if 0 <= move <= 8 and board[move] == " ":
                    board[move] = current_player
                    break
                else:
                    print("Invalid move. Try again.")
            except ValueError:
                print("Please enter a number between 0 and 8.")
        winner = check_winner(board)
        if winner:
            print_board(board)
            print(f"Congratulations! Player {winner} wins!")
            return
        current_player = "O" if current_player == "X" else "X"
    print_board(board)
    print("It's a draw!")
if __name__ == "__main__":
    main()