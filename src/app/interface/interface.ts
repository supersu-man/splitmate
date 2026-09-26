export interface Group {
    id: string
    name: string
    thumbnail: string
    members: Member[]
    expenses: Expense[]
}

export interface Member {
    id: string
    name: string
}

export interface Expense {
    id: string
    amount: number
    description: string
    paidBy: string,
    date: Date,
    shares: { id: string, amount: number, share: number, fixed: boolean }[]
}

export interface Settlement {
    from: string
    to: string
    amount: number
}